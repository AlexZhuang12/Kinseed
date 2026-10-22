import {zonedDay,dayStart} from '../timezone.mjs';
import {hash} from './store.mjs';import {windowAt} from '../controller.mjs';
const exact=(b,keys)=>{if(!b||typeof b!=='object'||Array.isArray(b)||Object.keys(b).some(k=>!keys.includes(k))||keys.some(k=>!Object.hasOwn(b,k)))throw Error('TEMPORARY_SCHEMA');};
export function temporaryPreview(p,b){
 exact(b,['individual_id','minutes']);if(!Number.isInteger(b.minutes)||b.minutes<1||b.minutes>240)throw Error('臨時生活請填寫1至240分鐘的整數。');
 const e=p.entity(b.individual_id),c=e.store.get('control'),life=e.store.get('life'),identity=e.store.get('identities').at(-1),g=p.global(),now=p.now(),day=zonedDay(now,p.timezone),blockers=[];
 if(life.state==='unborn'||!life.identity_version||!identity)blockers.push('此個體尚未完成身份採用與首次出生，請先完成原出生流程。');
 if(e.store.get('lease')||c.mode!=='stopped'||!c.stop_lock)blockers.push('請先停止這個個體並等待本輪結束，再授權這一次臨時生活。');
 if(g.stopped)blockers.push('平台處於全域停止。請先到平台設定核對影響範圍，再由Owner解除；本操作不會代為解除。');
 if(e.fatal||e.stopping)blockers.push('此個體的執行狀態需要檢查，請先查看診斷。');
 if(p.engineering&&!e.info.profile.test_only)blockers.push('隔離驗收環境不能啟動正式個體。');
 if(c.cycles_used>=c.max_cycles)blockers.push('這個個體的剩餘活動輪數不足；臨時生活不會清零，請先核對活動上限。');
 const used=g.day===day?g.used:0;if(used>=g.limit)blockers.push('平台今天的模型額度已用完，請先核對平台上限。');
 const material={individual_id:b.individual_id,minutes:b.minutes,control_version:c.version,identity_version:life.identity_version,package_hash:identity?.package_hash??null,generation:life.generation,recovery_generation:life.recovery_generation,global_version:g.version,max_cycles:c.max_cycles,global_limit:g.limit};
 return {individual_id:b.individual_id,name:e.info.name,minutes:b.minutes,can_start:!blockers.length,blockers,confirmation_hash:hash(material),estimated_start:now,estimated_end:now+b.minutes*60000,daily:{start:c.window_start,minutes:c.window_minutes},budget:{used:c.cycles_used,limit:c.max_cycles,remaining:Math.max(0,c.max_cycles-c.cycles_used),platform_used:used,platform_limit:g.limit},identity:{version:life.identity_version,title:identity?.package?.title??null},message:'最終確認時起算；只授權這一次，不改每日時段、不清零額度、不恢復其他個體。'};
}
export function startTemporaryLife(p,b){
 exact(b,['individual_id','minutes','confirmation_hash','confirmation','request_id']);if(typeof b.request_id!=='string'||!b.request_id||b.request_id.length>100||b.confirmation!=='我授權此個體這一次臨時生活')throw Error('請由Owner核對對象後，明確確認這一次臨時生活。');
 const e=p.entity(b.individual_id),key='temporary-life:'+b.request_id,input_hash=hash(b),prior=e.store.receipt(key);if(prior){if(prior.input_hash!==input_hash)throw Error('IDEMPOTENCY_CONFLICT');return prior;}
 const view=temporaryPreview(p,{individual_id:b.individual_id,minutes:b.minutes});if(view.confirmation_hash!==b.confirmation_hash)throw Error('個體或平台設定已變更。請重新檢查這一次的對象與額度，再確認。');if(!view.can_start)throw Error(view.blockers[0]);
 return e.store.tx(()=>{const c=e.store.get('control'),now=p.now(),end=now+b.minutes*60000,daily=windowAt({...c,temporary_window:null},now),budget_day=c.cycles_day||daily.day;
  c.temporary_window={start:now,end,budget_day,request_id:b.request_id};c.mode='running';c.stop_lock=false;c.initial_start=false;c.authorization_until=end;c.next_wake={at:now,source:'owner-temporary',key:'temporary:'+b.request_id};c.version++;c.provider_retry=null;c.inference_status=null;c.reason='Owner已明確授權這一次臨時生活；每日時段不變';e.store.set('control',c);
  const event=e.store.event('owner.temporary_life',{minutes:b.minutes,control:c,original_daily:{start:c.window_start,minutes:c.window_minutes}},'owner',{request_id:b.request_id});const receipt={individual_id:b.individual_id,name:e.info.name,start:now,end,minutes:b.minutes,request_id:b.request_id,event_id:event.event_id,input_hash,daily_unchanged:true,used_preserved:c.cycles_used};e.store.putReceipt(key,receipt);return receipt;
 });
}
