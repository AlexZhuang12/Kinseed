import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {equalSecret} from '../controller.mjs';import {Reports} from './reports.mjs';import {taipeiDay} from './journal-model.mjs';
import {individualOptions,optionState,effectiveArchived,updateOption,publishOptions} from './individual-options.mjs';
export async function serveReports({runtime,dir,port=47431,sessionProvider=()=>JSON.parse(fs.readFileSync(path.join(runtime,'owner-session.json'))),reports=null,interval=15000,publish=state=>publishOptions(path.resolve(import.meta.dirname,'../..'),state)}={}){
 let service=reports,endpoint;const server=http.createServer(async(req,res)=>{
  const send=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  try{const session=sessionProvider();if(req.headers.host!==new URL(endpoint).host)return send(403,{error:'本機服務位址不符。'});if(req.headers.origin&&req.headers.origin!==endpoint)return send(403,{error:'此頁面沒有存取報告的許可。'});
   if(req.method==='GET'&&req.url.split('?')[0]==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"});res.end(fs.readFileSync(path.join(import.meta.dirname,'report.html')));return;}
   if(req.method==='GET'&&req.url==='/report-ui.js'){res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store'});res.end(fs.readFileSync(path.join(import.meta.dirname,'report-ui.js')));return;}
   if(!equalSecret(req.headers.authorization?.replace(/^Bearer /,''),session.token))return send(401,{error:'請由「開啟控制台.cmd」重新進入，再查看報告。'});
   const u=new URL(req.url,endpoint);if(req.method==='GET'&&u.pathname==='/reports')return send(200,{...service.list(u.searchParams.get('day')??taipeiDay(Date.now()),u.searchParams.get('report_id')),owner_endpoint:session.endpoint,archived_ids:effectiveArchived(service.db,runtime)});
   if(req.method==='GET'&&u.pathname==='/individuals'){const v=optionState(service.db);return send(200,{...v,individuals:individualOptions(runtime).map(x=>({...x,archived:v.archived.includes(x.individual_id)}))});}
   if(req.method==='POST'&&u.pathname==='/individuals'){if(req.headers['content-type']!=='application/json')return send(415,{error:'請使用個體管理按鈕。'});let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1000)return send(413,{error:'請求過大。'});}return send(200,updateOption(service.db,runtime,JSON.parse(raw),{publish}));}
   if(req.method==='POST'&&u.pathname==='/generate'){if(req.headers['content-type']!=='application/json')return send(415,{error:'請使用控制台的整理按鈕。'});let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1000)return send(413,{error:'請求過大。'});}const b=JSON.parse(raw);if(Object.keys(b).length!==1||!Object.hasOwn(b,'day'))throw Error('請只選擇要整理的日期。');return send(202,service.enqueue(b.day));}
   if(req.method==='POST'&&u.pathname==='/shutdown'){send(200,{stopping:true});setImmediate(()=>close());return;}return send(404,{error:'找不到報告功能。'});
  }catch(e){send(409,{error:e.message});}
 });await new Promise((resolve,reject)=>{server.once('error',reject);server.listen({host:'127.0.0.1',port,exclusive:true},resolve);});endpoint='http://127.0.0.1:'+server.address().port;
 // Claim the OS singleton before opening storage or recovering jobs; a second launch must not touch live jobs.
 try{service??=new Reports({runtime,dir});}catch(e){server.close();throw e;}
 const timer=setInterval(()=>service.tick().catch(e=>{fs.appendFileSync(path.join(dir,'scheduler-errors.log'),new Date().toISOString()+' '+e.message+'\n');}),interval);timer.unref();await service.tick();
 const close=()=>{clearInterval(timer);service.close();server.close();};return {service,server,endpoint,close};
}
