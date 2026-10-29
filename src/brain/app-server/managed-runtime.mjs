import {isTurnAuthority} from './turn-authority.mjs';
import path from 'node:path';
import {AppServerCandidate} from './adapter.mjs';
import {realProcessFactory,productionProcessFactory,StdioRpc} from './transport.mjs';
import {spawn} from 'node:child_process';
import {Journal,digest,ownedDirectory} from './journal.mjs';
import {controllerScope} from './controller-scope.mjs';
import {tools} from '../../v1_2/mcp.mjs';
import {validateInvocation,descriptor} from '../contract.mjs';
import {assertLifeEndpoint} from '../endpoint-scope.mjs';
import {createHash} from 'node:crypto';

// One controller owns this bounded pool. A slot never changes its owner/purpose.
export class ManagedAppServer {
 constructor({base,factory=null,synthetic=false,authorization=null,binary=null,maxSlots=4,production=false,turnAuthority=null,nativeAllowed=false,configurationError=null,...options}){
  if(!Number.isInteger(maxSlots)||maxSlots<1||maxSlots>4)throw Error('APP_SERVER_POOL_LIMIT');
  if(production&&!isTurnAuthority(turnAuthority))throw Error('KINSEED_TURN_AUTHORITY_REQUIRED');this.preflightRpcs=new Set();this.authentication='NOT_CHECKED';this.configurationError=configurationError;this.production=production;this.turnAuthority=turnAuthority;
  this.base=ownedDirectory(base,base);this.synthetic=synthetic;this.closed=false;this.slots=new Map();this.pendingKeys=new Set();this.maxSlots=maxSlots;this.options=options;
  if(factory&&!synthetic&&!authorization&&!production)throw Error('APP_SERVER_FACTORY_AUTH_REQUIRED');
  this.accountHome=ownedDirectory(base,path.join(base,'account-home'));
  try{this.factory=factory??(production?(nativeAllowed?productionProcessFactory({binary,base}):null):authorization?realProcessFactory({base:path.join(base,'provider-homes'),binary,authorization,spawnProcess:(bin,args,options)=>spawn(bin,args,{...options,env:{...options.env,CODEX_HOME:this.accountHome}})}):null);}catch(e){if(!production)throw e;this.factory=null;this.configurationError=e.message;}
  this.authorization=authorization;this.preparations=new Map();this.preparationState=new Map();
  this.dispatches=new Journal(path.join(base,'dispatch-intents'));
 }
 readiness(){const live=this.synthetic||this.production||!!this.authorization&&this.authorization.expires_at>Date.now()&&this.dispatches.events.filter(r=>r.kind==='model-dispatch').length<this.authorization.max_calls;return {ok:!!this.factory&&!this.closed&&!this.closing&&!this.shutdownRequested&&!this.preflightRpcs.size&&live,synthetic:this.synthetic,real_inference_authorized:!this.synthetic&&!!this.authorization&&live&&!this.closed&&!this.shutdownRequested,error:this.preflightRpcs.size?'APP_SERVER_PREFLIGHT_IN_PROGRESS_OR_EXIT_UNKNOWN':this.factory&&live?null:this.configurationError??(this.production?'APP_SERVER_NATIVE_DISABLED_OR_UNCONFIGURED':'APP_SERVER_REAL_AUTH_REQUIRED')};}
 async preflight(){if(this.preflightPromise)return this.preflightPromise;this.preflightPromise=this.checkAccount();try{return await this.preflightPromise;}finally{this.preflightPromise=null;}}
 async checkAccount(){const ready=this.readiness();if(!ready.ok||this.synthetic)return ready;const child=this.factory('account-preflight'),rpc=new StdioRpc(child,{timeout:10000});this.preflightRpcs.add(rpc);if(this.production)this.dispatches.append({kind:'service',owner:'account-preflight',key:String(child.pid),pid:child.pid,state:'started'});rpc.on('fault',()=>{});rpc.on('message',m=>{if(m.id!==undefined)rpc.reject(m.id,'PREFLIGHT_NO_TOOLS');});try{await rpc.request('initialize',{clientInfo:{name:'kinseed_candidate_preflight',version:'integration'},capabilities:{experimentalApi:true}});rpc.send({method:'initialized'});const result=await rpc.request('account/read',{refreshToken:false});this.authentication=result.account?'PRESENT_LAST_CHECK':'LOGIN_REQUIRED';return {...ready,ok:!!result.account,authentication:result.account?'dedicated-account-present':'LOGIN_REQUIRED',inference_access:'not_yet_verified'};}catch(e){this.authentication='CHECK_FAILED';return {...ready,ok:false,error:e.message};}finally{if(!await rpc.stop(3000))throw Error('APP_SERVER_PREFLIGHT_EXIT_UNKNOWN');this.preflightRpcs.delete(rpc);if(this.production)this.dispatches.append({kind:'service',owner:'account-preflight',key:String(child.pid),pid:child.pid,state:'closed'});}}
 status(){return {candidate:!this.production,production_binding:this.production,authorization_mode:this.production?'kinseed-reservations':'qualification',synthetic:this.synthetic,configured:!!this.factory,preflight_pending:this.preflightRpcs.size,authority_required_per_turn:this.production,account_status:this.synthetic?'SYNTHETIC_NO_LOGIN':this.authentication,configuration_error:this.configurationError,real_inference_authorized:this.readiness().real_inference_authorized,services:this.slots.size,active:[...this.slots.values()].filter(e=>e.slot?.busy).length,quarantined:[...this.slots.values()].filter(e=>e.slot?.quarantined||e.orphans.length).length,max_services:this.maxSlots,automatic_fallback:false,preparation:[...this.preparationState.entries()].map(([owner,v])=>({owner,...v})),host_phases:[...this.slots.values()].map(e=>({phase:e.slot?.phase??'not-started',prepared:!!e.slot?.prepared,account_ready:e.slot?.accountReady??false,last_model_work:e.lastInference??null})),account_check_is_work_host_ready:false};}
 async engine(key){
  if(this.closed||this.closing||this.shutdownRequested||!this.factory)throw Error('APP_SERVER_REAL_AUTH_REQUIRED');
  if(this.slots.has(key))return this.slots.get(key);
  if(this.creating)throw Error('APP_SERVER_POOL_BUSY');this.creating=true;
  try{if(this.slots.size>=this.maxSlots){const idle=[...this.slots].find(([k,e])=>!this.pendingKeys.has(k)&&!e.slot?.busy&&(!e.slot?.prepared||e.slot.prepared.expiresAt<=Date.now())&&!e.slot?.quarantined&&!e.orphans.length);if(!idle)throw Error('APP_SERVER_POOL_BUSY');await idle[1].close();this.slots.delete(idle[0]);}if(this.closed||this.closing||this.shutdownRequested)throw Error('APP_SERVER_CLOSED_DURING_ACQUIRE');
   let e;const factory=owner=>{const child=this.factory(owner),consume=child.consumeAuthorizedTurn;child.consumeAuthorizedTurn=()=>{if(this.production||!this.synthetic){const a=this.authorization,c=e.slot.context,rows=this.dispatches.events.filter(r=>r.kind==='model-dispatch');if(this.production)this.turnAuthority.assert(c.dispatch_proof,c);else if(!a||a.expires_at<=Date.now()||rows.length>=a.max_calls)throw Error('APP_SERVER_PERSISTENT_MODEL_CAP');const id=digest({owner,request_id:c.request_id});if(rows.some(r=>r.key===id))throw Error('APP_SERVER_NO_MODEL_REPLAY');c.turnAttempted=true;this.dispatches.append({kind:'model-dispatch',owner,key:id,request_id:c.request_id,purpose:c.purpose,synthetic:this.synthetic,authorization_mode:this.production?'kinseed-reservations':'qualification',at:Date.now()});}consume?.();};return child;};
   e=new AppServerCandidate({base:path.join(this.base,key),factory,requireAccount:this.production&&!this.synthetic,...this.options});this.slots.set(key,e);return e;
  }finally{this.creating=false;}
 }
 async invoke(key,request){if(this.pendingKeys.has(key))throw Error('APP_SERVER_POOL_BUSY');this.pendingKeys.add(key);try{return await(await this.engine(key)).execute(request);}finally{this.pendingKeys.delete(key);}}

