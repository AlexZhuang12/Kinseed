import fs from 'node:fs';import path from 'node:path';import {DatabaseSync} from 'node:sqlite';
import {safeDirectory} from './platform.mjs';import {hash} from './store.mjs';import {taipeiDay,summarizeJournal,journalEntry} from './journal-model.mjs';
export function reportDay(day){if(typeof day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(day)||taipeiDay(day+'T12:00:00+08:00')!==day)throw Error('請選擇有效的台北日期。');return day;}
export function nextReportAt(now=Date.now()){const day=taipeiDay(now),today=Date.parse(day+'T23:00:00+08:00');return today>now?today:today+86400000;}
const narrativeTypes=new Set(['owner.message','tool.owner_reply','tool.web.result','tool.web.failed','consult.result','consult.failed','individual.registered','individual.born','identity.adopted','owner.resume','owner.stop','owner.pause','owner.window','owner.permissions','owner.activity_budget','controller.shutdown','recovery.stopped','provider.retry_scheduled','provider.retry_cancelled','birth.first_activity_cancelled','tool.denied','capability.request_denied','cycle.incomplete','codex.exit','tool.note.result','cycle.committed','restore.applied']);
function readDB(file,fn){const db=new DatabaseSync(file,{readOnly:true});try{db.exec('BEGIN');return fn(db);}finally{db.close();}}
export function collectReportSource(runtime,day,{now=Date.now(),excluded=[]}={}){
 reportDay(day);if(day>taipeiDay(now))throw Error('尚未發生的日期不能整理。');
 const entities=readDB(safeDirectory(runtime,path.join(runtime,'registry.sqlite')),db=>db.prepare('SELECT body FROM entities ORDER BY id').all().map(r=>JSON.parse(r.body)));
 const cutoff=new Date(now).toISOString(),individuals=[];
 for(const info of entities){const individual_id=info.individual_id;if(excluded.includes(individual_id))continue;if(!/^[-a-z0-9]{1,80}$/.test(individual_id))throw Error('個體路徑不合法。');
  const file=safeDirectory(runtime,path.join(runtime,'individuals',individual_id,'kinseed.sqlite'));
  individuals.push(readDB(file,db=>{
   const rows=db.prepare('SELECT * FROM events ORDER BY seq').all();let prev='';const events=[];
   for(const row of rows){if(row.prev_hash!==prev||row.hash!==hash(prev+row.body))throw Error('原始歷史完整性檢查失敗，沒有產生報告。');prev=row.hash;const e=JSON.parse(row.body);if(e.individual_id!==individual_id)throw Error('歷史個體不一致，沒有產生報告。');if(e.utc<=cutoff)events.push({seq:row.seq,...e});}
   const summary=summarizeJournal(individual_id,day,events),daily=events.filter(e=>taipeiDay(e.utc)===day),evidence=[],facts=[];
   // Do not transmit profiles, identity source texts, capabilities, leases or unrelated dates to the model.
   for(const e of daily.filter(e=>narrativeTypes.has(e.type))){const entry=journalEntry(e),r=e.result??{};let content={description:entry.text};
    if(e.type==='tool.note.result')content={name:r.name,text:r.text,meaning:'個體自行撰寫的筆記，不代表外界已驗證'};
    else if(e.type==='cycle.committed')content={version:r.a?.version,plan:r.a?.plan??[],meaning:'已保存的後續計畫，不等於計畫已完成'};
    else if(e.type==='codex.exit')content={ok:r.ok===true,failure:r.ok?null:r.provider_failure?.message??'原紀錄未提供明確原因'};
    const item={id:e.event_id,individual_id,utc:e.utc,type:e.type,cycle_id:e.cycle_id,content};evidence.push({...item,original_event:e});facts.push(item);
   }
   const stats={started:summary.started,completed:summary.completed,failed:summary.failed,unconfirmed:summary.unconfirmed,notes:summary.notes,memory_updates:summary.memory_updates,retries:summary.retries,denials:summary.denials};
   const countID=individual_id+':daily-counts';const counts={id:countID,individual_id,name:info.name,day,utc:cutoff,type:'verified_daily_counts',meaning:'只計算所選台北日期截至快照的紀錄；零不代表其他日期沒有生活經驗。',content:stats};facts.unshift(counts);evidence.unshift({...counts,derived_from:daily.filter(e=>['cycle.intent','cycle.committed','codex.exit','tool.note.result','provider.retry_scheduled','tool.denied','capability.request_denied'].includes(e.type)).map(e=>e.event_id)});
   const boundary=rows.findLast(r=>JSON.parse(r.body).utc<=cutoff),snapshot={individual_id,name:info.name,day,cutoff,stats,has_activity:summary.started>0||summary.notes>0||summary.memory_updates>0,source_boundary:{seq:boundary?.seq??0,hash:boundary?.hash??''},facts,evidence};
   if(Buffer.byteLength(JSON.stringify(facts))>900000)throw Error('此個體當日資料超過單次整理容量；已保留原紀錄，未輸出省略版報告。');return snapshot;
  }));
 }
 return {day,cutoff,individuals,source_hash:hash(individuals)};
}
// A citation may quote a JSON fragment (legacy count citations) or an exact
// contiguous string value. Never normalize, join fields, or repair model text.
export function exactReportQuote(fact,quote){
 if(JSON.stringify(fact).includes(quote))return true;
 const contains=value=>typeof value==='string'?value.includes(quote):value&&typeof value==='object'?Object.values(value).some(contains):false;
 return !!contains(fact);
}
export function validateNarrative(value,facts,{maxParagraphs=6}={}){
 if(!value||Object.keys(value).some(k=>!['paragraphs'].includes(k))||!Array.isArray(value.paragraphs)||!value.paragraphs.length||value.paragraphs.length>maxParagraphs)throw Error('報告格式未通過檢查。');
 const sources=new Map(facts.map(f=>[f.id,f]));let length=0;
 for(const p of value.paragraphs){if(!p||Object.keys(p).some(k=>!['text','citations'].includes(k))||typeof p.text!=='string'||!p.text.trim()||p.text.length>900||!Array.isArray(p.citations)||!p.citations.length||p.citations.length>12)throw Error('報告段落未附有效依據。');length+=p.text.length;
  for(const c of p.citations)if(!c||Object.keys(c).some(k=>!['id','quote'].includes(k))||typeof c.quote!=='string'||c.quote.length<2||c.quote.length>300||!sources.has(c.id)||!exactReportQuote(sources.get(c.id),c.quote))throw Error('報告引用不是來源原文，沒有發布。');
 }if(length>2600)throw Error('報告過長，沒有發布。');return value;
}
export function validateGrounding(value,narrative){if(!value||!Array.isArray(value.checks)||value.checks.length!==narrative.paragraphs.length||value.checks.some((c,i)=>c.index!==i||c.supported!==true))throw Error('內容依據檢查未通過，沒有發布；可重新整理。');return true;}
