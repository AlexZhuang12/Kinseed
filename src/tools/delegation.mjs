import {zonedDay} from '../timezone.mjs';
import {id,hash} from '../v1_2/store.mjs';import {windowAt} from '../controller.mjs';import {executeCodexTool,delegationPolicy} from './codex-executor.mjs';
import {readWork} from '../v1_2/workbench.mjs';
import {networkProtected} from '../v1_2/network-transfers.mjs';import {outboundGuard} from '../v1_2/public-browser.mjs';
export const delegationTool={name:'delegate_codex',description:'將明確工作交給獨立Codex工具執行者。須Owner開放codex權限；每輪最多一次，另計一次模型輪數。只可讀取inputs選入的自己的作品及本次新作品，依operations編輯或隔離執行；沒有身份、記憶提交、網路或任意本機檔案。失敗不自動重送，已完成作品保留，文字回報不等於驗證。',inputSchema:{type:'object',additionalProperties:false,properties:{request_id:{type:'string',maxLength:100},instruction:{type:'string',maxLength:3000},operations:{type:'array',maxItems:3,items:{type:'string',enum:['read','edit','execute']}},inputs:{type:'array',maxItems:5,items:{type:'string',maxLength:100}}},required:['request_id','instruction','operations','inputs']}};
export async function delegateTool(e,token,args,l){
 if(e.platform.delegationEnabled===false)throw Error('尚未設定Codex工具接頭；請先停止本控制台，開啟初次設定導引，完成接頭設定。');
 const check=()=>{e.assertAllowed(l);if(!e.store.get('control').permissions.codex)throw Error('尚未開放Codex工作委派，請由Owner在工具權限設定。');};check();
 if(!args.request_id.trim()||!args.instruction.trim())throw Error('DELEGATE_SCHEMA');delegationPolicy(args.operations,args.inputs);outboundGuard(args.instruction,networkProtected(e));for(const file_id of args.inputs)readWork(e,{file_id,max_chars:1});
 const c=e.store.get('control');if(args.operations.some(x=>['edit','execute'].includes(x))&&!c.permissions.workbench||args.operations.includes('execute')&&!c.permissions.execute)throw Error('委派仍需原作品編輯與隔離執行權限。');
 const key='delegate:'+l.cycle_id+':'+args.request_id,input_hash=hash(args),prior=e.store.receipt(key);if(prior){if(prior.input_hash!==input_hash)throw Error('IDEMPOTENCY_CONFLICT');return prior.result;}
 if(e.store.get('lease').delegate_used)throw Error('本輪已委派過工作；請先查看原結果，不會重送。');
 if(l.deadline-e.now()<15000)throw Error('本輪剩餘時間不足，未開始委派。');
 const g=e.platform.global(),w=windowAt(c,e.now()),day=zonedDay(e.now(),e.platform.timezone);if(g.day!==day||g.used>=g.limit||c.cycles_day!==w.day||c.cycles_used>=c.max_cycles)throw Error('MODEL_BUDGET_LIMIT');
 const abort=new AbortController();e.externalRequests??=new Set();e.externalRequests.add(abort);const job_id=id();let dispatched=false;
 try{
  // Reserve globally before dispatch; any inter-DB failure blocks settlement, never refunds or retries.
  g.used++;e.platform.set('global',g);e.platform.audit('delegate.reserved',{individual_id:e.info.individual_id,cycle_id:l.cycle_id,job_id,used:g.used});
  try{e.store.tx(()=>{check();e.bumpTool();c.cycles_used++;e.store.set('control',c);const live=e.store.get('lease');live.delegate_used=true;live.mutation_attempted=true;e.store.set('lease',live);e.store.event('delegate.intent',{job_id,...args,model:'gpt-6.1-sol',control:c},'mcp',l);});}catch(err){e.workbenchSettlementBlocked=true;throw err;}
  const run=e.platform.delegationExecutor??executeCodexTool;
  const result=await run({base:e.store.dir,job_id,instruction:args.instruction,operations:args.operations,inputs:args.inputs,deadline:Math.min(Date.now()+60000,Date.now()+l.deadline-e.now()-1000),signal:abort.signal,assertAllowed:check,onIntent:()=>{dispatched=true;},tool:async(name,a)=>{check();const r=await e.tool(token,name,a);if(name==='work_read')outboundGuard(r.content,networkProtected(e));return r;}});
  if(!result.local_exit_confirmed){e.workbenchSettlementBlocked=true;e.fatal='Codex委派工作尚未確認收尾，保留排程位置，禁止重送。';}
  try{return e.store.tx(()=>{const publicResult=JSON.parse(JSON.stringify({...result,...(result.evidence?{evidence:result.evidence.replace(e.store.dir,'[individual-workspace]')}:{})}));e.store.event('delegate.result',publicResult,'mcp',l);e.store.putReceipt(key,{input_hash,result:publicResult});return publicResult;});}catch(err){e.workbenchSettlementBlocked=true;throw err;}
 }catch(err){if(dispatched){e.workbenchSettlementBlocked=true;e.fatal='Codex工作結果或收尾尚未確認，保留排程位置，禁止重送。';}e.store.tx(()=>e.store.event('delegate.failed',{job_id,error:err.message,no_automatic_replay:true},'mcp',l));throw err;}finally{e.externalRequests.delete(abort);}
}

