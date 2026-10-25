import {createHash} from 'node:crypto';
// Transport bytes are not model tokens or life/network/paid-service authority.
export const RESOURCE_LIMITS=Object.freeze({request_bytes:4*1024*1024,tool_text:2*1024*1024,image_bytes:1500000,line:8*1024*1024,wire:96*1024*1024,tool_total:24*1024*1024,image_total:64*1024*1024,model_text:256*1024,stderr:256*1024});
const size=v=>Buffer.byteLength(typeof v==='string'?v:JSON.stringify(v));
export function toolContent(result,{ok=true,tool='unknown'}={}){
 const {_mcp_image:img,...meta}=result??{};
 const badText=size(meta)>RESOURCE_LIMITS.tool_text;
 const badImage=img&&(img.type!=='image'||!['image/png','image/jpeg'].includes(img.mimeType)||typeof img.data!=='string'||img.data.length>Math.ceil(RESOURCE_LIMITS.image_bytes/3)*4||!/^[A-Za-z0-9+/]*={0,2}$/.test(img.data)||Buffer.from(img.data,'base64').length>RESOURCE_LIMITS.image_bytes);
 if(badText||badImage){const receipt=Object.fromEntries(['id','document_id','file_id','event_id','job_id','version','page','source_sha256'].filter(k=>Object.hasOwn(meta,k)&&['string','number'].includes(typeof meta[k])).map(k=>[k,meta[k]]));return {isError:true,content:[{type:'text',text:JSON.stringify({error:'TOOL_RESULT_LIMIT',tool,scope:'this_result',operation_completed:ok,receipt,message:'工具結果超過這次可傳回的大小，未截斷或假裝讀完；已完成操作仍保留，請勿重做寫入或付費提交。可用分頁文字閱讀、保存項目編號或其他已授權工具繼續。',limits:{text_bytes:RESOURCE_LIMITS.tool_text,image_bytes:RESOURCE_LIMITS.image_bytes}})}]};}
 return {content:[{type:'text',text:JSON.stringify(img?meta:result)},...(img?[img]:[])],isError:!ok};
}
// A finite line reader avoids readline buffering an unbounded unterminated line.
export function boundedLines(stream,{limit=RESOURCE_LIMITS.line,onLine,onLimit}){
 let parts=[],bytes=0,blocked=false;
 stream.on('data',chunk=>{if(blocked)return;let start=0;for(let i=0;i<=chunk.length;i++){if(i<chunk.length&&chunk[i]!==10)continue;const part=chunk.subarray(start,i);bytes+=part.length;if(bytes>limit){blocked=true;parts=[];onLimit(bytes);return;}if(part.length)parts.push(part);if(i<chunk.length){onLine(Buffer.concat(parts,bytes).toString('utf8').replace(/\r$/,''));parts=[];bytes=0;}start=i+1;}});
 stream.on('end',()=>{if(!blocked&&bytes)onLine(Buffer.concat(parts,bytes).toString('utf8'));});
}
export function streamBudget({life=true}={}){
 const used={wire:0,tool:0,image:0,model:0,stderr:0};
 const fail=(category,limit,tool=null)=>Object.assign(Error('OUTPUT_LIMIT'),{resource:{category,tool,limit,observed:used[category]??null}});
 return {used,wire(n){used.wire+=n;if(used.wire>RESOURCE_LIMITS.wire)throw fail('wire',RESOURCE_LIMITS.wire);},diagnostic(n){used.stderr+=n;if(used.stderr>RESOURCE_LIMITS.stderr)throw fail('stderr',RESOURCE_LIMITS.stderr);},event(e){
  let image=0;const walk=v=>{if(Array.isArray(v))return v.map(walk);if(!v||typeof v!=='object')return v;if(v.type==='image'&&typeof v.data==='string'){image+=v.data.length;return {...v,data:'[image omitted from diagnostic copy]',image_sha256:createHash('sha256').update(Buffer.from(v.data,'base64')).digest('hex'),encoded_bytes:v.data.length};}return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,walk(x)]));};
  const safe=walk(e),tool=e.item?.type==='mcp_tool_call'?e.item.tool:null;
  used.image+=image;if(used.image>RESOURCE_LIMITS.image_total)throw fail('image',RESOURCE_LIMITS.image_total,tool);
  if(tool){used.tool+=size(safe);if(used.tool>RESOURCE_LIMITS.tool_total)throw fail('tool',RESOURCE_LIMITS.tool_total,tool);}
  if(e.item?.type==='agent_message'){used.model+=size(e.item.text??'');if(used.model>(life?RESOURCE_LIMITS.model_text:524288))throw fail('model',life?RESOURCE_LIMITS.model_text:524288);}
  return safe;
 }};
}
