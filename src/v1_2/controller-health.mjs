import {executionHold} from './execution-policy.mjs';
import {dailyView} from './daily-life.mjs';
import {zonedDay,dayStart} from '../timezone.mjs';
import {windowAt} from '../controller.mjs';

export const SETTLEMENT_GRACE_MS=10000;

// This watchdog does not invent a process exit. The shared slot remains held
// until the runner's close callback AND the durable settlement have completed.
export function supervise(e){
 const l=e.store.get('lease');if(!l||e.now()<l.deadline&&!l.cancel_requested_at&&!l.settlement_wait_at)return;
 const now=e.now();
 if(!l.cancel_requested_at){
  e.store.tx(()=>{l.cancel_requested_at=now;if(!l.finished)l.cancel_reason??='DEADLINE_EXCEEDED';e.store.set('lease',l);const c=e.store.get('control');c.inference_status={phase:'cancelling',message:'正在取消並確認本輪及工具工作收尾；暫不派送下一個工作',at:now};e.store.set('control',c);e.store.event('controller.deadline_cancel',{deadline:l.deadline},'controller',l);});
  e.cancelAll('DEADLINE_EXCEEDED');
 }
 if(now>=Math.min(l.deadline,l.cancel_requested_at,l.settlement_wait_at??Infinity)+SETTLEMENT_GRACE_MS&&!l.quarantined){
  e.store.tx(()=>{l.quarantined=true;e.store.set('lease',l);const c=e.store.get('control');c.mode='stopped';c.stop_lock=true;c.next_wake=null;c.version++;c.reason='取消後仍未確認本機工作結束，已停止此個體並保留排程位置；請查看執行診斷';c.inference_status={phase:'settlement_blocked',message:c.reason,at:now};e.store.set('control',c);e.store.event('controller.settlement_blocked',{control:c},'controller',l);});
 }
}

export function reconcileQuota(e){
 if(e.store.get('lease'))return;
 const c=e.store.get('control');if(c.mode!=='running'||c.stop_lock)return;
 const g=e.platform.global(),w=windowAt(c,e.now()),day=zonedDay(e.now(),e.platform.timezone);
 const reason=c.cycles_day===w.day&&c.cycles_used>=c.max_cycles?'個體活動輪數已用完；已停止本次安排':g.day===day&&g.used>=g.limit?'平台今天的活動輪數已用完；已停止本次安排':null;
 if(reason)e.store.tx(()=>{c.mode='stopped';c.stop_lock=true;c.next_wake=null;c.version++;c.reason=reason;if(c.provider_retry)c.provider_retry.active=false;c.inference_status={phase:'quota_exhausted',message:reason,at:e.now()};e.store.set('control',c);e.store.event('controller.quota_ended',{control:c},'controller');});
}

export function activityHealth(e){
 const c=e.store.get('control'),l=e.store.get('lease'),g=e.platform.global(),now=e.now();
 const result=(phase,message,action='無需操作')=>({phase,message,action,deadline:l?.deadline??null,next_at:c.next_wake?.at??null});
 if(e.fatal)return result('needs_attention','執行紀錄或控制器收尾失敗，已阻止繼續派送。','查看執行診斷；保留資料後修復控制器，勿重複啟動');
 if(l?.quarantined)return result('settlement_blocked','尚未確認上一個本機工作結束，共同排程暫停派送。','查看執行診斷；不要重複啟動或另開控制器');
 if(l?.settlement_wait_at)return result('cancelling','模型程序已結束，正在確認本輪工具及諮詢工作收尾。');
 if(l?.cancel_requested_at||l?.cancel_reason)return result('cancelling','正在取消上一輪並確認安全收尾。');
 if(l)return result('executing','正在執行本輪；完成或到截止時間後會收尾。');
 if(e.store.get('life').state==='unborn')return result('unborn','尚未出生。','由Owner完成身份採用及首次出生');
 if(g.stopped)return result('global_stopped','平台處於全域停止；解除不會自動恢復個體。','由Owner核對平台及個體狀態後決定是否恢復');
 const daily=dailyView(e),hold=executionHold(e);if(daily.enabled&&e.platform.runtimeHold)return result('execution_held','每日授權保留；'+e.platform.runtimeHold.message,'查看阻擋原因');if(daily.enabled&&hold&&hold.scope==='individual')return result('execution_held','每日授權保留；'+hold.message,'修復原因後重新檢查');if(daily.enabled&&c.mode==='stopped'&&c.inference_status?.phase==='window_failed')return {...result('daily_window_failed',c.inference_status.message,'本次活動未完成；保留每日安排，等待下一個既定時段。'),next_at:daily.next_start};
 if(daily.enabled&&c.mode==='stopped')return {...result('daily_waiting','每日生活已開啟，等待下一個既定時段。'),next_at:daily.next_start};
 if(c.mode!=='running'||c.stop_lock)return result('stopped',c.inference_status?.message??c.reason??'此個體已停止。','確認原因後，由Owner決定是否授權生活');
 if(now<c.authorization_until&&c.next_wake?.source==='birth-scheduled'&&now<c.next_wake.at&&c.next_wake.at<c.authorization_until)return result('scheduled','已出生，尚未到第一次活動時間；沒有占用模型。','等待畫面顯示的首次活動時間，不必再次出生或恢復');
 if(now>=c.authorization_until||!windowAt(c,now).open)return result('ended','本次生活時段已結束，沒有自動延長。','由Owner另行授權生活');
 if(c.cycles_used>=c.max_cycles)return result('quota','個體活動輪數已用完。','核對活動輪數；本系統不會自動增加額度');
 const day=zonedDay(now,e.platform.timezone);
 if(g.day===day&&g.used>=g.limit)return result('quota','平台今天的活動輪數已用完。','核對平台額度');
 if(c.next_wake?.source==='provider-retry'&&c.next_wake.at>now)return result('retry_wait',c.inference_status?.message??'模型暫時無法服務，等待有限重試；不占共同排程位置。');
 if(c.next_wake?.at>now)return result('sleeping','等待下一次預定活動，現在沒有占用模型。');
 if(c.next_wake&&g.worker){const other=e.platform.individuals.get(g.worker.individual_id),blocked=other?.fatal||other?.store.get('lease')?.quarantined;return result(blocked?'queue_blocked':'queued',blocked?'前一個工作尚未安全收尾，共同排程暫停派送。':'已準備活動，等前一個個體完成後輪流執行。',blocked?'查看平台執行診斷；勿重複啟動':'無需操作');}
 if(c.next_wake)return result('ready','已準備活動，等待排程派送。');
 return result('needs_attention','有生活授權但沒有下一次活動安排。','查看執行診斷，確認前輪結果後再決定恢復');
}
