// End a finite grant independently of wake-up time, global stop or daily quotas.
// Active leases retain the existing cancellation/settlement path before cleanup.
export function reconcileAuthorizationExpiry(store,now,{dailyEnabled=false}={}){
 const c=store.get('control');
 if(store.get('lease')||!['running','paused'].includes(c.mode)||!Number.isFinite(c.authorization_until)||c.authorization_until<=0||now<c.authorization_until||c.next_wake?.source==='birth-scheduled'||store.get('life').state==='unborn')return false;
 return store.tx(()=>{
  const previous_wake=c.next_wake;
  c.mode='stopped';c.stop_lock=true;c.next_wake=null;c.initial_start=false;c.version++;
  if(c.provider_retry)c.provider_retry.active=false;
  const message=dailyEnabled?'本次生活已結束；每日生活仍開啟，等待下一個既定時段，不補跑。':'本次生活已結束，等待 Owner 明確授權；不自動隔日恢復或補跑';
  c.reason=message;c.inference_status={phase:'authorization_ended',model:c.inference_status?.model??null,message,at:now};
  store.set('control',c);store.event('authorization.ended',{authorization_until:c.authorization_until,observed_at:now,previous_wake,control:c},'controller');return true;
 });
}
