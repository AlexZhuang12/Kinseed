import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import readline from 'node:readline';import {spawn} from 'node:child_process';import {randomUUID,timingSafeEqual,createHash} from 'node:crypto';
import {codexArgs,safeEnv} from '../brain/codex-policy.mjs';import {checkedDirectory} from '../brain/codex-adapter.mjs';import {resolveCodex} from '../runtime-binary.mjs';import {workbenchTools} from '../v1_2/workbench-tools.mjs';
import {providerFailure} from '../v1_2/inference.mjs';
export async function readDelegateJSON(stream){const chunks=[];let size=0;for await(const chunk of stream){const b=Buffer.from(chunk);size+=b.length;if(size>400000)throw Error('MESSAGE_LIMIT');chunks.push(b);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
export function delegationPolicy(operations,inputs){
 if(!Array.isArray(operations)||!operations.length||new Set(operations).size!==operations.length||operations.some(x=>!['read','edit','execute'].includes(x))||!Array.isArray(inputs)||inputs.length>5||inputs.some(x=>typeof x!=='string'||!x||x.length>100))throw Error('DELEGATE_SCOPE');
 if(operations.includes('execute')&&!operations.includes('edit'))throw Error('執行委派須同時選取作品編輯。');
 const files=new Set(inputs),allowed=new Set(['work_read',...(operations.includes('edit')?['work_save']:[]),...(operations.includes('execute')?['run_javascript']:[])]);
 return {allowed,files,check(name,args){if(!allowed.has(name))throw Error('DELEGATE_TOOL_DENIED');if(name==='work_read'&&!files.has(args.file_id)||name==='work_save'&&args.file_id&&!files.has(args.file_id)||name==='run_javascript'&&(!files.has(args.file_id)||(args.inputs??[]).some(x=>!files.has(x.file_id))))throw Error('DELEGATE_FILE_SCOPE');},accept(name,r){if(name==='work_save'&&r.file_id)files.add(r.file_id);}};
}
export function executorArgs(cwd){const args=codexArgs(cwd);for(let i=0;i<args.length;i++){if(args[i]==='-c'&&args[i+1].startsWith('mcp_servers.kinseed.args='))args[i+1]='mcp_servers.kinseed.args='+JSON.stringify([path.join(import.meta.dirname,'delegate-mcp.mjs')]);if(args[i]==='-c'&&args[i+1].startsWith('mcp_servers.kinseed.env_vars='))args[i+1]='mcp_servers.kinseed.env_vars=["KINSEED_DELEGATE_ENDPOINT","KINSEED_DELEGATE_TOKEN"]';}return args;}
export async function executeCodexTool({base,job_id,instruction,operations,inputs,deadline,signal,assertAllowed,tool,onIntent=()=>{},spawnProcess=spawn,resolveBinary=resolveCodex,onSpawn=()=>{}}){
 if(!/^[-a-zA-Z0-9]{1,100}$/.test(job_id)||typeof instruction!=='string'||!instruction.trim()||instruction.length>3000||!Number.isSafeInteger(deadline))throw Error('DELEGATE_SCHEMA');
 const policy=delegationPolicy(operations,inputs),cwd=checkedDirectory(path.resolve(base),path.join(base,'delegations',job_id)),file=path.join(cwd,'events.jsonl'),token=randomUUID()+randomUUID();fs.closeSync(fs.openSync(file,'wx'));
 let revoked=false,attached=0,active=0,child,completed=false,failed=false,reason=null,text='',bytes=0,evidenceFailed=false;const receipts=[],events=[],proxyPids=new Set();let timer,abort;
 const record=x=>{try{fs.appendFileSync(file,JSON.stringify({at:new Date().toISOString(),...x}).replaceAll(token,'[DELEGATE_CAPABILITY]')+'\n');}catch{evidenceFailed=true;failed=true;reason='EVIDENCE_UNAVAILABLE';revoked=true;child?.kill();}};
 const check=()=>{if(revoked||signal?.aborted||Date.now()>=deadline)throw Error('DELEGATE_CANCELLED');assertAllowed();};
 const server=http.createServer(async(req,res)=>{const reply=(status,data)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(data));};try{if(req.method!=='POST'||req.url!=='/')throw Error('DELEGATE_ROUTE');const auth=Buffer.from(req.headers.authorization??''),expected=Buffer.from('Bearer '+token);if(auth.length!==expected.length||!timingSafeEqual(auth,expected))throw Error('UNAUTHORIZED_DELEGATE');const b=await readDelegateJSON(req);if(b.method==='detach'){attached=Math.max(0,attached-1);return reply(200,{});}check();if(b.method==='attach'){if(!Number.isSafeInteger(b.pid)||b.pid<=0||b.pid===process.pid)throw Error('PROXY_PID');proxyPids.add(b.pid);attached++;return reply(200,{});}if(b.method==='ping')return reply(200,{});if(b.method==='list')return reply(200,{tools:workbenchTools.filter(t=>policy.allowed.has(t.name)).map(t=>({...t,annotations:{readOnlyHint:t.name==='work_read',destructiveHint:false,openWorldHint:false}}))});if(b.method!=='tool')throw Error('METHOD_NOT_FOUND');policy.check(b.name,b.arguments??{});active++;try{const original=b.arguments??{},bound={...original};if(Object.hasOwn(bound,'request_id'))bound.request_id=createHash('sha256').update(job_id+JSON.stringify(original)).digest('hex');const result=await tool(b.name,bound);check();policy.accept(b.name,result);const receipt={name:b.name,result};receipts.push(receipt);record({type:'delegate.tool_result',...receipt});return reply(200,{content:[{type:'text',text:JSON.stringify(result)}]});}finally{active--;}}catch(e){record({type:'delegate.denied',error:e.message});reply(403,{error:e.message});}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const endpoint='http://127.0.0.1:'+server.address().port;
 try{
  check();const binary=resolveBinary();onIntent();record({type:'delegate.start',job_id,operations,inputs,model:'gpt-6.1-sol',deadline});check();
  const result=await new Promise(resolve=>{
   let settled=false;const finish=(code,processSignal,error)=>{if(settled)return;settled=true;resolve({exit_code:code,signal:processSignal,error,local_exit_confirmed:true});};
   const cancel=why=>{reason??=why;revoked=true;record({type:'delegate.cancel_requested',reason});child?.kill();};abort=()=>cancel('OWNER_OR_CONTROL_STOP');signal?.addEventListener('abort',abort,{once:true});
   try{child=spawnProcess(binary,[...executorArgs(cwd),'-'],{windowsHide:true,env:safeEnv({KINSEED_DELEGATE_ENDPOINT:endpoint,KINSEED_DELEGATE_TOKEN:token,RUST_LOG:'warn'}),stdio:['pipe','pipe','pipe']});record({type:'delegate.process',pid:child.pid});onSpawn(child);
    child.once('error',e=>{failed=true;if(!child.pid)finish(null,null,e.message);else cancel('PROCESS_ERROR');});child.once('close',(c,s)=>finish(c,s,null));child.stdin.on('error',()=>{});
    for(const stream of [child.stdout,child.stderr])stream.on('data',b=>{bytes+=b.length;if(bytes>262144)cancel('OUTPUT_LIMIT');});
    readline.createInterface({input:child.stdout}).on('line',line=>{try{const e=JSON.parse(line);if(e.type?.includes('reasoning')||e.item?.type==='reasoning')return;events.push(e);record({type:'codex.event',event:e});if(e.type==='turn.completed')completed=true;if(e.type==='turn.failed'||e.type==='error')failed=true;if(e.item?.type==='agent_message')text=e.item.text??'';if(e.item?.type&&!['agent_message','reasoning','error','mcp_tool_call'].includes(e.item.type))cancel('UNEXPECTED_NATIVE_TOOL');}catch{failed=true;cancel('INVALID_STREAM');}});
    readline.createInterface({input:child.stderr}).on('line',s=>record({type:'diagnostic',text:s.slice(0,1000)}));
    timer=setTimeout(()=>cancel('DEADLINE_EXCEEDED'),Math.max(1,deadline-Date.now()));if(signal?.aborted)abort();
    child.stdin.end('你是受委派的工具執行者，不是生活個體。只處理下列工作資料。只使用 kinseed MCP 列出的作品工具；沒有身份、記憶提交、Owner控制、網路、shell或任意檔案權限。工具結果以真實收據為準，不宣稱未執行成功。不重複相同寫入。完成後用繁體中文簡短回報。選入作品ID：'+JSON.stringify(inputs)+'\n工作資料：\n'+instruction);
   }catch(e){if(child?.pid)cancel('STARTUP_ERROR');else finish(null,null,e.message);}
  });
  revoked=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);
  const until=Date.now()+5000;const proxyAlive=()=>[...proxyPids].some(pid=>{try{process.kill(pid,0);return true;}catch(e){return e.code!=='ESRCH';}});while((active||proxyAlive())&&Date.now()<until)await new Promise(r=>setTimeout(r,30));
  const local_exit_confirmed=result.local_exit_confirmed&&active===0&&!proxyAlive();
  let valid=true;try{assertAllowed();}catch{valid=false;}
  const out={job_id,ok:result.exit_code===0&&completed&&!failed&&!reason&&valid&&local_exit_confirmed,status:!local_exit_confirmed?'unknown':reason||!valid?'cancelled':result.exit_code===0&&completed&&!failed?'completed':'failed',...result,local_exit_confirmed,reason,model:'gpt-6.1-sol',text,receipts,operations_status:receipts.length===0?'not_executed':!completed?'partial':receipts.some(r=>r.result?.state==='failed')?'failed':'completed',transport_completed:completed,task_verified:false,provider_failure:result.exit_code===0&&completed?null:providerFailure(events),automatic_replay:false,usage_source:'codex_jsonl',narrative_verified:false,remote_result:completed?'turn_completed':'unknown',evidence:file};out.message=out.provider_failure?.kind==='capacity'?'模型暫時容量不足，已保存的作品保留；尚未完成的部分沒有自動重送。':out.status==='unknown'?'尚未確認工作收尾，保留排程位置，請勿重送。':out.status==='cancelled'?'工作已取消；已保存作品保留，沒有重送。':out.status==='failed'?'Codex未完整完成，請查看執行依據；不會自動重送。':out.operations_status==='failed'?'Codex已回覆，但隔離程式執行失敗；請查看原錯誤。':'Codex已回覆，請依工具收據核對成果。';record({type:'delegate.exit',result:out});if(evidenceFailed){out.ok=false;out.status='failed';out.reason='EVIDENCE_UNAVAILABLE';}return out;
 }finally{revoked=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);await new Promise(resolve=>server.close(resolve));}
}







