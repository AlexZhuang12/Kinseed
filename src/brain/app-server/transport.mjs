import fs from 'node:fs';import path from 'node:path';import {spawn,spawnSync} from 'node:child_process';
import {CODEX_VERSION} from '../../codex-versions.mjs';import {EventEmitter} from 'node:events';import {boundedLines,RESOURCE_LIMITS} from '../resource-budget.mjs';import {codexArgs,safeEnv} from '../codex-policy.mjs';import {ownedDirectory} from './journal.mjs';
export function appServerArgs(){const src=codexArgs('unused'),pairs=[];for(let i=0;i<src.length;i++)if(src[i]==='-c'){const v=src[++i];if(!v.startsWith('mcp_servers.'))pairs.push('-c',v);}return ['app-server','--stdio',...pairs,'-c','mcp_servers={}','-c','model_provider="openai"'];}
export function authorizeProvider(authorization){if(!authorization||authorization.model!=='gpt-6.1-sol'||authorization.reasoning!=='low'||!Number.isInteger(authorization.max_calls)||authorization.max_calls<1||authorization.expires_at<=Date.now()||!authorization.owner_approval_reference)throw Error('REAL_MODEL_NOT_AUTHORIZED');return authorization;}
export function realProcessFactory({binary,base,authorization,probe=spawnSync,spawnProcess=spawn}={}){const auth=authorizeProvider(authorization);let remaining=auth.max_calls;if(!path.isAbsolute(binary??'')||!fs.existsSync(binary))throw Error('CANDIDATE_BINARY');const version=probe(binary,['--version'],{windowsHide:true,encoding:'utf8',env:safeEnv(),timeout:10000});if(version.status!==0||version.stdout.trim()!=='codex-cli '+CODEX_VERSION)throw Error('APP_SERVER_SCHEMA_VERSION');return owner=>{authorizeProvider(auth);const home=ownedDirectory(base,path.join(base,owner,'codex-home'));const child=spawnProcess(binary,appServerArgs(),{cwd:home,windowsHide:true,env:safeEnv({CODEX_HOME:home}),stdio:['pipe','pipe','pipe']});child.consumeAuthorizedTurn=()=>{authorizeProvider(auth);if(remaining<=0)throw Error('APPROVED_MODEL_CALL_LIMIT');remaining--;};return child;};}
export function productionProcessFactory({binary,base,spawnProcess=spawn,probe=spawnSync}={}){if(!path.isAbsolute(binary??'')||!fs.existsSync(binary))throw Error('APP_SERVER_BINARY_REQUIRED');const version=probe(binary,['--version'],{windowsHide:true,encoding:'utf8',env:safeEnv(),timeout:10000});if(version.status!==0||version.stdout.trim()!=='codex-cli '+CODEX_VERSION)throw Error('APP_SERVER_SCHEMA_VERSION');const home=ownedDirectory(base,path.join(base,'account-home'));return ()=>spawnProcess(binary,appServerArgs(),{cwd:home,windowsHide:true,env:safeEnv({CODEX_HOME:home}),stdio:['pipe','pipe','pipe']});}
export class StdioRpc extends EventEmitter {
 constructor(child,{timeout=1500,limit=RESOURCE_LIMITS.line}={}) {
  super();this.child=child;this.timeout=timeout;this.pending=new Map();this.retired=new Map();this.sequence=0;this.closed=false;this.wire=0;
  this.readyClose=new Promise(resolve=>this.resolveClose=resolve);
  const die=e=>{this.error=e;for(const [id,p]of [...this.pending])this.finish(id,p,'closed',null,e);this.emit('fault',e);};
  boundedLines(child.stdout,{limit,onLimit:()=>die(Error('RPC_FRAME_LIMIT')),onLine:line=>{try{
   this.wire+=Buffer.byteLength(line);if(this.wire>RESOURCE_LIMITS.wire)throw Error('RPC_WIRE_LIMIT');const m=JSON.parse(line);
   if(!m||typeof m!=='object'||Array.isArray(m))throw Error('RPC_INVALID_MESSAGE');
   if(m.method){this.emit('message',m);return;}const p=this.pending.get(m.id);
   if(p)this.finish(m.id,p,m.error?'error':'completed',m.result,m.error?Error('RPC_ERROR:'+p.method+':'+(Number.isInteger(m.error.code)?m.error.code:'REMOTE')):null);
   else {const prior=this.retired.get(m.id);if(prior)this.emit('diagnostic',{event:'rpc-late-response',pid:child.pid,rpc_id:m.id,method:prior.method,phase:prior.phase,elapsed_ms:Date.now()-prior.at,prior_outcome:prior.outcome,authorizes_turn:false});}
  }catch(e){die(e);}}});
  child.stderr.on('data',b=>{this.diagnostics=(this.diagnostics??0)+b.length;if(this.diagnostics>RESOURCE_LIMITS.stderr)die(Error('RPC_DIAGNOSTIC_LIMIT'));});
  child.stdin.on('error',die);child.once('error',die);child.once('close',(code,signal)=>{this.closed=true;die(Error('RPC_CLOSED'));this.resolveClose({code,signal});this.emit('closed');});
 }
 finish(id,p,outcome,result,error) {
  if(this.pending.get(id)!==p)return;this.pending.delete(id);clearTimeout(p.timer);p.signal?.removeEventListener('abort',p.abort);
  const meta={method:p.method,phase:p.phase,at:p.at,outcome};this.retired.set(id,meta);while(this.retired.size>512)this.retired.delete(this.retired.keys().next().value);
  this.emit('diagnostic',{event:outcome==='timeout'?'rpc-timeout':'rpc-finished',pid:this.child.pid,rpc_id:id,method:p.method,phase:p.phase,timeout_ms:p.timeout,elapsed_ms:Date.now()-p.at,outcome});
  error?p.reject(error):p.resolve(result);
 }
 send(m){if(this.closed||this.error)throw Error('RPC_UNAVAILABLE');if(m.method==='turn/start'){this.child.consumeAuthorizedTurn?.();this.emit('diagnostic',{event:'rpc-dispatch-attempt',pid:this.child.pid,rpc_id:m.id,method:m.method,phase:'submit'});}const p=this.pending.get(m.id);if(p?.signal?.aborted)throw Error('RPC_ABORTED:'+m.method);this.child.stdin.write(JSON.stringify(m)+'\n');}
 request(method,params,timeout=this.timeout,{signal,phase='protocol'}={}) {
  if(!Number.isFinite(timeout)||timeout<1||timeout>180000)return Promise.reject(Error('RPC_INVALID_TIMEOUT'));
  if(signal?.aborted)return Promise.reject(Error('RPC_ABORTED:'+method));
  return new Promise((resolve,reject)=>{const id='client-'+(++this.sequence),p={resolve,reject,method,phase,timeout,at:Date.now(),signal};
   p.abort=()=>this.finish(id,p,'aborted',null,Error('RPC_ABORTED:'+method));this.pending.set(id,p);
   p.timer=setTimeout(()=>this.finish(id,p,'timeout',null,Error('RPC_TIMEOUT:'+method)),timeout);signal?.addEventListener('abort',p.abort,{once:true});
   this.emit('diagnostic',{event:'rpc-started',pid:this.child.pid,rpc_id:id,method,phase,timeout_ms:timeout});
   try{if(signal?.aborted)p.abort();else this.send({id,method,params});}catch(e){this.finish(id,p,'send_failed',null,e);}
  });
 }
 reply(id,result){this.send({id,result});}
 reject(id,message){try{this.send({id,error:{code:-32602,message}});}catch{}}
 async stop(ms=1000){if(this.closed)return true;const at=Date.now();this.emit('diagnostic',{event:'process-stop-start',pid:this.child.pid,limit_ms:ms});try{if(process.platform==='win32'){const k=spawn('taskkill.exe',['/PID',String(this.child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});k.on('error',()=>this.child.kill());}else this.child.kill('SIGTERM');}catch{}const confirmed=await Promise.race([this.readyClose.then(()=>true),new Promise(r=>{const t=setTimeout(()=>r(false),ms);t.unref();})]);this.emit('diagnostic',{event:'process-stop-result',pid:this.child.pid,limit_ms:ms,elapsed_ms:Date.now()-at,confirmed});return confirmed;}
}
