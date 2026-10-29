import {TurnAuthority} from '../brain/app-server/turn-authority.mjs';
import {ManagedAppServer} from '../brain/app-server/managed-runtime.mjs';
import {PlatformBackground} from '../brain/app-server/platform-background.mjs';
import {equalSecret} from '../controller.mjs';
import {bindOwnedLifeEndpoint} from '../brain/endpoint-scope.mjs';
import {LOCAL_VERSION} from './local-version.mjs';
import {readLocalized} from '../i18n/server.mjs';
import fs from 'node:fs';import path from 'node:path';
import {serve,lifePrompt} from './server.mjs';import {Reports} from './reports.mjs';import {effectiveArchived} from './individual-options.mjs';import {reportRoutes} from './unified-reports.mjs';
import {lifeRunner,textInference} from '../brain/runtime.mjs';import {DEFAULT_BRAIN,descriptor} from '../brain/contract.mjs';import {brainPreflight} from '../brain/preflight.mjs';
export async function startUnified({runtime,reportsDir,port=62372,engineering=false,schedule=true,preflightOverride,runnerFactory,reportModel,inferenceEnabled=true,brainConfig=null,timezone='Asia/Taipei',reportOptions={},clock,delegationEnabled=inferenceEnabled,appServerOptions={},backgroundOptions=null,brainOptions={},productionBinding=false}={}){
 let app,reports,background;const authority=productionBinding?new TurnAuthority({platform:()=>app?.platform,reports:()=>reports}):null;
 const config=brainConfig??{...DEFAULT_BRAIN,enabled:inferenceEnabled};const manager=config.adapter==='codex-app-server'?new ManagedAppServer({base:path.join(runtime,'app-server-runtime'),...appServerOptions,...(authority?{production:true,turnAuthority:authority}:{})}):null;const adapterOptions={...brainOptions,...(manager?{appServerManager:manager}:{})};const preflight=preflightOverride??await brainPreflight(config,{candidateRuntime:manager});
 const reportHandler=reportRoutes(()=>reports,runtime,()=>app.endpoint);
 const handler=async(req,res,context)=>{if(new URL(req.url,'http://127.0.0.1').pathname==='/owner/app-server/status'){if(!equalSecret(req.headers.authorization?.replace(/^Bearer /,''),context.ownerToken)){context.json(401,{error:'OWNER_AUTH_REQUIRED'});return true;}if(req.method!=='GET'){context.json(405,{error:'METHOD_NOT_ALLOWED'});return true;}context.json(200,{runtime:manager?.status()??null,background:background?.status()??null});return true;}if(req.method==='GET'&&new URL(req.url,'http://127.0.0.1').pathname==='/'){
  const asset=readLocalized(req.url,'owner'),version=LOCAL_VERSION+(engineering?' [SYNTHETIC]':'');
  const html=asset.content.toString('utf8').replace(/<title>[^<]*<\/title>/,'<title>Kinseed '+version+'</title>').replace(/(<header><h1>Kinseed <small[^>]*>)[^<]*(<\/small>)/,'$1'+version+'$2');
  res.writeHead(200,{'Content-Type':asset.type,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-src 'self' blob:; img-src 'self' blob: data:; media-src 'self' blob: data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"});res.end(html);return true;
 }return reportHandler(req,res,context);};
 try{app=await serve({dir:runtime,port,engineering,timezone,clock,preflight,ownerExtension:handler,runnerFactory:runnerFactory??(e=>app.platform.dailyPreflightReady?lifeRunner({endpoint:app.endpoint,base:e.store.dir,cwd:path.join(e.store.dir,'life'),evidenceDir:path.join(e.store.dir,'brain-evidence'),prompt:lifePrompt,config,adapterOptions}):async()=>{throw Error('PREFLIGHT_BLOCKED');})});}catch(error){await manager?.close();throw error;}
 try{
  if(manager&&productionBinding)app.platform.prepareLife=e=>manager.prepareLife(e);
  bindOwnedLifeEndpoint(app.platform,app.endpoint);app.platform.refreshPreflight=async()=>{const latest=await brainPreflight(config,{candidateRuntime:manager});app.platform.dailyPreflightReady=latest.ok;return latest;};
  reports=new Reports({runtime,dir:reportsDir,timezone,...(clock?{now:clock}:{}),...reportOptions,brain:descriptor(config),ready:()=>!!config.enabled&&app.platform.dailyPreflightReady,model:reportModel??((prompt,options)=>{if(!config.enabled||!app.platform.dailyPreflightReady)throw Error('REPORT_BRAIN_UNAVAILABLE');return textInference(prompt,{...options,config,adapterOptions,...(authority?{dispatch_proof:authority.report(options.call_id,prompt)}:{})});})});
  if(backgroundOptions||manager||fs.existsSync(path.join(runtime,'app-server-background'))){background=new PlatformBackground(app.platform,{...backgroundOptions});app.platform.backgroundService=background;}app.platform.beforeStoreClose=async()=>{await manager?.close();await background?.close();};
  app.platform.brainBinding=descriptor(config);app.platform.consultBrainBinding=descriptor(config);app.platform.delegationEnabled=delegationEnabled;app.platform.toolBrainEndpoint=config.endpoint??config.baseUrl??null;
  app.platform.consultModel=(prompt,options)=>{if(!inferenceEnabled||!app.platform.dailyPreflightReady)throw Error('STAGING_INFERENCE_DISABLED');return textInference(prompt,{...options,purpose:'consult',config,adapterOptions,...(authority?{dispatch_proof:authority.consult(options.call_id,prompt)}:{})});};
  const original=app.platform.status.bind(app.platform);app.platform.status=()=>({...original(),version:LOCAL_VERSION,brain:{...descriptor(config),ready:app.platform.dailyPreflightReady&&inferenceEnabled},app_server:manager?.status()??null,background_jobs:background?.status()??null,archived_ids:effectiveArchived(reports.db,runtime),local_unification:{revision:2,reports_enabled:true,schedule:reports.settings(),automatic_resume:"daily_authorized_only"}});
  const timer=schedule?setInterval(()=>{if(fs.existsSync(path.join(reportsDir,'DISABLED')))return;reports.tick().catch(e=>fs.appendFileSync(path.join(reportsDir,'scheduler-errors.log'),new Date().toISOString()+' '+e.message+'\n'));},15000):null;timer?.unref();
  app.platform.assertCanShutdown=()=>{if(reports.active())throw Error('生活報告尚未收尾，未關閉服務。');};
  const close=app.close;app.close=async()=>{if(reports.closed){await close();return;}if(reports.active())throw Error('生活報告尚未收尾，未關閉服務。');if(timer)clearInterval(timer);await close();reports.close();};app.server.once('close',()=>{if(timer)clearInterval(timer);reports.close();});
  return {...app,reports,brainRuntime:manager,backgroundService:background};
 }catch(e){try{await app.close();}finally{await manager?.close();await background?.close();}throw e;}
}
