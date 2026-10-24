// Same-origin Owner report and archive routes; no new individual capability.
import fs from 'node:fs';import path from 'node:path';
import {equalSecret} from '../controller.mjs';
import {taipeiDay} from './journal-model.mjs';
import {effectiveArchived,optionState,individualOptions,updateOption} from './individual-options.mjs';
export function reportRoutes(getService,runtime,getEndpoint){return async(req,res,{ownerToken,json})=>{
 const u=new URL(req.url,'http://127.0.0.1');
 if(req.method==='GET'&&['/reports-view','/report-ui.js'].includes(u.pathname)){
  const html=u.pathname==='/reports-view';res.writeHead(200,{'Content-Type':html?'text/html; charset=utf-8':'text/javascript; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"});res.end(fs.readFileSync(path.join(import.meta.dirname,html?'report.html':'report-ui.js')));return true;
 }
 if(!['/reports','/generate','/individuals'].includes(u.pathname)&&!(req.url==='/owner/shutdown'&&getService()?.busy))return false;
 if(!equalSecret(req.headers.authorization?.replace(/^Bearer /,''),ownerToken)){json(401,{error:'請由「開啟控制台.cmd」重新進入。'});return true;}
 const service=getService();if(!service){json(503,{error:'生活報告尚未就緒，請稍後再試。'});return true;}
 if(req.url==='/owner/shutdown'){json(409,{error:'生活報告仍在整理，請待完成或失敗收尾後再關閉；沒有中斷模型或清除工作。'});return true;}
 if(req.method==='GET'&&u.pathname==='/reports'){json(200,{...service.list(u.searchParams.get('day')??taipeiDay(Date.now()),u.searchParams.get('report_id')),owner_endpoint:getEndpoint(),archived_ids:effectiveArchived(service.db,runtime)});return true;}
 if(req.method==='GET'&&u.pathname==='/individuals'){const v=optionState(service.db);json(200,{...v,individuals:individualOptions(runtime).map(x=>({...x,archived:v.archived.includes(x.individual_id)}))});return true;}
 if(req.method!=='POST'||req.headers['content-type']!=='application/json'){json(415,{error:'請使用控制台的操作按鈕。'});return true;}
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1000){json(413,{error:'請求過大。'});return true;}}const b=JSON.parse(raw);
 if(u.pathname==='/individuals'){json(200,updateOption(service.db,runtime,b,{publish:()=>{}}));return true;}
 if(u.pathname==='/generate'){if(fs.existsSync(path.join(service.dir,'DISABLED')))throw Error('每日報告目前暫停，請執行「啟動報告服務.cmd」再整理。');if(Object.keys(b).length!==1||!Object.hasOwn(b,'day'))throw Error('請只選擇要整理的日期。');json(202,service.enqueue(b.day));return true;}
 json(404,{error:'找不到這項操作。'});return true;
};}
