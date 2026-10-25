// Cold snapshots only. There is deliberately no database overwrite/restore command.
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {APP_ROOT,beneath,noLinks} from './environment.mjs';
import {stopped} from './setup-core.mjs';
import {exportSource} from './export-source.mjs';
import {sha256} from './release-check.mjs';
import {inspectNetworkSnapshot} from './network-snapshot.mjs';
import {inspectHedraSnapshot} from './hedra-snapshot.mjs';
function fileMap(root){const out={};if(!fs.existsSync(root))return out;function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);noLinks(root,file);if(e.isDirectory())walk(file);else out[path.relative(root,file).replaceAll('\\','/')]=sha256(fs.readFileSync(file));}}walk(root);return out;}
function inspectDatabases(home){
 const out={};
 for(const rel of Object.keys(fileMap(home)).filter(x=>x.endsWith('.sqlite'))){
  const db=new DatabaseSync(path.toNamespacedPath(path.resolve(home,rel)),{readOnly:true});
  try{
   if(db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('資料庫完整性未通過：'+rel);
   const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x=>x.name);
   if(rel.replaceAll('\\','/')==='runtime/hedra.sqlite'){out[rel]=inspectHedraSnapshot(db,tables);continue;}
   if(rel.replaceAll('\\','/')==='runtime/network.sqlite'){out[rel]=inspectNetworkSnapshot(db,tables);continue;}
   const s=tables.includes('state')?Object.fromEntries(db.prepare('SELECT key,value FROM state').all().map(x=>[x.key,JSON.parse(x.value)])):{};
   if(s.lease||s.global?.worker||['running','paused'].includes(s.control?.mode)||['running','paused'].includes(s.control?.state)||['running','paused'].includes(s.control?.status))throw Error('仍有生活或未收尾工作，請先在控制台確認停止：'+rel);
   if(tables.includes('events')){
    let prev='',projection=null;
    for(const e of db.prepare('SELECT body,prev_hash,hash FROM events ORDER BY seq').iterate()){
     if(e.prev_hash!==prev||e.hash!==sha256(prev+e.body))throw Error('歷史鏈未通過：'+rel);
     const event=JSON.parse(e.body);if(s.profile&&event.individual_id!==s.profile.individual_id)throw Error('歷史對象不符：'+rel);
     if(event.result?.a)projection=event.result.a;prev=e.hash;
    }
    if(projection&&sha256(JSON.stringify(projection))!==sha256(JSON.stringify(s.a)))throw Error('記憶與歷史投影不一致：'+rel);
   }
   const schema=tables.includes('metadata')?db.prepare("SELECT value FROM metadata WHERE key='schema'").get()?.value:null;
   if(schema!=='12')throw Error('資料格式尚未驗證，不接管或遷移：'+rel);
   out[rel]={integrity:'ok',schema};
  }finally{db.close();}
 }
 return out;
}
export function createSnapshot(root=APP_ROOT){
 const env=stopped(root);if(!fs.existsSync(path.join(env.home,'instance.json')))throw Error('尚無本副本資料；請先完成設定，不能接管其他資料。');
 noLinks(root,env.home);const databases=inspectDatabases(env.home),before=fileMap(env.home),revision=fs.existsSync(path.join(root,'config/development.local.json'))?fs.readFileSync(path.join(root,'config/development.local.json')):null;
 const target=path.join(root,'.private/maintenance/'+randomUUID());noLinks(root,target);fs.mkdirSync(target,{recursive:true});
 try{const source=exportSource(root,path.join(target,'source'));for(const rel of Object.keys(before)){const dest=path.join(target,'data',rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(env.home,rel),dest,fs.constants.COPYFILE_EXCL);}if(revision)fs.writeFileSync(path.join(target,'development.local.json'),revision,{flag:'wx'});
  stopped(root);if(JSON.stringify(before)!==JSON.stringify(fileMap(env.home))||(revision?sha256(revision):null)!==(fs.existsSync(path.join(root,'config/development.local.json'))?sha256(fs.readFileSync(path.join(root,'config/development.local.json'))):null))throw Error('備份期間資料或設定變更；本份未完成，請先停止所有寫入後重試。');
  const manifest={schema:1,at:new Date().toISOString(),dataDirectory:env.config.dataDirectory,databases,files:fileMap(target),source_count:source.count,warning:'私人離線備份，不可公開；不是還原或恢復生活授權。'};fs.writeFileSync(path.join(target,'manifest.json'),JSON.stringify(manifest,null,2),{flag:'wx'});return {path:target,...verifySnapshot(root,target)};
 }catch(e){fs.writeFileSync(path.join(target,'INCOMPLETE.txt'),'此備份未完成，不可用於回退。\n'+e.message,{flag:'wx'});throw e;}
}
export function verifySnapshot(root,target){
 target=path.resolve(target);const base=path.join(root,'.private/maintenance');if(!beneath(base,target))throw Error('只能檢查本副本自己的維護備份。');noLinks(root,target);noLinks(root,path.join(target,'manifest.json'));if(fs.existsSync(path.join(target,'INCOMPLETE.txt')))throw Error('此備份未完成。');const m=JSON.parse(fs.readFileSync(path.join(target,'manifest.json')));if(m.schema!==1||!m.files||typeof m.files!=='object')throw Error('備份格式不相容。');for(const rel of Object.keys(m.files)){if(!beneath(target,path.resolve(target,rel))||path.isAbsolute(rel)||rel.split(/[\\/]/).includes('..'))throw Error('備份含越界路徑。');}
 const actual=fileMap(target);delete actual['manifest.json'];if(JSON.stringify(Object.keys(actual).sort())!==JSON.stringify(Object.keys(m.files).sort())||Object.entries(m.files).some(([f,h])=>actual[f]!==h))throw Error('備份檔案已變更或不完整。');
 const databases=inspectDatabases(path.join(target,'data'));return {status:'PASS',files:Object.keys(actual).length,databases,scope:'Local hashes and SQLite integrity/history checks; manifest is not a signed authenticity proof.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===import.meta.filename){try{const cmd=process.argv[2];if(cmd==='snapshot')console.log(JSON.stringify(createSnapshot(),null,2));else if(cmd==='verify'&&process.argv[3])console.log(JSON.stringify(verifySnapshot(APP_ROOT,process.argv[3]),null,2));else throw Error('使用 node scripts/maintenance.mjs snapshot 或 verify "備份完整路徑"。不提供資料庫覆寫還原。');}catch(e){console.error(e.message);process.exitCode=2;}}
