import fs from 'node:fs';import path from 'node:path';import {DatabaseSync,backup} from 'node:sqlite';
import {promote} from './migrate.mjs';import {Platform,safeDirectory} from './platform.mjs';import {digest} from './identity.mjs';
const get=(db,k)=>JSON.parse(db.prepare('SELECT value FROM state WHERE key=?').get(k).value);
export async function upgradeV11(source,target,project){
 if(fs.existsSync(target)){if(fs.existsSync(path.join(target,'upgrade-v1_2.json')))return {already_migrated:true};throw Error('MIGRATION_TARGET_EXISTS');}
 const stage=target+'.staging-'+Date.now();fs.mkdirSync(stage,{recursive:true});const r=new DatabaseSync(path.join(source,'registry.sqlite'),{readOnly:true}),snapshot=[];
 try{const g=get(r,'global');if(!g.stopped||g.worker)throw Error('STOP_PLATFORM_FIRST');await backup(r,path.join(stage,'registry.sqlite'));
  for(const {id}of r.prepare('SELECT id FROM entities').all()){
   if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(id))throw Error('SOURCE_ID');const base=safeDirectory(source,path.join(source,'individuals',id)),dest=path.join(stage,'individuals',id);fs.mkdirSync(dest,{recursive:true});
   const db=new DatabaseSync(path.join(base,'kinseed.sqlite'),{readOnly:true});try{if(db.prepare("SELECT value FROM metadata WHERE key='schema'").get()?.value!=='11')throw Error('SOURCE_SCHEMA');if(!get(db,'control').stop_lock||get(db,'lease'))throw Error('STOP_INDIVIDUAL_FIRST');const rows=db.prepare('SELECT body,prev_hash,hash FROM events ORDER BY seq').all();snapshot.push({individual_id:id,a_hash:digest(get(db,'a')),life:get(db,'life'),events:rows.length,chain_hash:digest(rows)});await backup(db,path.join(dest,'kinseed.sqlite'));if(digest(rows)!==digest(db.prepare('SELECT body,prev_hash,hash FROM events ORDER BY seq').all()))throw Error('SOURCE_CHANGED');}finally{db.close();}
   function copyDirs(from,to){for(const item of fs.readdirSync(from,{withFileTypes:true})){const a=path.join(from,item.name),b=path.join(to,item.name);if(item.isSymbolicLink())throw Error('SOURCE_LINK');if(item.isDirectory()){fs.mkdirSync(b,{recursive:true});copyDirs(a,b);}else if(item.isFile()&&!item.name.endsWith('.sqlite')&&!item.name.endsWith('.sqlite-wal')&&!item.name.endsWith('.sqlite-shm'))fs.copyFileSync(a,b);else if(item.isFile()&&from!==base)fs.copyFileSync(a,b);}}
   copyDirs(base,dest);
  }
 }finally{r.close();}
 if(fs.existsSync(path.join(source,'legacy')))fs.cpSync(path.join(source,'legacy'),path.join(stage,'legacy'),{recursive:true});if(fs.existsSync(path.join(source,'migration.json')))fs.copyFileSync(path.join(source,'migration.json'),path.join(stage,'migration-v1_1.json'));
 const sr=new DatabaseSync(path.join(stage,'registry.sqlite'));sr.prepare("UPDATE state SET value='null' WHERE key='manager'").run();sr.close();promote(stage);
 const p=new Platform(stage,{engineering:true});try{
  for(const x of snapshot){const e=p.entity(x.individual_id),rows=e.store.db.prepare('SELECT body,prev_hash,hash FROM events ORDER BY seq LIMIT ?').all(x.events);if(digest(rows)!==x.chain_hash||digest(e.store.get('a'))!==x.a_hash||e.store.get('life').born_at!==x.life.born_at)throw Error('MIGRATION_INTEGRITY');}
  const files=fs.readdirSync(path.join(project,'packages')).filter(f=>/^kinseed-original-56-standard-candidate-v\d+\.json$/.test(f));if(files.length){const q=JSON.parse(fs.readFileSync(path.join(project,'packages',files.at(-1)),'utf8'));p.importPackage(q);if(p.individuals.has('kinseed-formal-001'))p.tx(()=>p.builder.fromPackage(q,'kinseed-formal-001'));}
  const manifest={version:'1.2.0',at:new Date().toISOString(),source:path.resolve(source),source_preserved:true,individuals:snapshot,formal_identity_not_adopted:true,all_stopped:true};p.audit('upgrade.v1_2',manifest);await p.close();fs.writeFileSync(path.join(stage,'upgrade-v1_2.json'),JSON.stringify(manifest,null,2));fs.renameSync(stage,target);return manifest;
 }catch(e){try{await p.close();}catch{}throw e;}
}
