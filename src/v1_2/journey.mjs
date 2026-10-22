import {zonedDay,dayStart} from '../timezone.mjs';
import {firstWindow} from './birth-window.mjs';
import {hash,id} from './store.mjs';
import {digest,approvalIssues} from './identity.mjs';
import {windowAt} from '../controller.mjs';

const exact=(b,keys)=>{if(!b||typeof b!=='object'||Array.isArray(b)||Object.keys(b).some(k=>!keys.includes(k)))throw Error('JOURNEY_REQUEST_SCHEMA');};
const changed=()=>Error('CONFIRMATION_CHANGED');
export class OwnerJourney {
 constructor(platform){this.p=platform;}
 review(review_id){
  const p=this.p,r=p.get('review:'+review_id);if(!r)throw Error('REVIEW_NOT_FOUND');
  const source=p.package(r.package_id,r.package_version);if(hash(source)!==r.package_hash)throw Error('REVIEW_CONTENT_CHANGED');
  const e=p.entity(r.individual_id),life=e.store.get('life'),original=p.get('preview:'+r.preview_id);
  const preview=p.preview({individual_id:r.individual_id,package_id:r.package_id,package_version:r.package_version},false);
  const changes=[];let blocked=false;
  if(r.draft_id&&p.builder.head(r.draft_id).revision!==r.revision){changes.push('提交後草稿已有修訂。此提案保留提交時的身份原文；請先核對草稿的新內容，不能把它當成原提案批准。');blocked=true;}
  if(original?.identity_version!==undefined&&original.identity_version!==life.identity_version)changes.push('此個體目前採用的身份已改變；下方差異已更新，請重新核對後確認。');
  const material={review_id:r.review_id,individual_id:r.individual_id,package_id:r.package_id,version:r.package_version,package_hash:r.package_hash,revision:r.revision,current_identity_version:life.identity_version,current_identity_hash:preview.previous?.package_hash??null,generation:life.generation,recovery_generation:life.recovery_generation};
  return {...r,status:p.builder.reviewStatus(r),preview,changes,blocked,confirmation_hash:blocked?null:digest(material)};
 }
 approve(b){
  const p=this.p,r=p.get('review:'+b.review_id);if(!r)throw Error('REVIEW_NOT_FOUND');
  if(p.engineering&&!p.entity(r.individual_id).info.profile.test_only)throw Error('FORMAL_ADOPTION_FORBIDDEN_IN_ENGINEERING');
  if(p.builder.reviewStatus(r)==='approved')return p.entity(r.individual_id).store.receipt('adopt:review-'+r.review_id);
  if(r.status!=='pending')throw Error('REVIEW_CLOSED');
  const view=this.review(b.review_id);if(view.blocked)throw Error('REVIEW_STALE');
  if(typeof b.confirmation_hash!=='string'||b.confirmation_hash!==view.confirmation_hash)throw changed();
  if(approvalIssues(view.preview.source).some(x=>x.severity==='blocking'))throw Error('APPROVAL_BLOCKED');
  // Renew only execution fencing. The immutable proposal and its original preview remain intact.
  const authorization=p.preview({individual_id:r.individual_id,package_id:r.package_id,package_version:r.package_version},false);
  authorization.confirmed_review_id=r.review_id;
  p.tx(()=>{p.set('preview:'+authorization.preview_id,authorization);p.audit('identity.review_revalidated',{review_id:r.review_id,individual_id:r.individual_id,package_hash:r.package_hash,confirmation_hash:b.confirmation_hash});});
  return p.adopt({individual_id:r.individual_id,preview_id:authorization.preview_id,review_id:r.review_id,request_id:'review-'+r.review_id});
 }
 readiness(individual_id){
  const p=this.p,e=p.entity(individual_id),c=e.store.get('control'),life=e.store.get('life'),identity=e.store.get('identities').at(-1),g=p.global(),w=windowAt(c,p.now());
  const blockers=[];
  if(life.state!=='unborn')blockers.push({code:'ALREADY_LIVED',message:'此個體已有出生或生活紀錄，請使用恢復生活，不會再次出生。',action:'resume'});
  if(!life.identity_version||!identity?.package)blockers.push({code:'IDENTITY_NOT_APPROVED',message:'請先選擇身份並批准採用，再準備首次出生。',action:'review'});
  if(g.stopped)blockers.push({code:'GLOBAL_STOP',message:'平台目前全域停止。請先查看解除停止的影響範圍，再由 Owner 確認；其他個體不會自動恢復。',action:'global'});
  if(e.store.get('lease'))blockers.push({code:'TASKS_NOT_SETTLED',message:'尚有任務未結束，請先停止並等候本機確認。',action:'stop'});
  if(e.fatal||e.stopping)blockers.push({code:'FAIL_CLOSED',message:'執行狀態尚未確認安全，請查看診斷並完成復原後再繼續。',action:'diagnostics'});
  if(p.engineering&&!e.info.profile.test_only)blockers.push({code:'FORMAL_BIRTH_FORBIDDEN_IN_ENGINEERING',message:'隔離驗收模式不允許正式個體出生。',action:'none'});
  const first=firstWindow(c,p.now()),activityAt=Math.max(first.start,p.now());const day=zonedDay(activityAt,p.timezone);
  if(g.day===day&&g.used>=g.limit)blockers.push({code:'GLOBAL_LIMIT',message:'今天平台活動輪數已用完，請等明日額度恢復後再確認。',action:'wait'});
  if(c.cycles_day===zonedDay(first.start,c.timezone)&&c.cycles_used>=c.max_cycles)blockers.push({code:'CYCLE_LIMIT',message:'此生活時段的活動輪數已用完，請在下一個有效時段再確認。',action:'wait'});
  const material={individual_id,identity_version:life.identity_version,package_id:identity?.package?.package_id??null,package_version:identity?.package?.version??null,package_hash:identity?.package_hash??null,generation:life.generation,recovery_generation:life.recovery_generation,state:life.state,first_window:first,window_start:c.window_start,window_minutes:c.window_minutes,permissions:c.permissions,max_cycles:c.max_cycles,global_limit:g.limit};
  const nextStart=activityAt;
  return {individual_id,name:e.info.name??e.info.individual_id,life,identity:identity?{title:identity.package?.title??'早期身份',version:identity.version,package_id:identity.package?.package_id,package_version:identity.package?.version,package_hash:identity.package_hash}:null,settings:{window_start:c.window_start,window_minutes:c.window_minutes,max_cycles:c.max_cycles,permissions:c.permissions,global_limit:g.limit},global_stopped:g.stopped,individual_stopped:c.stop_lock,blockers,can_confirm:blockers.length===0,confirmation_hash:digest(material),first_window:first,next_window_start:nextStart,next_activity:c.next_wake?.at??null,born_at:life.born_at,window_open:w.open};
 }
 birth(b){
  exact(b,['individual_id','confirmation_hash','confirmation','request_id']);
  if(typeof b.request_id!=='string'||!b.request_id||b.request_id.length>80)throw Error('REQUEST_ID');
  if(b.confirmation!=='我授權此指定個體首次出生')throw Error('BIRTH_CONFIRMATION_REQUIRED');
  const p=this.p,e=p.entity(b.individual_id),preview_id='birth-confirm-'+digest({individual_id:b.individual_id,request_id:b.request_id,confirmation_hash:b.confirmation_hash});
  const cmd={individual_id:b.individual_id,preview_id,request_id:'journey-'+b.request_id,confirmation:b.confirmation,timing:'first-window'};
  // The existing transactional receipt makes a lost-response retry exactly the same command.
  if(e.store.receipt('birth:'+cmd.request_id))return p.birth(cmd);
  const view=this.readiness(b.individual_id);
  if(view.confirmation_hash!==b.confirmation_hash)throw changed();
  if(view.blockers.length)throw Error(view.blockers[0].code);
  const preview=p.preview({individual_id:b.individual_id,package_id:view.identity.package_id,package_version:view.identity.package_version,kind:'birth'},false);
  preview.first_window=view.first_window;preview.preview_id=preview_id;p.tx(()=>p.set('preview:'+preview_id,preview));
  return p.birth(cmd); // Original SQLite birth transaction, unique fact and stop checks are retained.
 }
 globalImpact(){
  const p=this.p,g=p.global(),individuals=[...p.individuals.values()].map(e=>({individual_id:e.info.individual_id,name:e.info.name,state:e.store.get('life').state,mode:e.store.get('control').mode,stop_lock:e.store.get('control').stop_lock,next_wake:e.store.get('control').next_wake,has_lease:!!e.store.get('lease')}));
  return {stopped:g.stopped,individuals,can_clear:individuals.every(e=>e.mode!=='running'&&!e.has_lease),confirmation_hash:digest({stopped:g.stopped,individuals}),message:'解除只讓平台可以接受個別啟動授權。尚未出生者不會出生；下列已停止個體也不會恢復。'};
 }
 clearGlobal(b){exact(b,['confirmation_hash','request_id']);const impact=this.globalImpact();if(impact.confirmation_hash!==b.confirmation_hash)throw changed();if(!impact.can_clear)throw Error('GLOBAL_CLEAR_ACTIVE');return this.p.globalCommand({action:'clear',expected_version:this.p.global().version,request_id:b.request_id});}
 route(action,b){if(action==='readiness'){exact(b,['individual_id']);return this.readiness(b.individual_id);}if(action==='globalImpact'){exact(b,[]);return this.globalImpact();}if(action==='birth')return this.birth(b);if(action==='clearGlobal')return this.clearGlobal(b);throw Error('JOURNEY_ROUTE');}
}
