export const BRAIN_CONTRACT=1;
export const DEFAULT_BRAIN=Object.freeze({enabled:false,adapter:'codex-cli',model:'gpt-6.1-sol',reasoning:'low'});
export function brainSettings(c){
 if(c?.adapter==='ollama-local'){
  if(Object.keys(c).filter(k=>k!=='tool_protocol').sort().join(',')!=='adapter,context_tokens,enabled,endpoint,max_output_tokens,model,think'||typeof c.enabled!=='boolean'||c.think!==false||Object.hasOwn(c,'tool_protocol')&&!['native','schema','staged','guided','stepwise'].includes(c.tool_protocol))throw Error('本地大腦設定欄位不正確；本階段不保存內部推理。');
  localEndpoint(c.endpoint);
  if(typeof c.model!=='string'||!/^[-a-zA-Z0-9][a-zA-Z0-9_./:-]{0,127}$/.test(c.model)||c.model.includes('..')||/(?:^|[:-])cloud(?:-|$)/i.test(c.model))throw Error('請指定本機已有的模型名稱，不能指定雲端模型或下載網址。');
  if(!Number.isInteger(c.context_tokens)||c.context_tokens<8192||c.context_tokens>65536||!Number.isInteger(c.max_output_tokens)||c.max_output_tokens<128||c.max_output_tokens>8192||c.max_output_tokens>c.context_tokens/2)throw Error('本地模型上下文或輸出預算不正確。');
  return Object.freeze({...c});
 }
 if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).sort().join(',')!=='adapter,enabled,model,reasoning'||typeof c.enabled!=='boolean')throw Error('大腦設定欄位不正確。');
 if(!['codex-cli','codex-app-server'].includes(c.adapter))throw Error('尚未支援這個大腦接頭。');
 if(c.model!==DEFAULT_BRAIN.model||c.reasoning!=='low')throw Error('尚未驗證這個模型組合；本階段保留既有指定模型與推理設定。');
 return Object.freeze({...c});
}
export function localEndpoint(value){const u=new URL(value);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||!u.port||u.username||u.password||u.pathname!=='/'||u.search||u.hash||[47429,47430,47431,62372].includes(Number(u.port)))throw Error('本地模型僅接受獨立127.0.0.1 HTTP服務，不能指向正式控制器。');return u.origin;}
export function descriptor(c=DEFAULT_BRAIN){const config=brainSettings(c),local=config.adapter==='ollama-local';return Object.freeze({contract:BRAIN_CONTRACT,adapter:config.adapter,adapter_version:1,model:config.model,reasoning:local?'disabled':config.reasoning,enabled:config.enabled,transport:local?'ollama-http-controlled-mcp':config.adapter==='codex-app-server'?'codex-app-server-jsonrpc':'codex-cli-jsonl',purposes:['life','consult','report'],automatic_fallback:false,local_model_supported:local,validation:local?'synthetic_protocol_only':config.adapter==='codex-app-server'?'candidate_integrated':'real_codex_verified'});}
export function normalizeUsage(raw){if(!raw||typeof raw!=='object')return null;return Object.fromEntries(['input_tokens','cached_input_tokens','cache_write_input_tokens','output_tokens','reasoning_output_tokens'].filter(k=>Number.isSafeInteger(raw[k])&&raw[k]>=0).map(k=>[k,raw[k]]));}
export function outcome(raw,binding){
 const completed=raw.ok===true&&raw.local_exit_confirmed===true&&raw.remote_result==='turn_completed'&&!raw.cancelled;
 const status=completed?'completed':raw.local_exit_confirmed!==true?'unknown':raw.cancelled?'cancelled':raw.provider_failure?.kind&&raw.provider_failure.kind!=='unknown'?'failed':'unknown';
 return {...raw,ok:completed,contract:BRAIN_CONTRACT,adapter:binding.adapter,adapter_version:binding.adapter_version,model:binding.model,purpose:raw.purpose,status,usage:normalizeUsage(raw.usage),automatic_fallback:false};
}
export function validateInvocation(r){if(!r||!['life','consult','report'].includes(r.purpose)||typeof r.prompt!=='string'||!r.prompt.length||!Number.isSafeInteger(r.deadline)||r.deadline<0||typeof r.request_id!=='string'||!/^[-a-zA-Z0-9]{1,100}$/.test(r.request_id))throw Error('大腦工作格式不正確。');if(r.purpose==='life'&&(!r.tools||typeof r.tools.token!=='string'||!r.tools.controller||!r.tools.lease||!r.tools.task))throw Error('生活工作缺少受控工具租約。');if(r.purpose!=='life'&&r.tools)throw Error('請教與報告工作不能取得生活工具權限。');return r;}
