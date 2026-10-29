import {runtimeQuiescence} from './runtime-quiescence.mjs';
import {stopped,configRevision} from './setup-core.mjs';
import fs from 'node:fs';import path from 'node:path';import {randomUUID} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';import {pathToFileURL} from 'node:url';
import {APP_ROOT,loadEnvironment,noLinks} from './environment.mjs';
import {DEFAULT_BRAIN,brainSettings} from '../src/brain/contract.mjs';

function candidateRoot(root){const file=path.join(root,'.private/candidate-scope.json');noLinks(root,file);const s=JSON.parse(fs.readFileSync(file));if(s.id!=='app-server-integration-20261028.1'||s.formal_actions!==false)throw Error('ISOLATED_CANDIDATE_REQUIRED');}
export function inspectSelection(root=APP_ROOT){candidateRoot(root);const env=loadEnvironment(root),pending=runtimeQuiescence(root,env.runtime,{session:env.session});try{stopped(root);}catch{pending.push('ALL_CANDIDATE_SESSIONS_MUST_STOP');}return {env,pending:[...new Set(pending)]};}
export function selectBrain(root,adapter){
 if(!['codex-cli','codex-app-server'].includes(adapter))throw Error('CANDIDATE_ADAPTER_SELECTION');
 const revision=configRevision(root),lock=path.join(root,'config/.setup-save.lock');noLinks(root,lock);let fd,next;
 try{fd=fs.openSync(lock,'wx');const {env,pending}=inspectSelection(root);if(pending.length)throw Error('CANDIDATE_SWITCH_BLOCKED: '+pending.join(', '));if(configRevision(root)!==revision)throw Error('CANDIDATE_CONFIGURATION_CHANGED');
 const settings=brainSettings({...DEFAULT_BRAIN,adapter,enabled:true}),config={...env.config,version:adapter==='codex-app-server'?4:2,inference:settings};
 const receiptDir=path.join(root,'.private/brain-selections');noLinks(root,receiptDir);fs.mkdirSync(receiptDir,{recursive:true});const key=randomUUID(),receipt={id:key,previous:env.config,next:config,phase:'prepared',authority_changed:false,model_calls:0,formal_actions:false},receiptFile=path.join(receiptDir,key+'.json');fs.writeFileSync(receiptFile,JSON.stringify(receipt,null,2),{flag:'wx'});
 noLinks(root,path.join(root,'config/development.local.json'));next=path.join(root,'config/development.local.json.new-'+key);fs.writeFileSync(next,JSON.stringify(config,null,2),{flag:'wx'});fs.renameSync(next,path.join(root,'config/development.local.json'));fs.writeFileSync(receiptFile,JSON.stringify({...receipt,phase:'saved',revision:configRevision(root)},null,2));return {status:'SAVED_FOR_NEXT_START',adapter,receipt:key,model_calls:0,life_authority_changed:false};
 }catch(e){if(e.code==='EEXIST')throw Error('CANDIDATE_CONFIGURATION_SAVE_BUSY');throw e;}finally{if(next&&fs.existsSync(next))fs.unlinkSync(next);if(fd!==undefined){fs.closeSync(fd);fs.unlinkSync(lock);}}
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){const action=process.argv[2];if(action==='status'){const s=inspectSelection();console.log(JSON.stringify({adapter:s.env.brain.adapter,blocked:s.pending,real_inference_authorized:false}));}else if(action==='exec'||action==='app-server')console.log(JSON.stringify(selectBrain(APP_ROOT,action==='exec'?'codex-cli':'codex-app-server')));else throw Error('使用 status、exec 或 app-server；只操作本獨立候選。');}
