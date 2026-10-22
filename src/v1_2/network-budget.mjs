import {zonedDay} from '../timezone.mjs';
import {DatabaseSync} from 'node:sqlite';
import path from 'node:path';
import {id,hash} from './store.mjs';
export const MB=1000000;
export const DEFAULT_NETWORK={version:1,total:1000*MB,upload:20*MB,reserve:180*MB,single:20*MB,page:30*MB,upload_single:5*MB,allocations:{}};
export const taipeiDay=now=>new Date(now+28800000).toISOString().slice(0,10);
export class NetworkBudget{
 constructor(dir,now=Date.now,timezone='Asia/Taipei'){this.timezone=timezone;this.day=at=>zonedDay(at,this.timezone);this.now=now;this.db=new DatabaseSync(path.join(dir,'network.sqlite'));this.db.exec(`PRAGMA journal_mode=WAL;PRAGMA synchronous=FULL;
 CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY,body TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS traffic(day TEXT,individual TEXT,direction TEXT,bytes INTEGER NOT NULL,PRIMARY KEY(day,individual,direction));
 CREATE TABLE IF NOT EXISTS audit(seq INTEGER PRIMARY KEY,body TEXT NOT NULL,prev TEXT NOT NULL,hash TEXT NOT NULL);
 CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON audit BEGIN SELECT RAISE(ABORT,'APPEND_ONLY');END;
 CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON audit BEGIN SELECT RAISE(ABORT,'APPEND_ONLY');END;
 CREATE TABLE IF NOT EXISTS transfers(id TEXT PRIMARY KEY,individual TEXT NOT NULL,body TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY,individual TEXT NOT NULL,body BLOB NOT NULL,meta TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS receipts(id TEXT PRIMARY KEY,input TEXT,body TEXT);`);
 for(const row of this.db.prepare('SELECT id,body FROM transfers').all()){const r=JSON.parse(row.body);if(r.state==='sending'){r.state='unknown_or_failed';this.db.prepare('UPDATE transfers SET body=? WHERE id=?').run(JSON.stringify(r),row.id);this.event('upload.unknown_or_failed',{individual:r.individual,transfer_id:r.transfer_id,reason:'controller_restart_no_replay'});}}
 if(!this.db.prepare('SELECT id FROM settings').get())this.db.prepare('INSERT INTO settings VALUES(1,?)').run(JSON.stringify(DEFAULT_NETWORK));
 }
 config(){return JSON.parse(this.db.prepare('SELECT body FROM settings WHERE id=1').get().body);}
 tx(fn){this.db.exec('BEGIN IMMEDIATE');try{const out=fn();this.db.exec('COMMIT');return out;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 event(type,data){const body=JSON.stringify({...data,id:id(),at:new Date(this.now()).toISOString(),type}),prev=this.db.prepare('SELECT hash FROM audit ORDER BY seq DESC LIMIT 1').get()?.hash??'';this.db.prepare('INSERT INTO audit(body,prev,hash) VALUES(?,?,?)').run(body,prev,hash(prev+body));}
 snapshot(){const config=this.config(),day=this.day(this.now()),usage=this.db.prepare('SELECT individual,direction,bytes FROM traffic WHERE day=?').all(day);return {config,day,usage,measurement:'下載回應內容實測；上傳按送出內容保守預扣，失敗不退額。不含TLS/IP封包開銷、Codex/LLM及其他應用程式流量',model_traffic:{measured:false,reserved:config.reserve},documents:this.db.prepare('SELECT meta,individual FROM documents ORDER BY rowid DESC LIMIT 50').all().map(r=>({...JSON.parse(r.meta),individual:r.individual})),pending:this.db.prepare('SELECT body FROM transfers').all().map(r=>JSON.parse(r.body)).filter(x=>x.state==='pending'),recent:this.db.prepare('SELECT body FROM audit ORDER BY seq DESC LIMIT 30').all().map(r=>JSON.parse(r.body))};}
 used(individual,direction){return this.db.prepare('SELECT bytes FROM traffic WHERE day=? AND individual=? AND direction=?').get(this.day(this.now()),individual,direction)?.bytes??0;}
 remaining(individual,direction='download'){const c=this.config(),all=this.db.prepare('SELECT coalesce(sum(bytes),0) n FROM traffic WHERE day=? AND direction=?').get(this.day(this.now()),direction).n;return Math.max(0,Math.min(direction==='download'?(c.allocations[individual]??0)-this.used(individual,direction):c.upload-all,c.total-c.reserve-(direction==='download'?c.upload:Object.values(c.allocations).reduce((a,b)=>a+b,0))-all));}
 charge(individual,direction,bytes){if(!Number.isSafeInteger(bytes)||bytes<0)throw Error('NETWORK_BYTES');return this.tx(()=>{const remaining=this.remaining(individual,direction);this.db.prepare('INSERT INTO traffic VALUES(?,?,?,?) ON CONFLICT(day,individual,direction) DO UPDATE SET bytes=bytes+excluded.bytes').run(this.day(this.now()),individual,direction,bytes);return bytes<=remaining;});}
 configure(input,individuals){const {request_id,expected_version,...next}=input,prior=this.db.prepare('SELECT * FROM receipts WHERE id=?').get(request_id);if(prior){if(prior.input!==hash(input))throw Error('IDEMPOTENCY_CONFLICT');return JSON.parse(prior.body);}return this.tx(()=>{const current=this.config();if(expected_version!==current.version)throw Error('NETWORK_VERSION');if(Object.keys(next).some(k=>!['total','upload','reserve','single','page','upload_single','allocations'].includes(k)))throw Error('NETWORK_SETTINGS');for(const key of ['total','upload','reserve','single','page','upload_single'])if(!Number.isSafeInteger(next[key])||next[key]<0||next[key]>100000*MB)throw Error('NETWORK_SETTINGS');if(!request_id||typeof request_id!=='string'||request_id.length>100||!next.allocations||Array.isArray(next.allocations))throw Error('NETWORK_SETTINGS');for(const [key,value]of Object.entries(next.allocations))if(!individuals.includes(key)||!Number.isSafeInteger(value)||value<0)throw Error('NETWORK_SETTINGS');if(Object.values(next.allocations).reduce((a,b)=>a+b,0)+next.upload+next.reserve>next.total||next.upload_single>next.upload||next.single>next.page||next.page===0)throw Error('NETWORK_OVERALLOCATED');const result={...next,version:current.version+1};this.db.prepare('UPDATE settings SET body=? WHERE id=1').run(JSON.stringify(result));this.event('settings.saved',{settings:result});this.db.prepare('INSERT INTO receipts VALUES(?,?,?)').run(request_id,hash(input),JSON.stringify(result));return result;});}
 close(){this.db.close();}
}
