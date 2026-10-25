import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {brainSettings,descriptor,outcome,validateInvocation,localEndpoint} from './contract.mjs';
import {checkedDirectory} from './codex-adapter.mjs';
import {LocalBrainError,localJSON,inspectLocalModel,checkContextBudget,nativeContextGuard,verifyNativeBudget} from './local-http.mjs';
import {toolFormat,formattedCall} from './tool-format.mjs';
import {referencedContext,expandContext,toolFeedback as feedbackText} from './context-presentation.mjs';
import {controlledMCP} from './mcp-client.mjs';
import {stagedLife} from './staged-life.mjs';
import {guidedLife} from './guided-life.mjs';
import {stepwiseLife} from './stepwise-life.mjs';
// Decode only the MCP transport envelope; preserve every field of the actual
// tool payload. Unsupported/multipart envelopes retain their original form.
export function modelToolResult(result){if(result&&Object.keys(result).every(k=>['content','isError'].includes(k))&&Array.isArray(result.content)&&result.content.length===1&&result.content[0]?.type==='text'&&Object.keys(result.content[0]).every(k=>['type','text'].includes(k))&&typeof result.content[0].text==='string'){let payload;try{payload=JSON.parse(result.content[0].text);}catch{payload=result.content[0].text;}return JSON.stringify({isError:result.isError===true,result:payload});}return JSON.stringify(result);}
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
export function createOllamaAdapter(config,{base,cwd,evidenceDir,onEvent=()=>{},settlementGraceMs=10000,toolNames=null,toolProtocol=undefined,toolFeedback='neutral',contextPresentation='original',generationSeed=undefined}={}){
 toolProtocol??=config?.tool_protocol??'native';
 if(generationSeed!==undefined&&!Number.isSafeInteger(generationSeed))throw Error('模型測試種子必須是整數。');
 if(!['neutral','legacy'].includes(toolFeedback)||!['original','referenced'].includes(contextPresentation))throw Error('未知情境呈現或工具回饋方式。');
 if(!['native','schema','staged','guided','stepwise'].includes(toolProtocol))throw Error('未知工具傳輸方式。');
 if(toolNames!==null&&(!Array.isArray(toolNames)||!toolNames.length||toolNames.some(n=>typeof n!=='string')||new Set(toolNames).size!==toolNames.length||!toolNames.includes('get_context')||!toolNames.includes('commit_cycle')))throw Error('縮小工具清單必須保留情境讀取及記憶提交，且不能重複。');
 const settings=brainSettings(config);if(settings.adapter!=='ollama-local')throw Error('本地接頭設定不符。');
 const binding=descriptor(settings),root=path.resolve(base),work=checkedDirectory(root,cwd),evidence=checkedDirectory(root,evidenceDir);
 return {binding,async execute(request){
  validateInvocation(request);if(!settings.enabled)throw Error('本地大腦尚未啟用。');
  const life=request.purpose==='life',scope=request.tools;
  if(life){localEndpoint(scope.endpoint);if(new URL(scope.endpoint).origin===localEndpoint(settings.endpoint))throw Error('模型與工具必須使用不同的服務。');scope.controller.assertAllowed(scope.lease);const current=scope.controller.store.get('lease');if(current?.cycle_id!==request.request_id||current.cycle_id!==scope.lease.cycle_id)throw Error('STALE_LEASE');if(path.resolve(scope.controller.store.dir)!==root||createHash('sha256').update(scope.token).digest('hex')!==current.token_hash)throw Error('跨個體租約或工具能力不符。');}
  const file=path.join(evidence,request.request_id+'.jsonl');fs.closeSync(fs.openSync(file,'wx'));
  const redact=s=>life?s.replaceAll(scope.token,'[CYCLE_CAPABILITY]'):s;
  const record=e=>fs.appendFileSync(file,redact(JSON.stringify({at:new Date().toISOString(),...e}))+'\n');
  const emit=e=>{record({type:'brain.lifecycle',...e});onEvent(Object.freeze(e));};
  let mcp,timer,graceTimer,cancelReason=null,inferenceSettled=true,inferenceSent=false,completed=false,text='',failure=null,identity=null,executionVerification=null;
  let usage={input_tokens:0,output_tokens:0},usageKnown=true,modelCalls=0,toolCalls=0;
  const abortFetch=new AbortController();
  const cancel=reason=>{if(cancelReason)return;cancelReason=reason;try{emit({phase:'cancel_requested',reason,request_id:request.request_id});}catch{}if(!inferenceSettled)graceTimer=setTimeout(()=>abortFetch.abort(),settlementGraceMs);};
  const abort=()=>cancel('ABORTED');
  request.signal?.addEventListener('abort',abort,{once:true});
  if(life){scope.task.cancel=reason=>cancel(typeof reason==='string'&&reason?reason:'CONTROL_CANCEL_UNSPECIFIED');scope.task.kind='brain:ollama-local';}
  const ensureLive=()=>{if(cancelReason)throw new LocalBrainError('cancelled','本輪已取消。');if(Date.now()>=request.deadline){cancel('DEADLINE_EXCEEDED');throw new LocalBrainError('cancelled','本輪已到期。');}if(life)scope.controller.assertAllowed(scope.lease);};
  let processConfirmed=true;
  try{
   record({type:'brain.invocation',binding,purpose:request.purpose,request_id:request.request_id,deadline:request.deadline,no_life_capability:!life});
   if(request.signal?.aborted)cancel('ABORTED');ensureLive();
   timer=setTimeout(()=>cancel('DEADLINE_EXCEEDED'),Math.max(1,request.deadline-Date.now()));
   emit({phase:'starting',request_id:request.request_id,purpose:request.purpose});
   identity=await inspectLocalModel(settings);ensureLive();record({type:'brain.local_model',...identity,validation:'model_metadata_verified_inference_not_yet_completed'});
   let definitions=[];
   if(life){
    mcp=controlledMCP({endpoint:scope.endpoint,token:scope.token,cwd:work,onChild:child=>{scope.task.child=child;scope.controller.registerTask(scope.lease.cycle_id,child.pid,{kind:'controlled-mcp',cancelability:'stdio_process_and_local_model_settlement',remote_cancel_confirmation:'not_applicable'});},onEvent:e=>emit({...e,request_id:request.request_id,purpose:request.purpose})});
    definitions=await mcp.initialize();ensureLive();if(toolNames){if(toolNames.some(n=>!definitions.some(t=>t.name===n)))throw Error('不能提供受控MCP未列出的工具。');definitions=definitions.filter(t=>toolNames.includes(t.name));record({type:'brain.tool_scope',names:definitions.map(t=>t.name),narrowed:true});}
   }
   const tools=definitions.map(t=>({type:'function',function:{name:t.name,description:t.description,parameters:t.inputSchema}}));
   const messages=[{role:'system',content:request.prompt},{role:'user',content:life?'請開始本輪。先呼叫 get_context，參數為空物件 {}，不要附加 request_id；後續只依當前工具 Schema 與實際回傳執行。':'請依上述要求提供回答。'}],failedCalls=new Set();
   const structured=life&&toolProtocol==='schema';
   if(structured)messages[0].content+='\n工具傳輸格式：每次只輸出一個 JSON 物件 {"name":"工具名稱","arguments":{工具參數}}，不要輸出其他文字。以下為完整工具定義：'+JSON.stringify(tools);
   if(!life||['native','schema'].includes(toolProtocol))record({type:'brain.tool_protocol',protocol:structured?'json_schema_single_tool':'native',changes_permissions:false});
   emit({phase:'running',request_id:request.request_id,purpose:request.purpose});
   const generate=async(messages,format,stage,offeredTools=[])=>{
    if(modelCalls>=17)throw new LocalBrainError('tool_limit','本輪模型呼叫已達既有上限。');
    ensureLive();checkContextBudget(messages,offeredTools,settings,identity);
    const current=await inspectLocalModel(settings);if(current.digest!==identity.digest||current.version!==identity.version)throw new LocalBrainError('model_changed','指定模型或服務版本已改變。');ensureLive();
    inferenceSent=true;inferenceSettled=false;modelCalls++;
    const response=await localJSON(settings.endpoint,'/api/chat',{body:{model:settings.model,messages,tools:offeredTools.length?offeredTools:undefined,format,stream:false,think:false,keep_alive:0,...(nativeContextGuard(identity)?{truncate:false,shift:false}:{}),options:{num_ctx:settings.context_tokens,num_predict:settings.max_output_tokens,...(generationSeed!==undefined?{seed:generationSeed}:{})}},signal:abortFetch.signal});
    if(response.done!==true||response.model!==settings.model)throw new LocalBrainError('incomplete','模型未確認完整完成或來源不符。',{uncertain:true});
    inferenceSettled=true;
    record({type:'brain.model_response',stage,call:modelCalls,done_reason:response.done_reason,input_tokens:response.prompt_eval_count??null,output_tokens:response.eval_count??null,total_duration_ns:response.total_duration??null,load_duration_ns:response.load_duration??null,prompt_duration_ns:response.prompt_eval_duration??null,output_duration_ns:response.eval_duration??null,tool_names:response.message?.tool_calls?.map(c=>c.function?.name)??[]});
    for(const [key,field]of [['input_tokens','prompt_eval_count'],['output_tokens','eval_count']]){if(Number.isSafeInteger(response[field])&&response[field]>=0)usage[key]+=response[field];else usageKnown=false;}
    if(nativeContextGuard(identity))record({type:'brain.context_verified',...verifyNativeBudget(response,settings)});
    ensureLive();if(response.done_reason!=='stop')throw new LocalBrainError('output_limit','模型未正常完成輸出，未將片段視為成功。');return response;
   };
   if(life&&['staged','guided','stepwise'].includes(toolProtocol)){
    const completedWrites=new Set();
    record({type:'brain.tool_protocol',protocol:toolProtocol==='stepwise'?'stepwise_single_action_source_handoff':toolProtocol==='guided'?'guided_action_recovery_verified_claims':'staged_action_content_memory',changes_permissions:false});
    const staged=await (toolProtocol==='stepwise'?stepwiseLife:toolProtocol==='guided'?guidedLife:stagedLife)({definitions,prompt:request.prompt,cycle:request.request_id,generate,record,execute:async(name,args)=>{
     ensureLive();const {request_id,...semanticArgs}=args,callKey=JSON.stringify(stable({name,args:semanticArgs}));if(failedCalls.has(callKey))throw new LocalBrainError('repeated_tool_error','重複失敗參數已停止，未重送。');
     const write=definitions.find(d=>d.name===name)?.annotations?.readOnlyHint!==true;
     if(write&&completedWrites.has(callKey))throw new LocalBrainError('repeated_write','相同寫入已有成功收據，未重複執行。');
     if(++toolCalls>16)throw new LocalBrainError('tool_limit','本輪工具次數已達既有上限。');
     const result=await mcp.tool(name,args);if(result.isError)failedCalls.add(callKey);else if(write)completedWrites.add(callKey);record({type:'brain.tool_result_size',tool:name,utf8_bytes:Buffer.byteLength(JSON.stringify(result)),is_error:result.isError===true});
     // Lossless transport unwrapping; no semantic content is invented.
     const decoded=JSON.parse(modelToolResult(result));return decoded;
    }});completed=true;text=staged.text;executionVerification=staged.verification??null;
   }
   while(!completed&&modelCalls<17){
    const response=await generate(messages,structured?toolFormat(definitions,modelCalls===0):undefined,'legacy',life&&!structured?tools:[]);
    const message=structured?formattedCall(response.message):response.message;if(!message||message.role!=='assistant'||typeof message.content!=='string')throw new LocalBrainError('invalid_output','模型訊息格式不正確。');
    const calls=message.tool_calls??[];if(!Array.isArray(calls)||calls.length>16)throw new LocalBrainError('invalid_output','模型工具清單格式不正確。');
    if(!life){if(calls.length)throw new LocalBrainError('tool_forbidden','請教與報告沒有生活工具權限。');text=message.content;completed=true;break;}
    if(!calls.length)throw new LocalBrainError('commit_missing','模型未提交本輪記憶，不把一般文字當作生活完成。');
    if(modelCalls===1&&(calls.length!==1||calls[0]?.function?.name!=='get_context'))throw new LocalBrainError('context_required','生活首先必須讀取自己的當前身份與記憶。');
    if(calls.some(c=>c?.function?.name==='commit_cycle')&&calls.length!==1)throw new LocalBrainError('invalid_output','記憶提交必須是獨立的最後一個工具動作。');
    const cleanCalls=calls.map(c=>{const f=c?.function;if(!f||typeof f.name!=='string'||!definitions.some(t=>t.name===f.name)||!f.arguments||typeof f.arguments!=='object'||Array.isArray(f.arguments))throw new LocalBrainError('tool_forbidden','模型提出未提供的工具或無效參數。');return {function:{name:f.name,arguments:f.arguments}};});
    messages.push(structured?{role:'assistant',content:response.message.content}:{role:'assistant',content:message.content,tool_calls:cleanCalls});
    for(const call of cleanCalls){ensureLive();const callKey=JSON.stringify(stable(call));if(failedCalls.has(callKey))throw new LocalBrainError('repeated_tool_error','模型重複提出相同失敗參數，已停止本輪；未猜改參數或繼續重送。');if(++toolCalls>16)throw new LocalBrainError('tool_limit','本輪工具次數已達既有上限。');
     const result=await mcp.tool(call.function.name,call.function.arguments);
     record({type:'brain.tool_result_size',tool:call.function.name,utf8_bytes:Buffer.byteLength(JSON.stringify(result),'utf8'),is_error:result.isError===true});
     if(result.isError)failedCalls.add(callKey);
     let content=modelToolResult(result);
     if(call.function.name==='get_context'&&!result.isError&&contextPresentation==='referenced'){
      const original=JSON.parse(content),presented=referencedContext(original);
      if(JSON.stringify(stable(expandContext(presented)))!==JSON.stringify(stable(original)))throw new LocalBrainError('context_integrity','情境呈現無法完整還原；未交給模型。');
      record({type:'brain.context_presentation',mode:contextPresentation,lossless_verified:true,original_bytes:Buffer.byteLength(content),presented_bytes:Buffer.byteLength(JSON.stringify(presented))});content=JSON.stringify(presented);
     }
     messages.push({role:'tool',tool_name:call.function.name,content});
     if(structured)messages.push({role:'user',content:feedbackText(call.function.name,result.isError===true,toolFeedback)});
     if(call.function.name==='commit_cycle'&&!result.isError){completed=true;text=message.content;break;}
    }
    if(completed)break;
   }
   if(!completed)throw new LocalBrainError('tool_limit','本輪未在既有工具範圍內完成。');
  }catch(e){failure={kind:e.kind??'unknown',message:redact(String(e.message)).slice(0,500),retryable:false,terminal:inferenceSettled};if(e.uncertain)inferenceSettled=false;}
  finally{clearTimeout(timer);clearTimeout(graceTimer);request.signal?.removeEventListener('abort',abort);if(mcp)processConfirmed=await mcp.close();}
  const settled=inferenceSettled&&processConfirmed;
  const result=outcome({ok:completed&&!failure&&!cancelReason,cancelled:!!cancelReason,local_exit_confirmed:settled,local_model_settlement:inferenceSettled?'confirmed_response_or_not_dispatched':'unknown_server_compute',mcp_exit_confirmed:processConfirmed,remote_result:completed?'turn_completed':'unknown',exit_code:completed&&!failure&&!cancelReason?0:1,purpose:request.purpose,text,provider_failure:failure,cancel_reason:cancelReason,usage:usageKnown&&inferenceSent?usage:null,model_calls:modelCalls,tool_calls:toolCalls,model_digest:identity?.digest??null,evidence:path.relative(path.resolve(import.meta.dirname,'../..'),file)},binding);
  if(executionVerification)result.execution_verification=executionVerification;
  try{emit({phase:result.status,request_id:request.request_id,purpose:request.purpose,local_exit_confirmed:settled});record({type:'brain.result',result});}catch{result.ok=false;result.status='unknown';result.local_exit_confirmed=false;result.error='BRAIN_EVIDENCE_UNAVAILABLE';}
  return result;
 }};
}

