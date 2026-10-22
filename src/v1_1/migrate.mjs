import fs from 'node:fs';
import path from 'node:path';
import {DatabaseSync,backup} from 'node:sqlite';
import {Platform} from './platform.mjs';
import {hash,id,Store} from './store.mjs';
import {original56} from './packages.mjs';
export async function migrateV1(source,target,project){
 if(fs.existsSync(path.join(target,'registry.sqlite')))return {already_migrated:true};if(fs.existsSync(target))throw Error('MIGRATION_TARGET_EXISTS');
 const stage=target+'.staging-'+id();fs.mkdirSync(stage,{recursive:true});
 const sourceDB=new DatabaseSync(path.join(source,'kinseed.sqlite'),{readOnly:true});let prev='',counts={},profile,a,control,lived=false,todayCycles=0;const today=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
 try{if(sourceDB.prepare("SELECT value FROM metadata WHERE key='schema'").get()?.value!=='1')throw Error('SOURCE_SCHEMA');for(const r of sourceDB.prepare('SELECT * FROM events ORDER BY seq').iterate()){if(r.prev_hash!==prev||hash(prev+r.body)!==r.hash)throw Error('SOURCE_INTEGRITY');prev=r.hash;const e=JSON.parse(r.body);counts[e.individual_id]=(counts[e.individual_id]??0)+1;if(['cycle.intent','cycle.committed','codex.session','activity.accounted'].includes(e.type))lived=true;if(e.type==='cycle.intent'&&new Date(Date.parse(e.utc)+8*3600000).toISOString().slice(0,10)===today)todayCycles++;}const get=k=>JSON.parse(sourceDB.prepare('SELECT value FROM state WHERE key=?').get(k).value);profile=get('profile');a=get('a');control=get('control');if(get('lease')||control.mode==='running')throw Error('STOP_V1_FIRST');
  // A raw immutable source snapshot preserves all prior identities and original body bytes.
  fs.mkdirSync(path.join(stage,'legacy'),{recursive:true});await backup(sourceDB,path.join(stage,'legacy','v1.sqlite'));
 }finally{sourceDB.close();}
 // This migration deliberately refuses ambiguous attribution rather than copying mixed B to every entity.
 if(Object.keys(counts).some(k=>k!==profile.individual_id))throw Error('MIGRATION_ATTRIBUTION_REQUIRES_REVIEW');
 let platform=new Platform(stage,{engineering:true});platform.create({individual_id:profile.individual_id,name:'V1 既有測試個體 001',test_only:true});await platform.close();
 const entityDir=path.join(stage,'individuals',profile.individual_id),entityFile=path.join(entityDir,'kinseed.sqlite');fs.copyFileSync(path.join(stage,'legacy','v1.sqlite'),entityFile);
 const d=new DatabaseSync(entityFile);d.prepare("UPDATE metadata SET value='11' WHERE key='schema'").run();d.close();
 const store=new Store(entityDir,profile);store.tx(()=>{
  store.set('life',{state:lived?'legacy_lived':'unborn',born_at:null,birth_snapshot:null,identity_version:lived?profile.profile_version:0,generation:id(),recovery_generation:id(),legacy_provenance:{source_sha256:hash(fs.readFileSync(path.join(stage,'legacy','v1.sqlite'))),chain_tip:prev,born_at:'unknown'}});
  store.set('identities',lived?[{version:profile.profile_version,package_hash:hash(profile),legacy_profile:profile,approved_at:null,source:'V1 既有身份，非新增出生授權'}]:[]);
  control.mode='stopped';control.stop_lock=true;control.next_wake=null;control.authorization_until=0;control.initial_start=false;control.version++;store.set('control',control);store.event('upgrade.v1_1',{legacy_tip:prev,a_preserved_hash:hash(a),life:store.get('life'),control},'migration');
 });store.close();
 for(const name of ['workspace','artifacts','backups','codex-evidence','life'])if(fs.existsSync(path.join(source,name)))fs.cpSync(path.join(source,name),path.join(entityDir,'legacy-'+name),{recursive:true});
 platform=new Platform(stage,{engineering:true});platform.create({individual_id:'kinseed-test-002',name:'測試個體 002（V1 配置，無生活證據）',test_only:true});
 const existing002=path.join(project,'profiles/kinseed-test-v2.json');if(fs.existsSync(existing002)){const configured=JSON.parse(fs.readFileSync(existing002,'utf8')),entity=platform.entity('kinseed-test-002');if(configured.individual_id!=='kinseed-test-002')throw Error('CONFIG_ATTRIBUTION');entity.store.tx(()=>{entity.store.set('profile',configured);entity.store.event('legacy.configuration_preserved',{profile:configured,lived_evidence:false},'migration',{classification:'prebirth_admin'});});}
 platform.create({individual_id:'kinseed-formal-001',name:'正式個體 001｜尚未出生',test_only:false});const p=platform.importPackage(original56(path.join(project,'docs/INITIAL_CONDITIONS_56_v0.1.md'))),preview=platform.preview({individual_id:'kinseed-formal-001',package_id:p.package_id,package_version:p.version});
 // Import and preview only. Formal identity adoption remains an Owner choice in the product.
 const manifest={version:'1.1.0',created_at:new Date().toISOString(),legacy_tip:prev,event_counts:counts,legacy_sha256:hash(fs.readFileSync(path.join(stage,'legacy/v1.sqlite'))),a_hash:hash(a),formal:{state:platform.entity('kinseed-formal-001').store.get('life').state,preview_hash:preview.package_hash,adopted:false},source_unchanged:true};
 const g=platform.global();g.day=today;g.used=todayCycles;g.legacy_accounting={day:today,cycles:todayCycles,source_tip:prev};platform.set('global',g);manifest.carried_daily_cycles=todayCycles;platform.audit('upgrade.complete',manifest);await platform.close();fs.writeFileSync(path.join(stage,'migration.json'),JSON.stringify(manifest,null,2));fs.renameSync(stage,target);return manifest;
}
