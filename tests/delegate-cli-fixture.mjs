// SYNTHETIC CLI event producer; actual stdio MCP proxy and broker remain real.
import {spawn} from 'node:child_process';import readline from 'node:readline';
const child=spawn(process.execPath,[new URL('../src/tools/delegate-mcp.mjs',import.meta.url).pathname.replace(/^\/(.:)/,'$1')],{env:process.env,stdio:['pipe','pipe','pipe'],windowsHide:true});
child.stderr.resume();process.stdin.resume();let seq=0;const pending=new Map();readline.createInterface({input:child.stdout}).on('line',line=>{const r=JSON.parse(line);pending.get(r.id)?.(r);pending.delete(r.id);});
const call=(method,params={})=>new Promise(resolve=>{const id=++seq;pending.set(id,resolve);child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});
await call('initialize',{protocolVersion:'2024-11-05'});const list=await call('tools/list');if(list.result.tools.some(t=>t.name==='commit_cycle'))throw Error('SCOPE_BROKEN');
const mode=process.env.KINSEED_SYNTHETIC_MODE;
if(mode==='hang')await new Promise(()=>{});
else if(mode==='scope'){const r=await call('tools/call',{name:'work_read',arguments:{file_id:'unselected'}});if(!r.error)throw Error('SCOPE_BROKEN');}
else {
 const save=await call('tools/call',{name:'work_save',arguments:{request_id:'fixture-save',expected_version:0,name:'synthetic.js',format:'javascript',content:'return {sum:10};'}});if(save.error)throw Error(save.error.message);const meta=JSON.parse(save.result.content[0].text);
 if(mode==='disconnect')process.exit(3);
 if(mode==='capacity'){child.stdin.end();await new Promise(resolve=>child.once('close',resolve));process.stdout.write(JSON.stringify({type:'error',message:'Selected model is at capacity. Please try a different model.'})+'\n'+JSON.stringify({type:'turn.failed',error:{message:'Selected model is at capacity. Please try a different model.'}})+'\n');process.stdin.destroy();process.exitCode=1;}else{
 const run=await call('tools/call',{name:'run_javascript',arguments:{request_id:'fixture-run',file_id:meta.file_id,version:meta.version,output_name:'fixture-result.json'}});if(run.error)throw Error(run.error.message);}
}
if(mode!=='capacity'){child.stdin.end();await new Promise(resolve=>child.once('close',resolve));process.stdout.write(JSON.stringify({type:'turn.completed',usage:{input_tokens:1,output_tokens:1}})+'\n');process.stdin.destroy();}
