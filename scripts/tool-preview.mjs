import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {loadEnvironment,claimEnvironment} from './environment.mjs';import {command,readSession} from './development.mjs';
const env=loadEnvironment(),action=process.argv[2]??'start';
try{
 if(action!=='start')await command(action,env);
 else if(fs.existsSync(env.session)){await readSession(env);console.log('本副本已在執行；請執行開啟開發控制台。');}
 else{claimEnvironment(env);const output=fs.openSync(path.join(env.logs,'tool-preview.log'),'a'),child=spawn(process.execPath,[path.join(env.root,'scripts/development.mjs'),'start'],{cwd:env.root,detached:true,windowsHide:true,stdio:['ignore',output,output]});child.unref();fs.closeSync(output);const deadline=Date.now()+60000;let connected=false;while(Date.now()<deadline){if(fs.existsSync(env.session)){try{await readSession(env);connected=true;break;}catch{}}await new Promise(r=>setTimeout(r,500));}if(!connected)throw Error('尚未確認啟動；請查看本副本私人logs/tool-preview.log，不要重複啟動。');console.log('獨立工具試用控制台已就緒，沒有啟動個體。');}
}catch(e){console.error(e.message);process.exitCode=2;}
