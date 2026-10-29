import {createAppServerBrain} from './app-server/managed-runtime.mjs';
import path from 'node:path';import {randomUUID} from 'node:crypto';
import {createCodexAdapter} from './codex-adapter.mjs';
import {createOllamaAdapter} from './ollama-adapter.mjs';
import {DEFAULT_BRAIN,brainSettings,descriptor} from './contract.mjs';
export function createBrain(config=DEFAULT_BRAIN,options={}){const c=brainSettings(config);if(!options.base||!options.cwd||!options.evidenceDir)throw Error('大腦執行器需要獨立資料目錄。');return c.adapter==='codex-app-server'?createAppServerBrain(c,options):c.adapter==='ollama-local'?createOllamaAdapter(c,options):createCodexAdapter(c,options);}
export function lifeRunner({endpoint,cwd,evidenceDir,prompt,base=path.dirname(cwd),config={...DEFAULT_BRAIN,enabled:true},adapterOptions={}}){
 const brain=createBrain(config,{base,cwd,evidenceDir,...adapterOptions});
 return args=>{const {controller,lease}=args;controller.assertAllowed(lease);controller.store.tx(()=>controller.store.event('brain.binding',{...brain.binding,purpose:'life'},'controller',lease));controller.brainBinding=brain.binding;return brain.execute({purpose:'life',request_id:lease.cycle_id,deadline:lease.deadline,prompt,tools:{...args,endpoint}});};
}
export async function textInference(prompt,{dir,call_id=randomUUID(),timeout=180000,signal,purpose='report',dispatch_proof,config={...DEFAULT_BRAIN,enabled:true},adapterOptions={}}={}){
 if(!['consult','report'].includes(purpose))throw Error('文字工作只能是請教或報告。');if(!Number.isSafeInteger(timeout)||timeout<1||timeout>180000)throw Error('文字工作時限不正確。');
 const brain=createBrain(config,{base:path.resolve(dir),cwd:path.join(dir,'empty-workspace'),evidenceDir:path.join(dir,'model-evidence'),...adapterOptions});
 let r;try{r=await brain.execute({purpose,request_id:call_id,prompt,deadline:Date.now()+timeout,signal,dispatch_proof});}finally{await brain.close?.();}
 if(!r.ok){const e=Error(r.provider_failure?.kind==='capacity'?'模型暫時繁忙，請稍後重試。':r.cancelled?'模型工作已取消或逾時，原資料保留。':'模型沒有完整完成，原資料保留；請查看執行依據。');e.kind=r.provider_failure?.kind??'unknown';e.retryable=r.exit_code===1&&e.kind==='capacity'&&!r.cancelled;e.brain_result=r;throw e;}
 try{return JSON.parse(r.text.replace(/^```(?:json)?\s*|\s*```$/g,''));}catch{const e=Error('模型回覆格式不正確，原資料保留。');e.kind='invalid_output';e.retryable=false;throw e;}
}
