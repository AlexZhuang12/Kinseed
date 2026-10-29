// Explicit lab entry. It cannot start a real Codex model or take over another installation.
import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';
import {APP_ROOT,loadEnvironment,claimEnvironment} from './environment.mjs';import {startDevelopment} from './development.mjs';
import {factory,workflow} from '../tests/app-server-integration-fixture.mjs';
const scope=JSON.parse(fs.readFileSync(path.join(APP_ROOT,'.private/candidate-scope.json')));if(scope.id!=='app-server-integration-20261028.1'||scope.formal_actions!==false)throw Error('ISOLATED_CANDIDATE_REQUIRED');
const action=process.argv[2];if(process.argv.some(a=>a.startsWith('--workspace=')))throw Error('CANDIDATE_EXTERNAL_WORKSPACE_DENIED');
async function run(){const env=loadEnvironment();
 if(action==='serve'){
  if(process.argv[3]!=='--synthetic'||process.argv.length!==4)throw Error('EXPLICIT_SYNTHETIC_MODE_REQUIRED');
  const app=await startDevelopment(env,{engineering:true,preflight:async()=>({ok:true,synthetic:true,inference_access:'synthetic_only'}),appServerOptions:{synthetic:true,factory:owner=>factory(owner.startsWith('text-')?[{text:'{"answer":"SYNTHETIC_ONLY"}'}]:Array.from({length:8},(_,n)=>workflow(n)))(owner),rpcTimeout:1500},brainOptions:{resolveBinary:()=>process.execPath,spawnProcess:(_binary,_args,options)=>spawn(process.execPath,[path.join(APP_ROOT,'tests/app-server-integrated-exec-peer.mjs')],options)}});
  app.server.once('close',()=>process.exit(0));let closing=false;const close=async()=>{if(closing)return;closing=true;try{await app.close();}catch(e){closing=false;console.error(e.message);}};process.on('SIGTERM',close);process.on('SIGINT',close);console.log('SYNTHETIC CANDIDATE READY; no real model/provider connection');return;
 }
 if(action==='start'){
  if(process.argv[3]!=='--synthetic'||process.argv.length!==4)throw Error('EXPLICIT_SYNTHETIC_MODE_REQUIRED');if(fs.existsSync(env.session))throw Error('CANDIDATE_SESSION_ALREADY_PRESENT');claimEnvironment(env);
  const out=fs.openSync(path.join(env.logs,'candidate-out.log'),'a'),err=fs.openSync(path.join(env.logs,'candidate-error.log'),'a');let child;try{child=spawn(process.execPath,[import.meta.filename,'serve','--synthetic'],{cwd:APP_ROOT,windowsHide:true,detached:true,stdio:['ignore',out,err]});child.unref();}finally{fs.closeSync(out);fs.closeSync(err);}
  for(let n=0;n<80;n++){await new Promise(r=>setTimeout(r,100));if(fs.existsSync(env.session)){const s=JSON.parse(fs.readFileSync(env.session));if(s.pid!==child.pid)throw Error('CANDIDATE_SESSION_MISMATCH');console.log(JSON.stringify({status:'SYNTHETIC_CANDIDATE_STARTED',pid:child.pid,endpoint:s.endpoint,real_model_calls:0,formal_actions:0}));return;}}throw Error('CANDIDATE_START_UNKNOWN_DO_NOT_REPEAT');
 }
 if(!['status','stop','open'].includes(action))throw Error('使用 start --synthetic、stop、status 或 open；未提供真實生成入口。');
 const child=spawn(process.execPath,[path.join(APP_ROOT,'scripts/development.mjs'),action],{cwd:APP_ROOT,windowsHide:true,stdio:'inherit'});const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve);});if(code!==0)process.exitCode=code;
}
run().catch(e=>{console.error(e.message);process.exitCode=1;});
