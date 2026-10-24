import {recoverSettledCycle} from './execution-policy.mjs';
import {zonedDay} from '../timezone.mjs';
import {windowAt} from '../controller.mjs';
export const INFERENCE_POLICY=Object.freeze({model:'gpt-6.1-sol',reasoning:'low',retry_delays_ms:Object.freeze([30000,90000,180000]),fallback:false});
// Only structured CLI error events are signals; never classify model prose or stderr as authority.
export function providerFailure(events){
 const messages=events.filter(e=>e.type==='error'||e.type==='turn.failed').map(e=>e.error?.message??e.message??'').filter(x=>typeof x==='string');
 if(messages.some(x=>/unauthorized|authentication|token.*expired|not logged in/i.test(x)))return {kind:'authentication',message:'請先重新登入 Codex，再按「明確恢復已生活個體」；身份及出生紀錄保留',retryable:false,terminal:true};
 if(messages.some(x=>/usage limit|quota exceeded|insufficient_quota|rate limit/i.test(x)))return {kind:'quota',message:'帳號用量或請求限制已到；請等額度恢復後，在有效時段按「明確恢復已生活個體」',retryable:false,terminal:true};
 if(messages.some(x=>/selected model is at capacity|model_capacity_exceeded|server is overloaded/i.test(x)))return {kind:'capacity',message:'模型服務暫時繁忙',retryable:true,terminal:true};
 if(messages.some(x=>/^workspace routing discovery failed(?:[.:]|$)/i.test(x.trim())))return {kind:'transient',message:'模型服務的連線路由暫時無法建立',retryable:true,terminal:true};
 if(messages.some(x=>/stream disconnected|connection (?:reset|closed)|connection_reset|temporarily unavailable|service unavailable|internal server error|bad gateway|gateway timeout/i.test(x)))return {kind:'transient',message:'模型連線中斷或服務暫時無法回應',retryable:true,terminal:true};
 return {kind:'unknown',message:'本輪結果未完整確認，已保留紀錄並停止重送',retryable:false,terminal:false};
}
export function retryDecision(e,l,result,c){
 const p=e.platform,now=e.now(),timedOut=result.cancelled===true&&result.local_exit_confirmed===true&&now>=l.deadline&&!l.quarantined&&!['authentication','quota'].includes(result.provider_failure?.kind)&&(!l.cancel_reason||l.cancel_reason==='DEADLINE_EXCEEDED');
 const failure=timedOut?{kind:'timeout',message:'模型回應逾時，本機工作已結束',retryable:true,terminal:true}:result.provider_failure??{kind:'unknown',message:'本輪未完整完成',retryable:false},retries=c.provider_retry?.retries??0;
 c.inference_status={phase:'needs_attention',model:e.brainBinding?.model??INFERENCE_POLICY.model,failure:failure.kind,message:failure.message,at:now,retries};
 if(c.provider_retry)c.provider_retry.active=false;
 if(c.stop_lock||c.mode!=='running'||c.version!==l.control_version){c.inference_status.phase='interrupted';c.inference_status.message='活動已依停止指令或設定變更中止，不會自動重試';return null;}
 const life=e.store.get('life');if(!life||life.state!=='born'||l.identity_version!==life.identity_version||l.generation!==life.generation||l.recovery_generation!==life.recovery_generation){c.inference_status.phase='interrupted';c.inference_status.message='個體身份或恢復狀態已變更，已停止；不會沿用舊輪次自動重試';return null;}
 if(['authentication','quota'].includes(failure.kind))return recoverSettledCycle(e,l,result,c,failure);
 if(l.cancel_reason&&!timedOut){c.inference_status.phase='interrupted';c.inference_status.message=l.cancel_reason==='STALE_LEASE'?'本輪授權或設定已不相符，已停止；請核對目前狀態後再決定是否恢復':l.cancel_reason==='DEADLINE_EXCEEDED'?'本輪已逾時，但工作尚未確認安全收尾；暫不重試，請查看執行診斷':'本輪已取消，沒有自動重試；請核對停止原因與目前授權';return null;}
 if(l.finished||l.mutation_attempted)return recoverSettledCycle(e,l,result,c,failure);
 const recognized=failure.kind==='capacity'||failure.kind==='transient'&&result.local_exit_confirmed===true||timedOut;
 const safe=!result.ok&&(!result.cancelled&&result.exit_code===1||timedOut)&&recognized&&failure.retryable===true&&failure.terminal===true&&!l.finished&&!l.mutation_attempted&&!e.fatal&&!e.stopping&&!p.global().stopped&&c.mode==='running'&&!c.stop_lock&&c.version===l.control_version&&(!l.cancel_reason||timedOut);
 if(!safe)return recoverSettledCycle(e,l,result,c,failure);
 // Only an explicitly recognized, settled and side-effect-free failure may end
 // this window without revoking the Owner's future daily authorization.
 const endWindow=message=>{if(result.local_exit_confirmed===true)c.inference_status.phase='window_failed';c.inference_status.message=message;return null;};
 const delay=INFERENCE_POLICY.retry_delays_ms[retries];if(delay===undefined)return endWindow('模型仍未恢復，已達3次自動重試上限，本次活動結束；若每日生活仍開啟，將於下個既定時段重新檢查。');
 const at=now+delay,w=windowAt(c,at),g=p.global(),day=zonedDay(at,p.timezone);
 if(at>=c.authorization_until||!w.open)return endWindow('本次活動授權時間不足以重試，本次活動結束；若每日生活仍開啟，將於下個既定時段重新檢查。');
 if(c.cycles_day===w.day&&c.cycles_used>=c.max_cycles||g.day===day&&g.used>=g.limit)return endWindow('本次可用活動輪數已用完，沒有增加額度或再發出模型請求；若每日生活仍開啟，保留下一個既定時段。');
 c.provider_retry={retries:retries+1,active:true,at,until:c.authorization_until,failed_cycle:l.cycle_id};
 c.inference_status={phase:'retry_wait',model:e.brainBinding?.model??INFERENCE_POLICY.model,failure:failure.kind,message:failure.message+'，系統會自動再試，您不必按恢復',at:now,retries:retries+1,retry_at:at,max_retries:INFERENCE_POLICY.retry_delays_ms.length};
 return {at,source:'provider-retry',key:l.cycle_id+':retry'};
}
