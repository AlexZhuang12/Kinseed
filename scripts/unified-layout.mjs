import fs from 'node:fs';import path from 'node:path';import {DatabaseSync} from 'node:sqlite';
const reserved=new Set([47429,47430,47431,62372]);
export function unifiedLayout(root,{requireStaging=false}={}){
 const marker=path.join(root,'.kinseed-staging.json'),runtime=path.join(root,'runtime_v1_2'),reportsDir=path.join(root,'runtime_reports');
 if(!fs.existsSync(marker)){if(requireStaging)throw Error('STAGING_MARKER_REQUIRED');return {staging:false,runtime,reportsDir:path.join(root,'runtime_reports'),port:62372,guardPort:47430};}
 for(const p of [root,marker,runtime])if(fs.lstatSync(p).isSymbolicLink())throw Error('STAGING_LINK_REFUSED');
 const noLinks=dir=>{if(!fs.existsSync(dir))return;if(fs.lstatSync(dir).isSymbolicLink())throw Error('STAGING_LINK_REFUSED');if(fs.statSync(dir).isDirectory())for(const name of fs.readdirSync(dir))noLinks(path.join(dir,name));};noLinks(runtime);noLinks(reportsDir);
 const m=JSON.parse(fs.readFileSync(marker)),dataFile=path.join(runtime,'.kinseed-staging-data.json');
 if(fs.lstatSync(dataFile).isSymbolicLink())throw Error('STAGING_LINK_REFUSED');
 const data=JSON.parse(fs.readFileSync(dataFile));
 if(m.kind!=='kinseed-unified-staging'||m.schema!==1||m.test_only!==true||m.model_calls!==false||typeof m.instance_id!=='string'||!m.instance_id||data.instance_id!==m.instance_id||data.test_only!==true||!Number.isInteger(m.guard_port)||m.guard_port<1024||m.guard_port>65535||reserved.has(m.guard_port))throw Error('STAGING_BINDING_INVALID');
 const dbFile=path.join(runtime,'registry.sqlite');if(fs.existsSync(dbFile)){if(fs.lstatSync(dbFile).isSymbolicLink())throw Error('STAGING_LINK_REFUSED');const db=new DatabaseSync(dbFile,{readOnly:true});try{for(const row of db.prepare('SELECT body FROM entities').all()){const e=JSON.parse(row.body);if(e.profile?.test_only!==true||!e.individual_id.startsWith('synthetic-'))throw Error('STAGING_SYNTHETIC_DATA_ONLY');}}finally{db.close();}}
 return {staging:true,instance:m.instance_id,runtime,reportsDir,port:0,guardPort:m.guard_port};
}
export function validateUnifiedSession(s,layout){
 const u=new URL(s.endpoint);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||u.username||u.password||u.pathname!=='/'||u.search||u.hash||!u.port||!Number.isInteger(s.pid)||typeof s.token!=='string'||s.token.length<20)throw Error('CONTROLLER_SESSION_INVALID');
 if(layout.staging){if(reserved.has(Number(u.port))||s.staging_instance!==layout.instance)throw Error('STAGING_SESSION_MISMATCH');}else if(s.endpoint!=='http://127.0.0.1:62372')throw Error('CONTROLLER_SESSION_INVALID');
 return s;
}