 async prepareLife(e){
  if(this.closed||this.closing||this.shutdownRequested)return false;
  const owner=e.info.individual_id,c=e.store.get('control'),life=JSON.stringify(e.store.get('life')),window=c.authorization_until,now=e.now(),state=this.preparationState.get(owner);
  if(state?.window===window&&state.authority_version===c.version&&(state.attempts>=3||state.retry_at>Date.now()))return false;
  if(this.preparations.has(owner))return false;
  const abort=new AbortController(),version=c.version;
  const check=()=>{if(this.closed||this.closing||this.shutdownRequested||abort.signal.aborted)throw Error('PREPARATION_STOPPED');e.assertAllowed();const live=e.store.get('control');if(live.version!==version||live.authorization_until!==window||JSON.stringify(e.store.get('life'))!==life)throw Error('PREPARATION_AUTHORITY_CHANGED');};
  let timer;const work=(async()=>{try{check();timer=setInterval(()=>{try{check();}catch{abort.abort();}},25);timer.unref();const engine=await this.engine('life-'+digest(owner).slice(0,32));const attempts=state?.window===window&&state.authority_version===version?(state.attempts??0):0;
   this.preparationState.set(owner,{window,authority_version:version,phase:'preparing',attempts,retry_at:0});
   await engine.prepare(owner,{tools,signal:abort.signal,deadline:Date.now()+Math.min(engine.policy.preparationMs,Math.max(1,window-now)),assert:check});check();
   this.preparationState.set(owner,{window,authority_version:version,phase:'prepared',attempts:0,retry_at:0});return true;
  }catch(error){const attempts=(state?.window===window&&state.authority_version===version?(state.attempts??0):0)+1;this.preparationState.set(owner,{window,authority_version:version,phase:'waiting',attempts,retry_at:Date.now()+(attempts===1?30000:60000),error:error.message,model_submitted:false,daily_preserved:true});return false;
  }finally{clearInterval(timer);}})();this.preparations.set(owner,{abort,work});try{return await work;}finally{this.preparations.delete(owner);}
 }
 async execute(request){
  const {purpose,tools:capability}=validateInvocation(request);if(this.production){if(purpose==='life')request={...request,dispatch_proof:this.turnAuthority.life(request)};this.turnAuthority.assert(request.dispatch_proof,request);}let owner,scope;
  if(purpose==='life'){
   const {controller:e,lease,token,task,endpoint}=capability;assertLifeEndpoint(endpoint,e);e.assertAllowed(lease);
   const current=e.store.get('lease');if(current?.cycle_id!==request.request_id||lease.cycle_id!==request.request_id||current.token_hash!==createHash('sha256').update(token).digest('hex'))throw Error('STALE_OR_FOREIGN_LIFE_CAPABILITY');
   owner=e.info.individual_id;scope=controllerScope(capability,tools.map(t=>t.name));
   const abort=new AbortController();task.kind='brain:codex-app-server';task.cancel=()=>abort.abort();
   const externalAbort=()=>abort.abort();request.signal?.addEventListener('abort',externalAbort,{once:true});if(request.signal?.aborted)abort.abort();
   try{return await this.invoke('life-'+digest(owner).slice(0,32),{...request,owner,scope,signal:abort.signal,onSettlement:r=>e.runnerDone(lease,r)});}finally{request.signal?.removeEventListener('abort',externalAbort);}
  }
  // Report/consult contexts get no life tools or life capability, even on a warm process.
  owner='text-'+digest({purpose,directory:request.text_scope}).slice(0,40);
  scope={key:{owner,purpose,request_id:request.request_id},tools:[],assert(){if(request.signal?.aborted||Date.now()>=request.deadline)throw Error('TEXT_AUTHORITY_EXPIRED');},async call(){throw Error('TEXT_HAS_NO_LIFE_TOOLS');}};
  return this.invoke(owner,{...request,owner,scope});
 }
 async close(){if(this.closed)return;if(this.closePromise)return this.closePromise;this.shutdownRequested=true;this.closing=true;for(const p of this.preparations.values())p.abort.abort();this.closePromise=(async()=>{await Promise.all([...this.preparations.values()].map(p=>p.work));for(const rpc of this.preflightRpcs){if(!await rpc.stop(3000))throw Error('APP_SERVER_PREFLIGHT_EXIT_UNKNOWN');this.preflightRpcs.delete(rpc);if(this.production)this.dispatches.append({kind:'service',owner:'account-preflight',key:String(rpc.child.pid),pid:rpc.child.pid,state:'closed'});}if(this.preflightPromise)await this.preflightPromise.catch(()=>{});for(const e of this.slots.values())await e.close();this.slots.clear();this.dispatches.close();this.closed=true;})();try{return await this.closePromise;}finally{if(!this.closed){this.closing=false;this.closePromise=null;}}}
}

export function createAppServerBrain(config,{base,appServerManager,...options}){
 const manager=appServerManager??new ManagedAppServer({base:path.join(base,'app-server'),...options.appServerOptions});const borrowed=!!appServerManager;
 return {binding:descriptor(config),execute(request){validateInvocation(request);if(!config.enabled)throw Error('大腦尚未啟用。');return manager.execute({...request,text_scope:base});},async close(){if(!borrowed)await manager.close();}};
}
