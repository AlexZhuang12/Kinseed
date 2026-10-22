import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {id,hash,validateProfile} from './store.mjs';
export function restoreSnapshot(store,file){
 const c=store.get('control');if(!c.stop_lock||store.get('lease'))throw Error('STOP_FIRST');
 if(fs.existsSync(file+'.sha256.json')){const manifest=JSON.parse(fs.readFileSync(file+'.sha256.json','utf8'));if(manifest.schema_version!==1||manifest.sha256!==hash(fs.readFileSync(file)))throw Error('BACKUP_CHECKSUM');}
 const snapshot=new DatabaseSync(file,{readOnly:true});
 try{
  if(snapshot.prepare('SELECT value FROM metadata WHERE key=?').get('schema')?.value!=='1')throw Error('DATABASE_SCHEMA');
  let previous='';for(const r of snapshot.prepare('SELECT * FROM events ORDER BY seq').iterate()){if(r.prev_hash!==previous||hash(previous+r.body)!==r.hash)throw Error('BACKUP_INTEGRITY');previous=r.hash;}
  const get=k=>JSON.parse(snapshot.prepare('SELECT value FROM state WHERE key=?').get(k).value);
  const p=validateProfile(get('profile'));if(p.individual_id!==store.get('profile').individual_id)throw Error('RESTORE_IDENTITY_MISMATCH');
  const a=get('a');if(!Number.isInteger(a.version)||!Array.isArray(a.memory)||!Array.isArray(a.plan))throw Error('BACKUP_STATE_SCHEMA');
  return store.tx(()=>{const current=store.get('a');a.version=current.version+1;a.recovery_generation=id();store.event('restore.preimage',{a:current},'owner-local');store.set('a',a);store.event('restore.applied',{a,backup_tip:previous,control_unchanged:true},'owner-local');return {version:a.version,generation:a.recovery_generation};});
 }finally{snapshot.close();}
}
