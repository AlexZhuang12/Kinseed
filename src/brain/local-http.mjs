import {localEndpoint} from './contract.mjs';
import http from 'node:http';
export class LocalBrainError extends Error{constructor(kind,message,{uncertain=false}={}){super(message);this.kind=kind;this.uncertain=uncertain;}}
// No pull, cloud, credentials, cookies, proxy configuration or redirects.
export async function localJSON(endpoint,route,{body,signal,timeout=10000,limit=1048576}={}){
 const origin=localEndpoint(endpoint);if(!['/api/version','/api/tags','/api/show','/api/chat'].includes(route))throw Error('本地模型API路徑不在允許範圍。');
 // Direct node:http connection avoids fetch dispatcher/environment proxy
 // settings. Private brain messages must never transit an inherited proxy.
 return new Promise((resolve,reject)=>{
  const uncertain=route==='/api/chat',fail=(kind,message)=>reject(new LocalBrainError(kind,message,{uncertain}));
  const request=http.request({hostname:'127.0.0.1',port:Number(new URL(origin).port),path:route,method:body===undefined?'GET':'POST',agent:false,headers:{'Content-Type':'application/json'},signal:signal??AbortSignal.timeout(timeout)},response=>{
   if(response.statusCode<200||response.statusCode>=300){response.destroy();fail(response.statusCode===404?'model_missing':'service_error','本地模型服務拒絕請求（HTTP '+response.statusCode+'）；請檢查服務與模型名稱。');return;}
   const length=Number(response.headers['content-length']);if(Number.isFinite(length)&&length>limit){response.destroy();fail('invalid_output','本地模型回應超出可核對大小。');return;}
   let bytes=0;const chunks=[];
   response.on('data',chunk=>{bytes+=chunk.length;if(bytes>limit){response.destroy();fail('invalid_output','本地模型回應超出可核對大小。');}else chunks.push(chunk);});
   response.once('error',()=>fail('transport','本地模型回應未能完整讀取；不自動重送。'));
   response.once('end',()=>{try{const result=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!result||typeof result!=='object'||Array.isArray(result)||result.error)throw Error('invalid');resolve(result);}catch{fail('invalid_output','本地模型回應不是完整有效資料。');}});
  });
  request.once('error',()=>fail('transport','本地模型連線中斷或逾時；不自動重送。'));request.end(body===undefined?undefined:JSON.stringify(body));
 });
}
export async function inspectLocalModel(config){
 const version=await localJSON(config.endpoint,'/api/version'),tags=await localJSON(config.endpoint,'/api/tags');
 const tag=tags.models?.find(x=>x.name===config.model||x.model===config.model);
 if(!tag||typeof tag.digest!=='string'||!tag.digest.length)throw new LocalBrainError('model_missing','本機未找到指定模型；不會自動下載。');
 const show=await localJSON(config.endpoint,'/api/show',{body:{model:config.model}});
 if(show.remote_host||show.remote_model||tag.remote_host||tag.remote_model)throw new LocalBrainError('remote_forbidden','此模型會轉送外部服務，已拒絕接入。');
 if(!show.capabilities?.includes('tools')||!show.capabilities?.includes('completion'))throw new LocalBrainError('capability_missing','指定模型尚未提供文字與工具呼叫能力。');
 const context=Object.entries(show.model_info??{}).filter(([key])=>key.endsWith('.context_length')).map(([,value])=>value);
 if(!context.some(n=>Number.isSafeInteger(n)&&n>=config.context_tokens))throw new LocalBrainError('context_insufficient','模型宣告的上下文不足或未知，不能自動截短身份與記憶。');
 return {version:version.version,model:config.model,digest:tag.digest,context_tokens:config.context_tokens,capabilities:['completion','tools']};
}
export function nativeContextGuard(identity){return identity?.version==='0.40.7';}
export function verifyNativeBudget(response,config){
 const count=response.prompt_eval_count;
 if(!Number.isSafeInteger(count)||count<1)throw new LocalBrainError('context_unverified','模型未提供可核對的實際輸入用量；未執行工具。');
 if(count+config.max_output_tokens>config.context_tokens)throw new LocalBrainError('context_insufficient','完整輸入加上回答預留量超出上下文；未截斷資料、未執行工具。請另行評估上下文與記憶體。');
 return {method:'ollama_native_no_truncate_no_shift',input_tokens:count,reserved_output_tokens:config.max_output_tokens,context_tokens:config.context_tokens};
}
export function checkContextBudget(messages,tools,config,identity=null){
 // Deliberately conservative UTF-8 byte budget. Real tokenizer compatibility
 // remains a release gate; no silent slicing of identity, memory or tool data.
 const upper=Buffer.byteLength(JSON.stringify({messages,tools}),'utf8')+messages.length*128+512;
 // This pinned server supports truncate:false and shift:false. Its own
 // tokenizer enforces the complete prompt; verify returned native count and
 // output reserve before dispatching ANY tool. Bytes are only a transport cap,
 // never presented as an exact token estimate. Unknown versions stay guarded.
 if(nativeContextGuard(identity)){
  if(upper>4*1024*1024)throw new LocalBrainError('context_insufficient','完整輸入超出本地傳輸上限；未截斷。');
  return {method:'native_pending_response_verification',transport_bytes:upper};
 }
 if(upper+config.max_output_tokens>config.context_tokens)throw new LocalBrainError('context_insufficient','本輪完整身份、記憶與工具內容超出目前保守上下文預算；未截斷。請檢查上下文設定、工具回傳格式及可用記憶體，再評估模型。');
 return upper;
}
