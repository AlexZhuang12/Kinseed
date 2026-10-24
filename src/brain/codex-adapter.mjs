import {assertLifeEndpoint} from './endpoint-scope.mjs';
import fs from 'node:fs';import path from 'node:path';import readline from 'node:readline';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolveCodex} from '../runtime-binary.mjs';
import {providerFailure} from '../v1_2/inference.mjs';
import {codexArgs,safeEnv,PROJECT} from './codex-policy.mjs';
import {brainSettings,descriptor,outcome,validateInvocation} from './contract.mjs';
export function textArgs(cwd){const args=codexArgs(cwd),out=[];for(let i=0;i<args.length;i++){if(args[i]==='-c'&&args[i+1].startsWith('mcp_servers.kinseed.')){i++;continue;}out.push(args[i]==='features.code_mode_host=true'?'features.code_mode_host=false':args[i]);}return out;}
export function checkedDirectory(base,target){const r=path.resolve(target),relative=path.relative(base,r);if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))throw Error('大腦工作路徑超出此執行器的資料範圍。');let p=r;while(true){const info=fs.lstatSync(p,{throwIfNoEntry:false});if(info?.isSymbolicLink())throw Error('大腦工作目錄不能是連結。');if(p===base)break;p=path.dirname(p);}fs.mkdirSync(r,{recursive:true});return r;}
export function createCodexAdapter(config,{base,cwd,evidenceDir,resolveBinary=resolveCodex,spawnProcess=spawn,stopProcess=null,onEvent=()=>{}}={}){
 const binding=descriptor(brainSettings(config)),root=path.resolve(base),work=checkedDirectory(root,cwd),evidence=checkedDirectory(root,evidenceDir);
 return {binding,execute(request){
  validateInvocation(request);if(!binding.enabled)throw Error('大腦尚未啟用。');
  const life=request.purpose==='life',tools=request.tools;
  if(life){assertLifeEndpoint(tools.endpoint,tools.controller);tools.controller.assertAllowed(tools.lease);const current=tools.controller.store.get('lease');if(current?.cycle_id!==tools.lease.cycle_id||request.request_id!==current.cycle_id)throw Error('STALE_LEASE');if(path.resolve(tools.controller.store.dir)!==root||createHash('sha256').update(tools.token).digest('hex')!==current.token_hash)throw Error('跨個體租約或工具能力不符。');}
  return new Promise(resolve=>{
   const events=[],args=life?codexArgs(work):textArgs(work),file=path.join(evidence,request.request_id+'.jsonl'),limit=life?262144:524288;
   fs.closeSync(fs.openSync(file,'wx'));
   let child,bytes=0,errorText='',completed=false,cancelled=false,ended=false,parseFailed=false,forbidden=false,finalText='',stopReason=null,killTimer,timer;
   const redact=s=>life?s.replaceAll(tools.token,'[CYCLE_CAPABILITY]'):s;
   const record=event=>{fs.appendFileSync(file,redact(JSON.stringify({at:new Date().toISOString(),...event}))+'\n');};
   const emit=event=>{record({type:'brain.lifecycle',...event});onEvent(Object.freeze(event));};
   const finish=(code,signal,error)=>{if(ended)return;ended=true;clearTimeout(timer);clearTimeout(killTimer);request.signal?.removeEventListener('abort',abort);
    const failure=forbidden?{kind:'tool_forbidden',message:'此工作沒有工具權限',retryable:false,terminal:true}:parseFailed?{kind:'invalid_stream',message:'模型串流格式無法確認',retryable:false,terminal:false}:providerFailure(events);
    const result=outcome({ok:code===0&&completed&&!cancelled&&!parseFailed&&!forbidden,cancelled,local_exit_confirmed:true,pid:child?.pid??null,exit_code:code,signal,error:error??(code===0&&!parseFailed&&!forbidden?null:errorText||stopReason),provider_failure:code===0&&completed&&!cancelled&&!parseFailed&&!forbidden?null:failure,remote_result:completed?'turn_completed':'unknown',evidence:path.relative(PROJECT,file),usage:events.find(e=>e.type==='turn.completed')?.usage??null,purpose:request.purpose,text:finalText,cancel_reason:stopReason},binding);
    try{emit({phase:result.status,purpose:request.purpose,request_id:request.request_id,model:binding.model,local_exit_confirmed:true});record({type:'brain.result',result});}catch(e){result.ok=false;result.status='unknown';result.error='BRAIN_EVIDENCE_UNAVAILABLE';result.provider_failure={kind:'unknown',retryable:false,terminal:false};}
    resolve(result);
   };
   const cancel=reason=>{if(ended||cancelled)return;cancelled=true;stopReason=reason;try{emit({phase:'cancel_requested',reason,purpose:request.purpose,request_id:request.request_id});}catch{}
    if(!child){finish(null,null,reason);return;}
    if(stopProcess)stopProcess(child);
    else if(process.platform==='win32'&&child.pid){const killer=spawn('taskkill.exe',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});killer.once('error',()=>child.kill());}else child.kill('SIGTERM');
    killTimer=setTimeout(()=>{if(!ended)child.kill('SIGKILL');},3000);killTimer.unref();
   };
   const abort=()=>cancel('ABORTED');
   if(life){tools.task.cancel=()=>cancel('OWNER_OR_CONTROL_STOP');tools.task.kind='brain:'+binding.adapter;}
   request.signal?.addEventListener('abort',abort,{once:true});
   if(request.signal?.aborted){cancel('ABORTED');return;}if(Date.now()>=request.deadline){cancel('DEADLINE_EXCEEDED');return;}
   try{
    record({type:'brain.invocation',binding,purpose:request.purpose,request_id:request.request_id,deadline:request.deadline,args,no_life_capability:!life});emit({phase:'starting',purpose:request.purpose,request_id:request.request_id,model:binding.model});
    child=spawnProcess(resolveBinary(),[...args,'-'],{windowsHide:true,env:safeEnv(life?{KINSEED_ENDPOINT:tools.endpoint,KINSEED_CYCLE_TOKEN:tools.token,RUST_LOG:'warn'}:{}),stdio:['pipe','pipe','pipe']});
    if(life)tools.task.child=child;
    child.once('spawn',()=>{try{if(life)tools.controller.registerTask(tools.lease.cycle_id,child.pid);emit({phase:'running',purpose:request.purpose,request_id:request.request_id,pid:child.pid});}catch(e){errorText=e.message;cancel('TASK_REGISTRATION_FAILED');}});
    timer=setTimeout(()=>cancel('DEADLINE_EXCEEDED'),Math.max(1,request.deadline-Date.now()));
    const count=chunk=>{bytes+=chunk.length;if(bytes>limit)cancel('OUTPUT_LIMIT');};child.stdout.on('data',count);child.stderr.on('data',count);
    readline.createInterface({input:child.stdout}).on('line',line=>{if(ended||bytes>limit)return;try{const e=JSON.parse(line);if(e.item?.type==='reasoning'||e.type?.includes('reasoning'))return;
     events.push(e);record({type:'codex.event',event:e});if(e.type==='thread.started'&&life)tools.controller.session(tools.lease.cycle_id,e.thread_id);if(e.type==='turn.completed')completed=true;
     if(e.item?.type==='agent_message')finalText=e.item.text??'';
     if(e.item?.type==='mcp_tool_call')emit({phase:e.type==='item.started'?'tool_started':'tool_result',purpose:request.purpose,request_id:request.request_id,server:e.item.server,tool:e.item.tool});
     if(!life&&e.item?.type&&!['agent_message','reasoning','error'].includes(e.item.type)){forbidden=true;cancel('TOOL_FORBIDDEN');}
    }catch(e){parseFailed=true;errorText=String(e.message).slice(0,500);cancel('INVALID_STREAM');}});
    readline.createInterface({input:child.stderr}).on('line',line=>{if(ended||bytes>limit)return;const clean=redact(line.replace(/\u001b\[[0-9;]*m/g,''));errorText=(errorText+clean+'\n').slice(-4000);try{record({type:'runtime.diagnostic',text:clean});}catch{cancel('EVIDENCE_WRITE_FAILED');}});
    child.on('error',e=>{errorText=e.message;if(!child.pid)finish(null,null,e.message);else cancel('PROCESS_ERROR');});child.once('close',(code,signal)=>finish(code,signal));child.stdin.on('error',()=>{});child.stdin.end(request.prompt);
   }catch(e){errorText=e.message;if(child?.pid)cancel('STARTUP_ERROR');else finish(null,null,e.message);}
  });
 }};
}

