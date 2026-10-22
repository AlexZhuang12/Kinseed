import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {hash,id,validateProfile} from './store.mjs';
import {validatePackage} from './packages.mjs';
export function restoreIndividual(store,file){
 const c=store.get('control');if(!c.stop_lock||store.get('lease'))throw Error('STOP_FIRST');
 const manifest=JSON.parse(fs.readFileSync(file+'.sha256.json','utf8'));if(manifest.schema_version!==11||manifest.sha256!==hash(fs.readFileSync(file)))throw Error('BACKUP_CHECKSUM');
 const db=new DatabaseSync(file,{readOnly:true});try{if(db.prepare("SELECT value FROM metadata WHERE key='schema'").get()?.value!=='11')throw Error('DATABASE_SCHEMA');
  const get=k=>JSON.parse(db.prepare('SELECT value FROM state WHERE key=?').get(k).value),profile=validateProfile(get('profile'));if(profile.individual_id!==store.get('profile').individual_id)throw Error('RESTORE_IDENTITY_MISMATCH');
  let prev='',projection=null;for(const row of db.prepare('SELECT * FROM events ORDER BY seq').iterate()){if(row.prev_hash!==prev||hash(prev+row.body)!==row.hash)throw Error('BACKUP_INTEGRITY');const e=JSON.parse(row.body);if(e.individual_id!==profile.individual_id)throw Error('BACKUP_SCOPE');if(e.result?.a)projection=e.result.a;prev=row.hash;}
  const a=get('a');if(!a||!Number.isInteger(a.version)||!Array.isArray(a.memory)||a.memory.length>20||a.memory.some(s=>typeof s!=='string'||s.length>1000)||!Array.isArray(a.plan)||a.plan.length>10||a.plan.some(s=>typeof s!=='string'||s.length>500)||!Number.isFinite(a.active_ms)||a.active_ms<0)throw Error('BACKUP_STATE_SCHEMA');if(!projection||hash(projection)!==hash(a))throw Error('BACKUP_PROJECTION_INTEGRITY');
  const identities=get('identities'),life=get('life');if(!Array.isArray(identities)||!['unborn','born','legacy_lived'].includes(life.state))throw Error('BACKUP_IDENTITY_SCHEMA');for(const v of identities)if(v.package){validatePackage(v.package);if(hash(v.package)!==v.package_hash)throw Error('BACKUP_SOURCE_HASH');}else if(!v.legacy_profile)throw Error('BACKUP_IDENTITY_SCHEMA');
  // Restore growing A only. Approved identities and irreversible birth are never rolled back.
  return store.tx(()=>{const before=store.get('a'),life=store.get('life');a.version=before.version+1;life.recovery_generation=id();c.version++;c.mode='stopped';c.stop_lock=true;c.authorization_until=0;c.next_wake=null;store.event('restore.preimage',{a:before,life},'owner');store.set('a',a);store.set('life',life);store.set('control',c);store.event('restore.applied',{a,life,control:c,snapshot_tip:prev,identity_preserved:true,birth_preserved:true},'owner');return {version:a.version,recovery_generation:life.recovery_generation,born_at:life.born_at};});
 }finally{db.close();}
}
export function rebuildA(store){
 let a=null,cursor=0;while(true){const events=store.events(cursor,100);if(!events.length)break;for(const e of events)if(e.result?.a)a=structuredClone(e.result.a);cursor=events.at(-1).seq;}if(!a)throw Error('REBUILD_SOURCE_MISSING');return a;
}
