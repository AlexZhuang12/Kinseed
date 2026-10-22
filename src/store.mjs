import { DatabaseSync, backup } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
export const id = () => randomUUID();
export const utc = () => new Date().toISOString();
export const hash = x => createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
export function validateProfile(p) {
  const keys=['schema_version','individual_id','profile_id','profile_version','test_only','created_at','source','goal','preferences'];
  if(!p || p.schema_version!==1 || p.test_only!==true || keys.some(k=>!(k in p)) || Object.keys(p).some(k=>!keys.includes(k)) || !Number.isInteger(p.profile_version) || p.profile_version<1 || !Array.isArray(p.preferences) || p.preferences.length>3) throw Error('PROFILE_SCHEMA');
  for(const k of ['individual_id','profile_id','created_at','source','goal']) if(typeof p[k]!=='string'||!p[k].length||p[k].length>1000) throw Error('PROFILE_SCHEMA');
  if(!/^[a-z0-9-]{1,80}$/.test(p.individual_id)||!Number.isFinite(Date.parse(p.created_at))||p.preferences.some(v=>typeof v!=='string'||v.length>200)) throw Error('PROFILE_SCHEMA');
  return p;
}
export function migrateProfile(source,targetVersion=1){if(targetVersion!==1||source.schema_version!==1)throw Error('PROFILE_MIGRATION_UNSUPPORTED');return structuredClone(validateProfile(source));}
export class Store {
  constructor(dir, profile, {now=()=>Date.now()}={}) {
    this.dir=dir; this.now=now; fs.mkdirSync(dir,{recursive:true});
    this.file=path.join(dir,'kinseed.sqlite');this.db=new DatabaseSync(this.file);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON; PRAGMA max_page_count=16384;
      CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS events(seq INTEGER PRIMARY KEY AUTOINCREMENT,event_id TEXT UNIQUE NOT NULL,body TEXT NOT NULL,prev_hash TEXT NOT NULL,hash TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS state(key TEXT PRIMARY KEY,value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS receipts(key TEXT PRIMARY KEY,value TEXT NOT NULL);
      CREATE TRIGGER IF NOT EXISTS no_event_update BEFORE UPDATE ON events BEGIN SELECT RAISE(ABORT,'APPEND_ONLY'); END;
      CREATE TRIGGER IF NOT EXISTS no_event_delete BEFORE DELETE ON events BEGIN SELECT RAISE(ABORT,'APPEND_ONLY'); END;`);
    const version=this.db.prepare('SELECT value FROM metadata WHERE key=?').get('schema');
    if(version&&version.value!=='1') {this.db.close();throw Error('DATABASE_SCHEMA');}
    if(!version) this.tx(()=>{this.db.prepare('INSERT INTO metadata VALUES(?,?)').run('schema','1');validateProfile(profile);
      this.set('profile',profile); this.set('a',{version:0,memory:[],plan:[],status:'尚未開始',last_result:null,active_ms:0});
      this.set('control',{version:1,mode:'stopped',stop_lock:true,initial_start:true,permissions:{note:true},window_start:'09:00',window_minutes:240,authorization_until:0,max_cycles:12,cycles_day:'',cycles_used:0,next_wake:null,reason:'首次啟動等待 Owner 明確開始'});
      this.set('lease',null);this.event('system.created',{test_only:true,profile,a:this.get('a'),control:this.get('control')},'controller');});
    this.verify();
  }
  tx(fn) {this.db.exec('BEGIN IMMEDIATE');try{const x=fn();this.db.exec('COMMIT');return x;}catch(e){this.db.exec('ROLLBACK');throw e;}}
  get(key){const r=this.db.prepare('SELECT value FROM state WHERE key=?').get(key);if(!r)throw Error('STATE_MISSING');return JSON.parse(r.value);}
  set(key,value){this.db.prepare('INSERT INTO state VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key,JSON.stringify(value));}
  receipt(key){const r=this.db.prepare('SELECT value FROM receipts WHERE key=?').get(key);return r?JSON.parse(r.value):null;}
  putReceipt(key,value){this.db.prepare('INSERT INTO receipts VALUES(?,?)').run(key,JSON.stringify(value));}
  event(type,result,source='controller',ctx={}){
    const p=this.get('profile'),c=this.get('control'),a=this.get('a');
    const e={event_id:id(),utc:new Date(this.now()).toISOString(),display_timezone:'Asia/Taipei',individual_id:p.individual_id,run_id:ctx.run_id??null,cycle_id:ctx.cycle_id??null,session_id:ctx.session_id??null,request_id:ctx.request_id??null,type,source,result,control_version:c.version,profile_version:p.profile_version,state_version:a.version,success:ctx.success??true,error_class:ctx.error_class??null,classification:ctx.classification??'observed',cost:'unknown'};
    const body=JSON.stringify(e),prev=this.db.prepare('SELECT hash FROM events ORDER BY seq DESC LIMIT 1').get()?.hash??'';
    this.db.prepare('INSERT INTO events(event_id,body,prev_hash,hash) VALUES(?,?,?,?)').run(e.event_id,body,prev,hash(prev+body));return e;
  }
  events(offset=0,limit=50){return this.db.prepare('SELECT seq,body FROM events WHERE seq>? ORDER BY seq LIMIT ?').all(offset,Math.min(100,limit)).map(r=>({seq:r.seq,...JSON.parse(r.body)}));}
  verify(){let prev='';for(const r of this.db.prepare('SELECT * FROM events ORDER BY seq').iterate()){if(r.prev_hash!==prev||hash(prev+r.body)!==r.hash)throw Error('HISTORY_INTEGRITY');prev=r.hash;}for(const k of ['profile','a','control','lease'])this.get(k);validateProfile(this.get('profile'));return true;}
  async backup(destination){this.verify();await backup(this.db,destination);const result={file:destination,sha256:hash(fs.readFileSync(destination)),created_at:utc(),schema_version:1};fs.writeFileSync(destination+'.sha256.json',JSON.stringify(result,null,2));return result;}
  close(){this.db.close();}
}
