// Qualification only: the original broker remains authoritative; expose the same
// three tools as the app-server scope for a comparable tool workload.
import readline from 'node:readline';
import {handle} from '../src/v1_2/mcp.mjs';
const names=new Set(['get_context','write_note','commit_cycle']);
readline.createInterface({input:process.stdin,crlfDelay:Infinity}).on('line',async line=>{let m;try{if(Buffer.byteLength(line)>30000)throw Error('QUALIFICATION_INPUT_LIMIT');m=JSON.parse(line);if(m.method==='tools/call'&&!names.has(m.params?.name))throw Error('TOOL_NOT_OFFERED');let result=await handle(m);if(m.method==='tools/list')result={tools:result.tools.filter(t=>names.has(t.name))};if(result!==null)console.log(JSON.stringify({jsonrpc:'2.0',id:m.id,result}));}catch(e){if(m?.id!==undefined)console.log(JSON.stringify({jsonrpc:'2.0',id:m.id,error:{code:-32602,message:e.message}}));}});
