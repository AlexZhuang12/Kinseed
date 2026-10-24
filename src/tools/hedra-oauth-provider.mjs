import {hedraSession} from './hedra-codex-transport.mjs';
import {units} from './hedra-ledger.mjs';
export const OAUTH_NOTICE='共用OAuth點數連線：提交前檢查，並非獨立鎖定；仍須有效生活、媒體權限及額度。';
const routes={image:'generate_image',video:'generate_video',audio:'generate_music'};
export function mapHedraInput(input){
 if(!routes[input.kind]||!input.model||!input.prompt)throw Error('Hedra需求不完整。');
 const p=input.parameters??{},args={model:input.model,prompt:input.prompt};
 for(const [k,v]of Object.entries(p)){if(!['aspect_ratio','resolution','duration_ms','quality'].includes(k))throw Error('不支援此媒體參數。');if(k==='quality'){args.model_specific_parameters={quality:v};}else args[k]=v;}
 if(input.kind==='image'&&p.duration_ms!==undefined||input.kind==='audio'&&(p.aspect_ratio!==undefined||p.resolution!==undefined||p.quality!==undefined))throw Error('媒體類型與參數不一致。');
 if(['video','audio'].includes(input.kind)&&(!Number.isInteger(p.duration_ms)||p.duration_ms<1||p.duration_ms>60000))throw Error('影片與音樂需明確指定時長，最多60秒。');
 return {tool:routes[input.kind],args};
}
function balanceValue(x){const b=x?.balance;if(!b||typeof b.workspace_id!=='string'||!['credits','usd'].includes(b.billing_mode))throw Error('Hedra餘額格式無法核對。');units(b.credits?.available);return {workspace_id:b.workspace_id,billing_mode:b.billing_mode,currency:'credits',available:b.credits.available};}
function expectedBalance(x,workspace){const b=balanceValue(x);if(b.billing_mode!=='credits'||b.workspace_id!==workspace)throw Error('工作區或點數模式已變更；未送出新工作。');return b;}
async function schemaCheck(call,input,args){const {model:m}=await call('get_model',{model:input.model});if(m?.id!==input.model||m.modality!==(input.kind==='audio'?'audio':input.kind))throw Error('模型與媒體類型不一致。');const props=m.input_schema?.properties;if(!props)throw Error('模型規格無法核對。');for(const [k,v]of Object.entries(input.parameters??{})){const s=props[k];if(!s||s.enum&&!s.enum.includes(v))throw Error('此模型不接受指定參數。');}const provided={...args,...args.model_specific_parameters};for(const k of m.input_schema.required??[])if(provided[k]===undefined)throw Error('此模型需要額外輸入，目前接頭未提供：'+k);}
export class OAuthCreditsHedraProvider{
 constructor({policy,session=hedraSession}={}){this.kind='oauth-credits';this.policy=policy??(()=>({enabled:false}));this.session=session;}
 capability(){const p=this.policy();return {mode:'credits',fixed:false,policy:'oauth_credits_checked',owner_accepted:p.enabled===true&&p.risk_accepted===true,connection_version:p.version??0,workspace_bound:!!p.workspace_id,submission_enabled:p.enabled===true&&p.risk_accepted===true&&!!p.workspace_id,supported_kinds:['image','video','audio'],audio_scope:'music_only',message:OAUTH_NOTICE};}
 check(){const p=this.policy();if(!this.capability().submission_enabled)throw Error('尚未由Owner啟用OAuth點數連線。');return p;}
 async balance(options={}){return this.session(async call=>balanceValue(await call('get_balance',{})),{...options,paid:false});}
 async estimate(input,options={}){this.check();const {tool,args}=mapHedraInput(input);return this.session(async call=>{await schemaCheck(call,input,args);const {estimate:e}=await call('estimate',{generation_tool:tool,input:args});if(!e||e.currency!=='credits')throw Error('估價不是點數，沒有送出。');units(e.cost);return e;},{...options,paid:false});}
 async submit(input,{signal,workspace_id,expected_cost,connection_version,minimum_available,authorize}={}){
  let attempted=false;try{const p=this.check();if(p.version!==connection_version||p.workspace_id!==workspace_id||typeof authorize!=='function')throw Error('提交前連線授權不一致。');const {tool,args}=mapHedraInput(input);if(typeof input.idempotency_key!=='string'||!input.idempotency_key)throw Error('缺少防重送識別。');
  return await this.session(async call=>{
   const balance=expectedBalance(await call('get_balance',{}),workspace_id);if(units(balance.available)<units(minimum_available))throw Error('提交前供應商點數不足以涵蓋暫留與保留額。');
   const {estimate:e}=await call('estimate',{generation_tool:tool,input:args});if(e?.currency!=='credits'||units(e.cost)!==units(expected_cost))throw Error('提交前估價已變更。');
   if(this.policy().version!==connection_version)throw Error('Owner已變更連線設定。');authorize(balance);
   attempted=true;const {job:j}=await call(tool,{...args,idempotency_key:input.idempotency_key});
   if(!j||typeof j.job_id!=='string'||j.model!==input.model||!['IN_QUEUE','IN_PROGRESS','COMPLETED','FAILED'].includes(j.status))throw Error('提交結果不明，不重新生成。');
   return {job_id:j.job_id,workspace_id,currency:'credits',billing_evidence:'pre_submit_check_only',charge_confirmed:false,poll_after_seconds:j.poll_after_seconds??5};
  },{signal,paid:true});}catch(e){if(!attempted)e.no_submission=true;throw e;}
 }
 async poll(id,{signal,workspace_id}={}){if(typeof id!=='string'||!id||!workspace_id)throw Error('缺少原工作綁定。');return this.session(async call=>{
  const b=balanceValue(await call('get_balance',{}));if(b.workspace_id!==workspace_id)throw Error('目前工作區不同，原工作保留待核對。');
  const r=await call('get_generations',{job_ids:[id],wait_seconds:0});if(!Array.isArray(r.jobs)||r.jobs.length!==1||r.jobs[0].job_id!==id||r.jobs[0].job?.job_id!==id)throw Error('原工作回應無法核對。');const j=r.jobs[0].job;
  return {job_id:j.job_id,workspace_id,status:j.status,currency:j.currency??null,cost:j.cost??null,charge_confirmed:typeof j.cost==='number'&&typeof j.currency==='string',poll_after_seconds:r.poll_after_seconds??j.poll_after_seconds??10,error:j.error?String(j.error.code??'REMOTE_FAILED'):null,outputs:(j.outputs??[]).map(x=>({asset_id:x.asset_id,content_type:x.content_type,status:x.status,width:x.width,height:x.height}))};
 },{signal,paid:false});}
}
