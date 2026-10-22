import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {Controller,equalSecret} from './controller.mjs';
import {id} from './store.mjs';
import {makeRunner} from './codex.mjs';
export async function serve({dir,profile,port=0,runner,preflight={ok:true},interval=250,clock}={}){
 const ownerToken=id()+id();const controller=new Controller(dir,profile,{now:clock??(()=>Date.now()),runner});
 const html=fs.readFileSync(path.join(import.meta.dirname,'owner.html'),'utf8');
 let endpoint;
 const server=http.createServer(async(req,res)=>{
  const json=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  try{
   if(req.headers.host!==new URL(endpoint).host)return json(403,{error:'INVALID_HOST'});
   if(req.headers.origin&&req.headers.origin!==endpoint)return json(403,{error:'INVALID_ORIGIN'});
   if(req.method==='GET'&&req.url==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"});res.end(html);return;}
   const bearer=req.headers.authorization?.replace(/^Bearer /,'');
   if(req.url.startsWith('/owner/')&&!equalSecret(bearer,ownerToken))return json(401,{error:'OWNER_AUTH_REQUIRED'});
   if(req.method==='GET'&&req.url==='/owner/status')return json(200,{...controller.status(),preflight});
   if(req.method==='GET'&&req.url==='/owner/profiles')return json(200,{profiles:['kinseed-test-v1','kinseed-test-v2']});
   if(req.method==='GET'&&req.url.startsWith('/owner/history')){const cursor=Number(new URL(req.url,endpoint).searchParams.get('cursor')??0);if(!Number.isInteger(cursor)||cursor<0)throw Error('CURSOR_SCHEMA');return json(200,{events:controller.store.events(cursor,100)});}
   if(req.method!=='POST')return json(404,{error:'NOT_FOUND'});
   if(req.headers['content-type']!=='application/json')return json(415,{error:'JSON_REQUIRED'});
   let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>30000){json(413,{error:'BODY_LIMIT'});return;}}
   const body=JSON.parse(raw);
   if(req.url==='/owner/command'){
    if(['start','resume'].includes(body.action)&&!preflight.ok)return json(409,{error:'PREFLIGHT_BLOCKED',preflight});
    if(body.action==='profile'&&body.profile_id){if(!['kinseed-test-v1','kinseed-test-v2'].includes(body.profile_id))throw Error('PROFILE_SCHEMA');body.profile=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'..','profiles',body.profile_id+'.json'),'utf8'));}
    try{const value=controller.owner(body);json(200,value);return;}catch(e){try{controller.store.tx(()=>controller.store.event('owner.command_rejected',{action:String(body.action).slice(0,40),error:e.message},'owner-local',{success:false,error_class:e.message}));}catch{controller.fatal='HISTORY_UNAVAILABLE';controller.cancelAll('HISTORY_UNAVAILABLE');}throw e;}
   }
   if(req.url==='/owner/backup'){
    if(controller.store.get('lease'))throw Error('STOP_FIRST');const name='backup-'+Date.now()+'.sqlite';const destination=path.join(dir,'backups');fs.mkdirSync(destination,{recursive:true});const result=await controller.store.backup(path.join(destination,name));controller.store.tx(()=>controller.store.event('backup.created',{file:name,sha256:result.sha256},'owner-local'));return json(200,{name,sha256:result.sha256});
   }
   if(req.url==='/cycle/tool'){const value=await controller.tool(bearer,body.name,body.args);return json(200,value);}
   if(req.url==='/cycle/protocol')return json(200,controller.protocol(bearer,body));
   return json(404,{error:'NOT_FOUND'});
  }catch(e){json(409,{error:e.message});}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
 endpoint='http://127.0.0.1:'+server.address().port;
 if(!runner)controller.runner=makeRunner({endpoint,cwd:path.join(dir,'life'),evidenceDir:path.join(dir,'codex-evidence')});
 let ticking=false;const timer=setInterval(async()=>{if(ticking)return;ticking=true;try{
  if(fs.existsSync(path.join(dir,'EMERGENCY_STOP'))){controller.owner({action:'stop',scope:'individual',request_id:id()});fs.unlinkSync(path.join(dir,'EMERGENCY_STOP'));}
  await controller.tick();controller.exportNotes(path.join(dir,'workspace'));
 }catch(e){controller.fatal=e.message;controller.cancelAll(e.message);}finally{ticking=false;}},interval);timer.unref();
 return {server,controller,endpoint,ownerToken,async close(){clearInterval(timer);controller.shutdown();await new Promise(r=>server.close(r));const until=Date.now()+10000;while([...controller.tasks.values()].some(t=>['running','cancel_requested'].includes(t.status))&&Date.now()<until)await new Promise(r=>setTimeout(r,50));},};
}
