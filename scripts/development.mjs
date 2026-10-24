import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {loadEnvironment,claimEnvironment,noLinks} from './environment.mjs';
import {serve} from '../src/v1_2/server.mjs';
import {lifePrompt} from '../src/v1_2/server.mjs';
import {lifeRunner,textInference} from '../src/brain/runtime.mjs';
import {descriptor,DEFAULT_BRAIN} from '../src/brain/contract.mjs';
import {brainPreflight} from '../src/brain/preflight.mjs';
import {createHash} from 'node:crypto';
export async function startDevelopment(env=loadEnvironment(),{requireWindows=true}={}){
 if(requireWindows&&process.platform!=='win32')throw Error('本階段只支援Windows。');if(Number(process.versions.node.split('.')[0])!==24)throw Error('請使用Node.js 24。');
 claimEnvironment(env);
 const config=env.brain??{...DEFAULT_BRAIN},preflight=await brainPreflight(config);
 let app;app=await serve({dir:env.runtime,port:env.config.http.port,engineering:true,preflight,timezone:env.config.timezone??'Asia/Taipei',runnerFactory:e=>app.platform.dailyPreflightReady?lifeRunner({endpoint:app.endpoint,base:e.store.dir,cwd:path.join(e.store.dir,'life'),evidenceDir:path.join(e.store.dir,'brain-evidence'),prompt:lifePrompt,config}):async()=>{throw Error('DEVELOPMENT_INFERENCE_DISABLED');}});
 app.platform.refreshPreflight=async()=>{const latest=await brainPreflight(config);app.platform.dailyPreflightReady=latest.ok;return latest;};app.platform.toolBrainEndpoint=config.endpoint??config.baseUrl??null;app.platform.brainBinding=descriptor(config);app.platform.consultBrainBinding=descriptor(config);app.platform.delegationEnabled=env.config.tools?.codex.enabled??true;
 app.platform.consultModel=(prompt,options)=>{if(!app.platform.dailyPreflightReady)throw Error('DEVELOPMENT_INFERENCE_DISABLED');return textInference(prompt,{...options,purpose:'consult',config});};
 const instance_id=createHash('sha256').update(env.home).digest('hex').slice(0,20),readStatus=app.platform.status.bind(app.platform);
 app.platform.status=()=>({...readStatus(),development:{instance_id,environment:'development',phase:3,timezone:app.platform.timezone},brain:{...descriptor(config),ready:app.platform.dailyPreflightReady}});
 noLinks(env.root,env.session);
 fs.writeFileSync(env.session,JSON.stringify({schema:1,kind:'kinseed-development-session',environment:'development',instance_id,runtime:env.runtime,endpoint:app.endpoint,token:app.ownerToken,pid:process.pid},null,2),{mode:0o600});
 const cleanup=()=>{if(fs.existsSync(env.session)){const s=JSON.parse(fs.readFileSync(env.session));if(s.pid===process.pid)fs.unlinkSync(env.session);}};
 app.server.once('close',cleanup);
 const close=app.close;app.close=async()=>{await close();cleanup();};
 return app;
}
export async function readSession(env){
 noLinks(env.root,env.session);const s=JSON.parse(fs.readFileSync(env.session));if(s.kind!=='kinseed-development-session'||s.environment!=='development'||s.runtime!==env.runtime)throw Error('開發連線標記不符；不連接服務。');
 const u=new URL(s.endpoint);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||u.pathname!=='/'||u.search||u.hash||u.username||u.password||!u.port||[47429,47430,47431,62372].includes(Number(u.port))||typeof s.token!=='string'||s.token.length<20)throw Error('不是有效的獨立開發服務位址。');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3000);
 try{const r=await fetch(s.endpoint+'/owner/status',{headers:{Authorization:'Bearer '+s.token},signal:controller.signal});const status=await r.json();if(!r.ok||status.engineering!==true||!s.instance_id||status.development?.instance_id!==s.instance_id||status.development?.environment!=='development')throw Error('對端不是本階段開發服務；不操作。');return {s,status};}finally{clearTimeout(timer);}
}
export async function command(action,env=loadEnvironment()){
 if(['enable-codex','disable-brain'].includes(action)){if(fs.existsSync(env.session))throw Error('請先停止這個開發控制台再更換大腦設定；不在工作中途切換。');const settings=action==='disable-brain'?{...(env.brain??DEFAULT_BRAIN),enabled:false}:{...DEFAULT_BRAIN,enabled:true};noLinks(env.root,path.join(env.root,'config/development.local.json'));fs.writeFileSync(path.join(env.root,'config/development.local.json'),JSON.stringify({...env.config,version:settings.adapter==='ollama-local'?3:2,inference:settings},null,2));console.log('已保存開發版大腦設定；下次啟動才生效，不會啟動或恢復任何個體。');return;}
 if(action==='check'){console.log(JSON.stringify({environment:'development',node:process.version,windows:process.platform==='win32',configuration:'PASS',private_data:env.config.dataDirectory,brain:descriptor(env.brain??DEFAULT_BRAIN),preflight:await brainPreflight(env.brain??DEFAULT_BRAIN),reports_enabled:false,formal_runtime_connected:false},null,2));return;}
 if(action==='start'){const app=await startDevelopment(env);console.log('獨立開發控制台已啟動：'+app.endpoint+'；大腦'+(env.brain?.enabled?'依設定預檢，仍須Owner另行授權生活':'未啟用')+'，報告排程停用。請執行「開啟開發控制台.cmd」。');let closing=false;const end=async()=>{if(closing)return;closing=true;await app.close();process.exit(0);};process.on('SIGTERM',end);process.on('SIGINT',end);app.server.once('close',()=>process.exit(0));return;}
 if(!['open','stop','status'].includes(action))throw Error('請使用 start、stop、open、status 或 check。');
 const {s,status}=await readSession(env);
 if(action==='status'){console.log(JSON.stringify({endpoint:s.endpoint,pid:s.pid,environment:'development',individuals:status.individuals.length,stopped:status.global.stopped,brain:status.brain}));return;}
 if(action==='stop'){const r=await fetch(s.endpoint+'/owner/shutdown',{method:'POST',headers:{Authorization:'Bearer '+s.token,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('開發服務尚未確認關閉，請查看本視窗。');console.log('已向獨立開發控制台送出關閉要求；未操作正式服務。');return;}
 const url=s.endpoint+'/#'+s.token;const p=spawn('powershell.exe',['-NoProfile','-Command',"Start-Process '"+url+"'"],{windowsHide:true,stdio:'ignore'});await new Promise((resolve,reject)=>{p.once('error',reject);p.once('close',code=>code===0?resolve():reject(Error('無法開啟瀏覽器。')));});
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename))command(process.argv[2]??'start').catch(e=>{console.error('開發環境未啟動或操作失敗：'+e.message);process.exitCode=1;});
