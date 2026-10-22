// Owner-only read projections. No state, receipt, history or model writes.
export const MEMORY_LIMITS=Object.freeze({memory_items:60,plan_items:20,memory_chars_per_item:1000,plan_chars_per_item:500,commit_chars:20000});
export function memoryUsage(a){return {memory_items:a.memory.length,plan_items:a.plan.length,memory_chars:a.memory.reduce((n,s)=>n+s.length,0),plan_chars:a.plan.reduce((n,s)=>n+s.length,0),result_chars:(a.last_result??'').length};}
export function memoryDifference(before=[],after=[]){
 // Exact-text multiset matching avoids calling reordered entries new memories.
 const old=before.map(text=>({text,matched:false})),added=[];
 for(const text of after){const item=old.find(x=>!x.matched&&x.text===text);if(item)item.matched=true;else added.push(text);}
 return {changed:JSON.stringify(before)!==JSON.stringify(after),added_or_rewritten:added,removed_or_rewritten:old.filter(x=>!x.matched).map(x=>x.text),unchanged:old.filter(x=>x.matched).length,order_only:JSON.stringify(before)!==JSON.stringify(after)&&!added.length&&old.every(x=>x.matched),method:'exact_text_not_semantic'};
}
const kinds="('cycle.committed','restore.applied','system.created')";
const predicate="json_extract(body,'$.type') IN "+kinds+" AND json_type(body,'$.result.a')='object'";
function versionRow(row){if(!row)return null;const e=JSON.parse(row.body),a=e.result.a;return {event_id:e.event_id,seq:row.seq,at:e.utc,type:e.type,version:a.version,memory:a.memory,plan:a.plan,result:a.last_result??'',usage:memoryUsage(a)};}
export function memorySnapshot(e,before=Number.MAX_SAFE_INTEGER){
 if(!Number.isSafeInteger(before)||before<1)throw Error('請使用上一頁提供的記憶紀錄位置。');
 const db=e.store.db;db.exec('BEGIN');try{
 const a=e.store.get('a'),rows=db.prepare('SELECT seq,body FROM events WHERE '+predicate+' AND seq<? ORDER BY seq DESC LIMIT 26').all(before),page=rows.slice(0,25);
 const out={individual_id:e.info.individual_id,name:e.info.name,limits:MEMORY_LIMITS,current:{version:a.version,memory:a.memory,plan:a.plan,result:a.last_result??'',usage:memoryUsage(a)},versions:page.map(r=>{const {memory,plan,result,...v}=versionRow(r);return v;}),next_before:rows.length>25?page.at(-1).seq:null};
 db.exec('COMMIT');return out;}catch(err){db.exec('ROLLBACK');throw err;}
}
export function memoryVersion(e,event_id){
 if(typeof event_id!=='string'||!event_id||event_id.length>100)throw Error('請先選擇一筆記憶版本。');
 const db=e.store.db;db.exec('BEGIN');try{
 const row=db.prepare('SELECT seq,body FROM events WHERE event_id=? AND '+predicate).get(event_id);if(!row)throw Error('找不到這個個體自己的記憶版本，請重新讀取清單。');
 const chosen=versionRow(row),previous=versionRow(db.prepare('SELECT seq,body FROM events WHERE '+predicate+' AND seq<? ORDER BY seq DESC LIMIT 1').get(row.seq));
 const out={individual_id:e.info.individual_id,name:e.info.name,selected:chosen,previous,difference:{memory:memoryDifference(previous?.memory??[],chosen.memory),plan:memoryDifference(previous?.plan??[],chosen.plan)}};
 db.exec('COMMIT');return out;}catch(err){db.exec('ROLLBACK');throw err;}
}
