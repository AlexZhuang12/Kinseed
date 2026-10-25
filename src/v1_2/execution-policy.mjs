// Owner consent is durable; execution holds are bounded and independently recorded.
import {hash} from './store.mjs';
const optional=(e,key,fallback=null)=>{const r=e.store.db.prepare('SELECT value FROM state WHERE key=?').get(key);return r?JSON.parse(r.value):fallback;};
export const executionHold=e=>optional(e,'execution_hold');
export function holdExecution(e,kind,message,{scope='individual',tools=[],until=null,requires_owner=false}={}){
 const next={kind,message,scope,tools,until,requires_owner};const old=executionHold(e);if(old&&hash({...old,at:0})===hash({...next,at:0}))return old;
 return (e.store.db.isTransaction?fn=>fn():fn=>e.store.tx(fn))(()=>{const value={...next,at:e.now()};e.store.set('execution_hold',value);e.store.event('execution.held',{...value,daily_authority_preserved:true},'controller');return value;});
}
export function clearExecutionHold(e,reason){if(!executionHold(e))return;return (e.store.db.isTransaction?fn=>fn():fn=>e.store.tx(fn))(()=>{e.store.set('execution_hold',null);e.store.event('execution.rechecked',{reason,daily_authority_preserved:true},'controller');});}
export function executionView(e){const hold=executionHold(e)??(e.fatal?{kind:'integrity',scope:'individual',message:'執行紀錄或收尾需要檢查：'+e.fatal,requires_owner:true}:e.platform?.runtimeHold?{...e.platform.runtimeHold,scope:'platform'}:null);return {hold,authority_preserved:true,message:hold?hold.message:'目前沒有待處理的執行阻擋。'};}
export const recoveryContext=e=>optional(e,'execution_recovery',[]);
export const recoverySummary=e=>recoveryContext(e).map(({operations,...record})=>({...record,operations:(operations??[]).map(({key,name,status,external,result})=>({key,name,status,external,receipt:result&&typeof result==='object'?Object.fromEntries(['event_id','artifact_id','file_id','document_id','job_id','id','version','name'].filter(k=>Object.hasOwn(result,k)).map(k=>[k,result[k]])):null}))}));
// Paid requests use their durable ledger, not cycle-scoped external retries.
const mutations=new Set(['write_note','work_save','work_import','run_javascript','send_owner','reply_owner','consult_llm','download_web','request_upload','delegate_codex','project_save','project_run','document_create','image_read','tool_request','reminder_save','reminder_ack','mail_draft']);
const external=new Set(['consult_llm','download_web','request_upload','delegate_codex']);
const longTools=new Set(['hedra_models','hedra_model','hedra_save','hedra_quote','browse_web','search_web','consult_llm','download_web','delegate_codex','project_run','document_create','image_read','data_query','document_view','run_javascript']);
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
export function operationKey(name,args){const {request_id,expected_version,...content}=args;return hash(canonical({name,content}));}
const orders=a=>a.length?a.flatMap((k,i)=>orders(a.filter((_,j)=>j!==i)).map(rest=>[k,...rest])):[[]];
export function checkExecutionTool(e,name,args,l){
 const h=executionHold(e);if(h&&(h.scope==='individual'||h.tools.includes(name)))throw Error('此操作暫時受阻：'+h.message+'；每日生活授權仍保留。');
 if(longTools.has(name)&&(l.deadline-e.now()<(name==='hedra_save'?60000:35000)||l.tool_calls>=14))throw Error('本輪接近收尾時間，請先提交目前真實進度；下一輪仍可使用原本已授權的工具。');
 const permission={write_note:'note',work_save:'workbench',work_import:'workbench',run_javascript:'execute',consult_llm:'consult',download_web:'web',request_upload:'web',delegate_codex:'codex'}[name];if(permission&&!e.store.get('control').permissions[permission])throw Error(['workbench','execute'].includes(permission)?'Owner尚未開放這項作品編輯或隔離執行權限。':'PERMISSION_DENIED');if(name==='run_javascript'&&!e.store.get('control').permissions.workbench)throw Error('Owner尚未開放作品編輯權限。');const hubPermission={project_save:'projects',project_run:'projects',document_create:'documents',image_read:'vision',mail_draft:'mail'}[name];if(hubPermission)e.platform.toolHub?.require(e,hubPermission);
 if(mutations.has(name)){const key=operationKey(name,args);for(const r of recoveryContext(e)){if(r.life_hash&&r.life_hash!==hash(e.store.get('life')))continue;const old=r.operations?.find(x=>x.key===key&&x.status==='completed');if(old)return {cached:true,result:old.result,key};}}
 return {cached:false,key:operationKey(name,args),tracked:mutations.has(name),external:external.has(name)};
}
export function recordOperation(e,l,name,args,info,status,result=null){
 if(!info.tracked)return;
 (e.store.db.isTransaction?fn=>fn():fn=>e.store.tx(fn))(()=>{const live=e.store.get('lease');if(!live||live.cycle_id!==l.cycle_id)throw Error('STALE_LEASE');live.operations??=[];let row=live.operations.find(x=>x.key===info.key);if(!row){row={key:info.key,name,external:info.external,status:'started'};live.operations.push(row);}row.status=status;if(status==='completed')row.result=result;live.mutation_attempted=true;e.store.set('lease',live);e.store.event('operation.'+status,{key:row.key,name,external:row.external,...(status==='completed'?{result}: {})},'controller',live);});
}
export function rememberIncomplete(e,l,result){
 const operations=l.operations??[],unknown=operations.filter(x=>x.status!=='completed');
 const noteRows=e.store.db.prepare("SELECT body FROM events WHERE json_extract(body,'$.cycle_id')=? AND json_extract(body,'$.type')='tool.note.result'").all(l.cycle_id).map(x=>JSON.parse(x.body));
 const record={life_hash:hash(e.store.get('life')),cycle_id:l.cycle_id,at:e.now(),reason:result.cancel_reason??result.provider_failure?.kind??'incomplete',memory_submitted:l.finished===true,notes:noteRows.map(x=>({event_id:x.event_id,name:x.result.name,artifact_id:x.result.artifact_id})),operations,unknown_tools:unknown.map(x=>x.name),notice:'這是系統保存的操作事實，並非替個體補寫記憶。已成功的操作不可重做；請自行閱讀成果並決定如何更新記憶。'};
 (e.store.db.isTransaction?fn=>fn():fn=>e.store.tx(fn))(()=>{const records=recoveryContext(e).filter(x=>x.cycle_id!==l.cycle_id);records.push(record);const risky=records.some(x=>x.memory_submitted||x.operations?.length);e.store.set('execution_recovery',risky?records:records.slice(-8));if(risky&&records.length>=8)holdExecution(e,'recovery_storage','未完成交接的工作已累積，先核對保存成果，避免遺失或重複操作；每日生活授權保留。',{requires_owner:true});e.store.event('execution.incomplete_recorded',{cycle_id:l.cycle_id,notes:record.notes,unknown_tools:record.unknown_tools,memory_submitted:record.memory_submitted},'controller',l);});return record;
}
export function recoverSettledCycle(e,l,result,c,failure){
 const record=rememberIncomplete(e,l,result),daily=optional(e,'daily_life');
 if(result.local_exit_confirmed!==true||e.fatal||e.stopping||e.platform.runtimeHold||e.platform.global().stopped||c.stop_lock||c.mode!=='running'||c.version!==l.control_version)return null;
 if(['authentication','quota'].includes(failure.kind)){holdExecution(e,'provider_access','等待大腦登入或帳號限制恢復；每日生活授權保留。',{until:failure.kind==='authentication'?e.now()+60000:c.authorization_until});if(failure.kind==='authentication')e.platform.dailyPreflightReady=false;return null;}
 if(['tool_forbidden','invalid_stream'].includes(failure.kind)){holdExecution(e,'security','模型回傳或工具範圍需要核對；每日生活授權保留。',{requires_owner:true});return null;}
 if(record.unknown_tools.length){holdExecution(e,'unknown_operation','部分操作結果尚未確認，暫停這些操作；其他已授權工作仍可進行。',{scope:record.operations.some(x=>!x.external&&x.status!=='completed')?'individual':'tools',tools:[...new Set(record.unknown_tools)],requires_owner:true});}
 if(l.mutation_attempted&&!(l.operations?.length)&&!l.finished){holdExecution(e,'unknown_operation','舊工作有未分類的操作，需先核對結果；每日授權保留。',{requires_owner:true});return null;}
 if(failure.kind==='local_resource'){
  const old=executionHold(e);if(old?.scope==='individual')return null;
  const name=failure.tool,known=name&&/^[a-z_]{1,80}$/.test(name);
  if(known){const tools=[...new Set([...(old?.scope==='tools'?old.tools:[]),name])];holdExecution(e,old?.kind==='unknown_operation'?'unknown_operation':'tool_resource','這些工具結果超過資料通道上限，暫不重做；其他已授權活動仍可進行。',{scope:'tools',tools,requires_owner:true});
   const at=e.now()+30000;if(daily?.enabled&&at<c.authorization_until&&c.cycles_used<c.max_cycles){c.inference_status={phase:'tool_resource_wait',failure:'local_resource',message:'問題工具已隔離，稍後可繼續其他活動；每日授權保留。',at:e.now(),retry_at:at};return {at,source:'resource-continuation',key:l.cycle_id+':other-tools'};}
  }else holdExecution(e,'brain_resource','大腦資料通道超限，等待核對；每日授權保留，沒有把問題歸因個體或帳號。',{requires_owner:true});
  return null;
 }
 const n=optional(e,'execution_recovery_count',0),at=e.now()+[30000,90000,180000][Math.min(n,2)];
 if(!daily?.enabled||n>=3||at>=c.authorization_until||c.cycles_used>=c.max_cycles)return null;
 e.store.set('execution_recovery_count',n+1);c.inference_status={phase:'recovery_wait',failure:failure.kind,message:'成果與未完成事項已保留，稍後以新一輪接續，不重做已確認的操作。',at:e.now(),retry_at:at};
 return {at,source:'settled-continuation',key:l.cycle_id+':continuation'};
}
export async function recheckExecution(p,b){
 if(!b||Object.keys(b).join(',')!=='individual_id')throw Error('請選擇要重新檢查的個體。');const e=p.entity(b.individual_id);e.store.verify();if(e.fatal||e.stopping||e.store.get('lease')||e.inflightTools?.size||e.workbenchSettlementBlocked)throw Error('工作或紀錄尚未確認收尾；每日授權保留，請先處理診斷原因。');
 const h=executionHold(e);if(h&&['identity_changed','settings_changed','unknown_operation','security','restart_unknown','recovery_storage'].includes(h.kind))throw Error('這項阻擋仍需核對身份、設定或操作結果，不能用重新檢查跳過。');
 if(p.refreshPreflight)await p.refreshPreflight();if(p.dailyPreflightReady===false)throw Error('大腦環境仍未通過檢查；生活授權保留。');if(p.runtimeHold){if(p.runtimeHold.kind!=='system'||[...p.individuals.values()].some(x=>x.fatal||x.stopping||x.store.get('lease')||x.inflightTools?.size))throw Error('平台工作尚未確認收尾，不能跳過。');p.verify();for(const x of p.individuals.values())x.store.verify();p.runtimeHold=null;p.set('runtime_hold',null);p.audit('platform.execution_rechecked',{owner_requested:true,authority_preserved:true});}clearExecutionHold(e,'Owner要求重新核對已修復的環境');return {individual_id:b.individual_id,execution:executionView(e)};
}

