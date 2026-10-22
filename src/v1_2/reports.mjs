import fs from 'node:fs';import path from 'node:path';import {DatabaseSync} from 'node:sqlite';import {id} from './store.mjs';
import {collectReportSource,reportDay,nextReportAt,validateNarrative,validateGrounding} from './report-source.mjs';import {taipeiDay} from './journal-model.mjs';import {runReportModel,narrativePrompt,groundingPrompt} from './report-runner.mjs';
import {effectiveArchived} from './individual-options.mjs';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
export class Reports{
 constructor({dir,runtime,now=()=>Date.now(),model=runReportModel,idle=null,retryDelay=30000}={}){
  this.dir=path.resolve(dir);this.runtime=path.resolve(runtime);this.now=now;this.model=model;this.idle=idle??(()=>this.lifeIdle());this.retryDelay=retryDelay;this.busy=false;this.closed=false;this.abort=new AbortController();fs.mkdirSync(this.dir,{recursive:true});
  this.db=new DatabaseSync(path.join(this.dir,'reports.sqlite'));this.db.exec(`PRAGMA journal_mode=WAL;PRAGMA busy_timeout=3000;CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,day TEXT,automatic_key TEXT UNIQUE,body TEXT);CREATE TABLE IF NOT EXISTS reports(id TEXT PRIMARY KEY,day TEXT,body TEXT);CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT);CREATE TABLE IF NOT EXISTS calls(id TEXT PRIMARY KEY,day TEXT,job_id TEXT);`);
  for(const row of this.db.prepare('SELECT body FROM jobs').all()){const job=JSON.parse(row.body);if(['running','queued','retry_wait','waiting_for_life'].includes(job.phase)){job.phase='failed';job.message='報告服務曾中斷，原報告保留；請按「立即整理」重新執行。';this.save(job);}}
 }
 lifeIdle(){let db;try{db=new DatabaseSync(path.join(this.runtime,'registry.sqlite'),{readOnly:true});const g=JSON.parse(db.prepare("SELECT value FROM state WHERE key='global'").get().value);return !g.worker;}catch{return false;}finally{db?.close();}}
 save(job){job.updated_at=new Date(this.now()).toISOString();this.db.prepare('INSERT INTO jobs VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body').run(job.id,job.day,job.automatic_key??null,JSON.stringify(job));}
 list(day,reportID=null){reportDay(day);if(reportID!==null&&(typeof reportID!=='string'||!/^[-a-f0-9]{36}$/.test(reportID)))throw Error('請選擇有效的報告版本。');const jobs=this.db.prepare('SELECT body FROM jobs WHERE day=? ORDER BY rowid DESC LIMIT 12').all(day).map(r=>JSON.parse(r.body)),latest=reportID?this.db.prepare('SELECT body FROM reports WHERE day=? AND id=?').get(day,reportID):this.db.prepare('SELECT body FROM reports WHERE day=? ORDER BY rowid DESC LIMIT 1').get(day);if(reportID&&!latest)throw Error('此日期沒有這份報告版本。');return {day,schedule:{time:'23:00',timezone:'Asia/Taipei',next_at:nextReportAt(this.now()),requires_service_running:true},job:jobs[0]??null,jobs,reports:this.db.prepare('SELECT id,body FROM reports WHERE day=? ORDER BY rowid DESC').all(day).map(r=>({id:r.id,generated_at:JSON.parse(r.body).generated_at})),report:latest?JSON.parse(latest.body):null};}
 enqueue(day,{automatic=false}={}){
  reportDay(day);if(day>taipeiDay(this.now()))throw Error('尚未發生的日期不能整理。');if(this.closed)throw Error('報告服務已停止。');
  const active=this.db.prepare('SELECT body FROM jobs').all().map(r=>JSON.parse(r.body)).find(j=>['queued','running','retry_wait','waiting_for_life'].includes(j.phase));if(active){if(active.day!==day)throw Error('另一份報告正在整理，完成後再選其他日期。');return active;}
  const key=automatic?'daily:'+day:null;if(key){const old=this.db.prepare('SELECT body FROM jobs WHERE automatic_key=?').get(key);if(old)return JSON.parse(old.body);}
  const job={id:id(),day,automatic_key:key,phase:'queued',message:'已排入整理；不會占用個體活動輪數。',created_at:new Date(this.now()).toISOString(),completed_individuals:0,total_individuals:0,calls:0};this.save(job);setImmediate(()=>this.work(job));return job;
 }
 async tick(){if(this.closed)return;const now=this.now(),today=taipeiDay(now),last=this.db.prepare("SELECT value FROM metadata WHERE key='last_check'").get()?.value;const days=[];if(last&&taipeiDay(Number(last))<today)days.push(taipeiDay(now-86400000));if(now>=Date.parse(today+'T23:00:00+08:00'))days.push(today);for(const day of [...new Set(days)]){if(this.busy)return;this.enqueue(day,{automatic:true});}this.db.prepare("INSERT INTO metadata VALUES('last_check',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(String(now));}
 async call(job,prompt){
  for(let attempt=0;attempt<2;attempt++){
   const waitStart=Date.now();while(!this.idle()){if(this.closed)throw Error('報告服務已停止。');if(Date.now()-waitStart>600000)throw Error('個體持續忙碌，為優先生活活動，本次報告沒有繼續；稍後可重新整理。');job.phase='waiting_for_life';job.message='等待生活模型的空檔再整理，不停止任何個體。';this.save(job);await delay(1000);}
   const day=taipeiDay(this.now()),used=this.db.prepare('SELECT count(*) AS n FROM calls WHERE day=?').get(day).n;if(used>=60||job.calls>=24)throw Error('已達獨立報告用量上限，原報告保留；明天或減少單次資料後再整理。');
   const call_id=id();this.db.prepare('INSERT INTO calls VALUES(?,?,?)').run(call_id,day,job.id);job.calls++;job.phase='running';job.message='正在將紀錄整理成短文並核對依據。';this.save(job);
   try{return await this.model(prompt,{dir:this.dir,call_id,signal:this.abort.signal});}catch(e){if(attempt===0&&e.retryable&&!this.closed){job.phase='retry_wait';job.message='報告模型暫時繁忙，30秒後自動再試一次；生活不受停止或恢復操作影響。';this.save(job);await delay(this.retryDelay);}else throw e;}
  }
 }
 async narrative(job,facts,input){const text=validateNarrative(await this.call(job,narrativePrompt(input)),facts,{maxParagraphs:input.kind==='owner_overview'?2:4});if(input.kind==='owner_overview'&&text.paragraphs.reduce((n,p)=>n+p.text.length,0)>450)throw Error('全體摘要超過易讀長度，未發布；請重新整理。');validateGrounding(await this.call(job,groundingPrompt(facts,text)),text);return text;}
 async work(job){if(this.busy||this.closed)return;this.busy=true;try{
   job.phase='running';job.message='正在唯讀擷取所有個體的當日紀錄。';this.save(job);const source=collectReportSource(this.runtime,job.day,{now:this.now(),excluded:effectiveArchived(this.db,this.runtime)});job.total_individuals=source.individuals.length;this.save(job);
   fs.mkdirSync(path.join(this.dir,'snapshots'),{recursive:true});fs.writeFileSync(path.join(this.dir,'snapshots',job.id+'.json'),JSON.stringify(source));const individual_reports=[];
   for(const individual of source.individuals){if(this.closed)throw Error('報告服務已停止。');let text;if(individual.has_activity)text=await this.narrative(job,individual.facts,{kind:'individual',individual_id:individual.individual_id,name:individual.name,day:job.day,cutoff:individual.cutoff,facts:individual.facts});else text={paragraphs:[{text:individual.name+' 在此日截至資料擷取時沒有生活活動紀錄。',citations:[{id:individual.facts[0].id,quote:'"started":0'}]}]};
    individual_reports.push({individual_id:individual.individual_id,name:individual.name,stats:individual.stats,...text,evidence:individual.evidence,source_boundary:individual.source_boundary});job.completed_individuals++;this.save(job);
   }
   const activeReports=individual_reports.filter(x=>source.individuals.find(s=>s.individual_id===x.individual_id).has_activity);
   const summaryInput={kind:'owner_overview',day:job.day,cutoff:source.cutoff,individuals:activeReports.map(({evidence,...x})=>x)};
   // Only the Owner overview combines data. Each individual's model invocation has its own isolated input/session.
   const summaryFacts=source.individuals.filter(x=>x.has_activity).flatMap(x=>[x.facts[0],...x.facts.filter(f=>activeReports.find(r=>r.individual_id===x.individual_id).paragraphs.some(p=>p.citations.some(c=>c.id===f.id)))]);
   let summary;if(!source.individuals.some(x=>x.has_activity))summary={paragraphs:[{text:'所選日期截至擷取時，所有個體均沒有生活活動紀錄。',citations:source.individuals.map(x=>({id:x.facts[0].id,quote:'"started":0'}))}]};else summary=await this.narrative(job,summaryFacts,{...summaryInput,facts:summaryFacts});
   const report={id:id(),job_id:job.id,day:job.day,generated_at:new Date(this.now()).toISOString(),cutoff:source.cutoff,source_hash:source.source_hash,model:'gpt-6.1-sol',grounding:'逐段原文引用檢查及獨立模型核對；不是外部事實認證',summary,individuals:individual_reports,calls:job.calls};
   if(this.closed)throw Error('報告服務已停止，未發布新報告。');this.db.exec('BEGIN IMMEDIATE');try{this.db.prepare('INSERT INTO reports VALUES(?,?,?)').run(report.id,report.day,JSON.stringify(report));job.phase='completed';job.message='報告已完成，各段可查看依據。';job.report_id=report.id;this.save(job);this.db.exec('COMMIT');}catch(e){this.db.exec('ROLLBACK');throw e;}
  }catch(e){job.phase='failed';job.message=e.message;this.save(job);}finally{this.busy=false;if(this.closed)this.db.close();}
 }
 close(){if(this.closed)return;this.closed=true;this.abort.abort();if(!this.busy)this.db.close();}
}
