import {bindOwnedLifeEndpoint} from '../brain/endpoint-scope.mjs';
import {LOCAL_VERSION} from './local-version.mjs';
import {readLocalized} from '../i18n/server.mjs';
import fs from 'node:fs';import path from 'node:path';
import {serve,lifePrompt} from './server.mjs';import {Reports} from './reports.mjs';import {effectiveArchived} from './individual-options.mjs';import {reportRoutes} from './unified-reports.mjs';
import {lifeRunner,textInference} from '../brain/runtime.mjs';import {DEFAULT_BRAIN,descriptor} from '../brain/contract.mjs';import {brainPreflight} from '../brain/preflight.mjs';
export async function startUnified({runtime,reportsDir,port=62372,engineering=false,schedule=true,preflightOverride,runnerFactory,reportModel,inferenceEnabled=true}={}){
 const config={...DEFAULT_BRAIN,enabled:inferenceEnabled},preflight=preflightOverride??await brainPreflight(config);let app,reports;
 const reportHandler=reportRoutes(()=>reports,runtime,()=>app.endpoint);
 const handler=async(req,res,context)=>{if(req.method==='GET'&&new URL(req.url,'http://127.0.0.1').pathname==='/'){
  const asset=readLocalized(req.url,'owner'),version=LOCAL_VERSION+(inferenceEnabled?'':' [STAGING]');
  const html=asset.content.toString('utf8').replace(/<title>[^<]*<\/title>/,'<title>Kinseed '+version+'</title>').replace(/(<header><h1>Kinseed <small[^>]*>)[^<]*(<\/small>)/,'$1'+version+'$2');
  res.writeHead(200,{'Content-Type':asset.type,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"});res.end(html);return true;
 }return reportHandler(req,res,context);};
 app=await serve({dir:runtime,port,engineering,timezone:'Asia/Taipei',preflight,ownerExtension:handler,runnerFactory:runnerFactory??(e=>app.platform.dailyPreflightReady?lifeRunner({endpoint:app.endpoint,base:e.store.dir,cwd:path.join(e.store.dir,'life'),evidenceDir:path.join(e.store.dir,'brain-evidence'),prompt:lifePrompt,config}):async()=>{throw Error('PREFLIGHT_BLOCKED');})});
 try{
  bindOwnedLifeEndpoint(app.platform,app.endpoint);app.platform.refreshPreflight=async()=>{const latest=await brainPreflight(config);app.platform.dailyPreflightReady=latest.ok;return latest;};
  reports=new Reports({runtime,dir:reportsDir,...(reportModel?{model:reportModel}:inferenceEnabled?{}:{model:async()=>{throw Error('STAGING_INFERENCE_DISABLED');}})});
  app.platform.brainBinding=descriptor(config);app.platform.consultBrainBinding=descriptor(config);app.platform.delegationEnabled=inferenceEnabled;
  app.platform.consultModel=(prompt,options)=>{if(!inferenceEnabled)throw Error('STAGING_INFERENCE_DISABLED');return textInference(prompt,{...options,purpose:'consult',config});};
  const original=app.platform.status.bind(app.platform);app.platform.status=()=>({...original(),version:LOCAL_VERSION,brain:{...descriptor(config),ready:app.platform.dailyPreflightReady&&inferenceEnabled},archived_ids:effectiveArchived(reports.db,runtime),local_unification:{revision:2,reports_enabled:true,schedule:schedule?'23:00 Asia/Taipei':'disabled for isolated verification',automatic_resume:"daily_authorized_only"}});
  const timer=schedule?setInterval(()=>{if(fs.existsSync(path.join(reportsDir,'DISABLED')))return;reports.tick().catch(e=>fs.appendFileSync(path.join(reportsDir,'scheduler-errors.log'),new Date().toISOString()+' '+e.message+'\n'));},15000):null;timer?.unref();
  const close=app.close;app.close=async()=>{if(reports.busy)throw Error('生活報告尚未收尾，未關閉服務。');if(timer)clearInterval(timer);reports.close();await close();};app.server.once('close',()=>{if(timer)clearInterval(timer);reports.close();});
  return {...app,reports};
 }catch(e){await app.close();throw e;}
}