// Index only existing, confirmed local note receipts; never synthesize model memory.
export function indexLegacyIncomplete(e){
 if(e.store.get('lease')||recoveryContext(e).length)return false;
 const last=e.store.db.prepare("SELECT seq,body FROM events WHERE json_extract(body,'$.type') IN ('cycle.committed','cycle.incomplete') ORDER BY seq DESC LIMIT 1").get();if(!last)return false;const end=JSON.parse(last.body);if(end.type!=='cycle.incomplete'||end.result.finished!==false)return false;
 const rows=e.store.db.prepare("SELECT body FROM events WHERE json_extract(body,'$.cycle_id')=? ORDER BY seq").all(end.cycle_id).map(r=>JSON.parse(r.body));if(rows.some(x=>x.type==='execution.legacy_recovery_indexed')||!rows.some(x=>x.type==='codex.exit'&&x.result.local_exit_confirmed===true))return false;
 const notes=rows.filter(x=>x.type==='tool.note.result'),operations=[];if(!notes.length)return false;
 for(const n of notes){const req=rows.find(x=>x.type==='tool.note.request'&&x.request_id===n.request_id),receipt=e.store.receipt('note:'+end.cycle_id+':'+n.request_id);if(!req||!receipt||receipt.artifact_id!==n.result.artifact_id)throw Error('LEGACY_NOTE_RECEIPT_MISMATCH');const args={name:n.result.name,text:n.result.text,reason:req.result.reason,request_id:n.request_id};if(!orders(Object.keys(args)).some(keys=>receipt.input_hash===hash(Object.fromEntries(keys.map(k=>[k,args[k]])))))throw Error('LEGACY_NOTE_INPUT_MISMATCH');const {input_hash,...result}=receipt;operations.push({key:operationKey('write_note',args),name:'write_note',external:false,status:'completed',result});}
 const record={cycle_id:end.cycle_id,at:e.now(),life_hash:hash(e.store.get('life')),reason:'legacy_confirmed_note_without_commit',memory_submitted:false,notes:notes.map(n=>({event_id:n.event_id,name:n.result.name,artifact_id:n.result.artifact_id})),operations,unknown_tools:[],notice:'舊版未完成交接的已保存筆記索引；請閱讀原文後自行決定記憶，不是補寫記憶或重新執行。'};
 e.store.tx(()=>{e.store.set('execution_recovery',[record]);e.store.event('execution.legacy_recovery_indexed',{cycle_id:end.cycle_id,notes:record.notes,source_events:notes.map(n=>n.event_id),memory_unchanged:true},'controller');});return true;
}
