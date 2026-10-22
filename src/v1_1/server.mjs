import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {Platform,safeDirectory} from './platform.mjs';
import {id} from './store.mjs';
import {equalSecret} from '../controller.mjs';
import {makeRunner} from './codex.mjs';
import {restoreIndividual} from './recovery.mjs';
export async function serve({dir,port=0,interval=250,clock,runnerFactory,engineering=false,preflight={ok:true}}={}){
 const ownerToken=id()+id(),platform=new Platform(dir,{now:clock??(()=>Date.now()),engineering,runnerFactory});let endpoint,closeApp;
 const server=http.createServer(async(req,res)=>{const json=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  try{if(req.headers.host!==new URL(endpoint).host)return json(403,{error:'INVALID_HOST'});if(req.headers.origin&&req.headers.origin!==endpoint)return json(403,{error:'INVALID_ORIGIN'});
   if(req.method==='GET'&&req.url==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"});res.end(fs.readFileSync(path.join(import.meta.dirname,'owner.html')));return;}
   const token=req.headers.authorization?.replace(/^Bearer /,'');if(req.url.startsWith('/owner/')&&!equalSecret(token,ownerToken))return json(401,{error:'OWNER_AUTH_REQUIRED'});
   if(req.method==='GET'&&req.url==='/owner/status')return json(200,{...platform.status(),preflight});
   if(req.method==='GET'&&req.url.startsWith('/owner/history?')){const u=new URL(req.url,endpoint),e=platform.entity(u.searchParams.get('individual_id')),cursor=Number(u.searchParams.get('cursor')??0);if(!Number.isSafeInteger(cursor)||cursor<0)throw Error('CURSOR_SCHEMA');return json(200,{individual_id:e.info.individual_id,events:e.store.events(cursor,100)});}
   if(req.method!=='POST')return json(404,{error:'NOT_FOUND'});if(req.headers['content-type']!=='application/json')return json(415,{error:'JSON_REQUIRED'});
   const chunks=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>2200000)return json(413,{error:'BODY_LIMIT'});chunks.push(chunk);}const raw=new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)),b=JSON.parse(raw);
   if(req.url==='/cycle/protocol')return json(200,platform.capability(token).protocol(token,b));
   if(req.url==='/cycle/tool')return json(200,await platform.capability(token).tool(token,b.name,b.args??{}));
   if(req.url==='/owner/create')return json(200,platform.create(b));
   if(req.url==='/owner/import')return json(200,platform.importPackage(b,raw));
   if(req.url==='/owner/preview')return json(200,platform.preview(b));
   if(req.url==='/owner/adopt')return json(200,platform.adopt(b));
   if(req.url==='/owner/birth'){if(!preflight.ok)throw Error('PREFLIGHT_BLOCKED');return json(200,platform.birth(b));}
   if(req.url==='/owner/command'){if(['start','resume'].includes(b.action)&&!preflight.ok)throw Error('PREFLIGHT_BLOCKED');return json(200,platform.command(b));}
   if(req.url==='/owner/global')return json(200,platform.globalCommand(b));
   if(req.url==='/owner/shutdown'){platform.globalCommand({action:'stop',expected_version:platform.global().version,request_id:id()});json(200,{shutdown_requested:true,remote_cancel_confirmation:'unknown'});setImmediate(()=>closeApp().catch(err=>console.error('關閉受阻：'+err.message)));return;}
   if(req.url==='/owner/backup'){const e=platform.entity(b.individual_id);if(e.store.get('lease')||!e.store.get('control').stop_lock)throw Error('STOP_FIRST');const out=safeDirectory(dir,path.join(dir,'individuals',b.individual_id,'backups'));fs.mkdirSync(out,{recursive:true});const name=id()+'.sqlite',result=await e.store.backup(path.join(out,name));return json(200,{name,sha256:result.sha256});}
   if(req.url==='/owner/restore'){const e=platform.entity(b.individual_id);if(typeof b.name!=='string'||!/^[-a-f0-9]{36}\.sqlite$/.test(b.name))throw Error('BACKUP_NAME');return json(200,restoreIndividual(e.store,safeDirectory(dir,path.join(dir,'individuals',b.individual_id,'backups',b.name))));}
   throw Error('NOT_FOUND');
  }catch(e){try{platform.audit('request.rejected',{route:req.url.split('?')[0],error:e.message});}catch{platform.globalCommand({action:'stop',expected_version:platform.global().version,request_id:id()});}json(409,{error:e.message});}
 });
 await new Promise((r,j)=>{server.once('error',j);server.listen(port,'127.0.0.1',r);});endpoint='http://127.0.0.1:'+server.address().port;
 if(!runnerFactory)platform.runnerFactory=e=>makeRunner({endpoint,cwd:safeDirectory(dir,path.join(dir,'individuals',e.info.individual_id,'life')),evidenceDir:safeDirectory(dir,path.join(dir,'individuals',e.info.individual_id,'codex-evidence')),prompt:lifePrompt});
 let ticking=false;const timer=setInterval(async()=>{if(ticking)return;ticking=true;try{if(fs.existsSync(path.join(dir,'EMERGENCY_STOP'))){platform.globalCommand({action:'stop',expected_version:platform.global().version,request_id:id()});fs.unlinkSync(path.join(dir,'EMERGENCY_STOP'));}await platform.tick();for(const e of platform.individuals.values())e.exportNotes(path.join(dir,'individuals',e.info.individual_id,'workspace'));}catch(err){try{platform.globalCommand({action:'stop',expected_version:platform.global().version,request_id:id()});platform.audit('platform.fail_closed',{error:err.message});}catch{} }finally{ticking=false;}},interval);timer.unref();
 let closed=false;closeApp=async()=>{if(closed)return;closed=true;clearInterval(timer);await platform.close();await new Promise(r=>server.close(r));};return {platform,server,endpoint,ownerToken,close:closeApp};
}
export const lifePrompt=`這是 Kinseed 個體的新 Codex Session，身份完全以 kinseed MCP get_context 取得的自身資料為準。首先 get_context，讀取獨立身份、生活狀態、前輪記憶、計畫與有效授權。identity.sources 若存在，必須透過 read_identity_source 分頁讀取自身已批准的原生條件來源原文，不把索引當完整條文；若有限輪次資源不足讀完，明示來源未完整讀取並等待，不補造規則。只使用該 MCP 的低風險本機筆記工具，不讀其他個體或 Owner 檔案、不執行程式或 shell、不呼叫外部服務。身份意願不等於實作工具或授權。自主選一項有用觀察，write_note 保存可公開成果（name 必須以 .md 結尾）。最後 commit_cycle：expected_version 使用 a.version；memory 與 plan 保留有用的前輪資訊且由你決定。若自身 a.version 小於 2 可選 continue，否則選 wait，wait_ms 為 60000 或更大。commit_cycle 後即結束。休眠期間沒有持續思考。只輸出可公開的簡短理由，不輸出內部推理。成本未知。`;
