import {spawn} from 'node:child_process';
import readline from 'node:readline';
import {fileURLToPath} from 'node:url';
import {safeEnv} from './codex-policy.mjs';
export function controlledMCP({endpoint,token,cwd,onChild=()=>{},onEvent=()=>{}}){
 const child=spawn(process.execPath,[fileURLToPath(new URL('../v1_2/mcp.mjs',import.meta.url))],{cwd,windowsHide:true,env:safeEnv({KINSEED_ENDPOINT:endpoint,KINSEED_CYCLE_TOKEN:token}),stdio:['pipe','pipe','pipe']});
 let seq=0,closed=false,bytes=0,diagnosticBytes=0;const pending=new Map();let closeResolve;
 const closePromise=new Promise(resolve=>closeResolve=resolve);
 const fail=e=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(e);}pending.clear();};
 child.once('spawn',()=>{try{onChild(child);}catch(e){fail(e);child.kill();}});
 child.on('error',e=>{fail(e);if(!child.pid){closed=true;closeResolve(true);}});
 child.once('close',()=>{closed=true;fail(Error('受控工具程序已關閉。'));closeResolve(true);});
 child.stdin.on('error',()=>{});child.stderr.on('data',chunk=>{diagnosticBytes+=chunk.length;if(diagnosticBytes>65536){fail(Error('受控工具診斷超量。'));child.kill();}});
 readline.createInterface({input:child.stdout}).on('line',line=>{try{bytes+=Buffer.byteLength(line);if(bytes>4*1024*1024)throw Error('受控工具回應超量。');const m=JSON.parse(line),p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);if(m.error)p.reject(Error(m.error.message));else p.resolve(m.result);}catch(e){fail(e);child.kill();}});
 function call(method,params={},timeout=65000){if(closed)return Promise.reject(Error('受控工具程序已關閉。'));return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('受控工具回應逾時，需核對既有工具收尾。'));},timeout);pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});}
 return {child,call,async initialize(){await call('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'kinseed-local-brain',version:'1'}},10000);const list=await call('tools/list',{},10000);if(!Array.isArray(list.tools))throw Error('受控工具清單不正確。');return list.tools;},async tool(name,args){onEvent({phase:'tool_started',tool:name});const r=await call('tools/call',{name,arguments:args});onEvent({phase:'tool_result',tool:name,is_error:r.isError===true});return r;},async close(){if(!closed){child.stdin.end();const timer=setTimeout(()=>child.kill(),1000);const confirmed=await Promise.race([closePromise,new Promise(resolve=>{const t=setTimeout(()=>resolve(false),4000);t.unref();})]);clearTimeout(timer);return confirmed;}return true;}};
}
