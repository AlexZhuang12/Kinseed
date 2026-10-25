import {readLocalized} from '../src/i18n/server.mjs';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {randomBytes,timingSafeEqual} from 'node:crypto';import {spawn} from 'node:child_process';
import {APP_ROOT,loadEnvironment,noLinks} from './environment.mjs';import {setupState,nodeSupported,localModels,inspectChoice,saveChoice,installDependencies,installCodex,codexLoginWindow,configRevision} from './setup-core.mjs';
export async function serveSetup({root=APP_ROOT,port=0,preflight,installDeps=installDependencies,installCLI=installCodex,login=codexLoginWindow,startApp=null}={}){
 loadEnvironment(root);const token=randomBytes(32).toString('hex');let endpoint,busy=false,childApp=null,operation=null;
 const server=http.createServer(async(req,res)=>{const reply=(code,value)=>{res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(value));};
  try{if(req.headers.host!==new URL(endpoint).host)throw Error('連線來源不符，請使用本次導引連結。');if(req.headers.origin&&req.headers.origin!==endpoint)throw Error('只接受本導引頁面的操作。');
   if(req.method==='GET'){const asset=readLocalized(req.url,'setup');if(asset){res.writeHead(200,{'content-type':asset.type,'cache-control':'no-store','referrer-policy':'no-referrer','x-frame-options':'DENY','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"});return res.end(asset.content);}}
   if(req.method==='GET'&&req.url==='/'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','content-security-policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",'x-frame-options':'DENY'});return res.end(fs.readFileSync(path.join(import.meta.dirname,'setup.html')));}
   if(req.method==='GET'&&req.url==='/setup-ui.js'){res.writeHead(200,{'content-type':'text/javascript; charset=utf-8','cache-control':'no-store'});return res.end(fs.readFileSync(path.join(import.meta.dirname,'setup-ui.js')));}
   const a=Buffer.from(req.headers.authorization??''),b=Buffer.from('Bearer '+token);if(a.length!==b.length||!timingSafeEqual(a,b))return reply(401,{error:'這個設定連線已失效或缺少驗證。請重新執行「首次設定.cmd」取得自己的連結。'});
   if(req.method==='GET'&&req.url==='/api/state')return reply(200,{...await setupState(root),busy,operation});
   if(req.method!=='POST')return reply(404,{error:'找不到這個操作。'});let bytes=0;const chunks=[];for await(const c of req){bytes+=c.length;if(bytes>16000)throw Error('設定內容過長，未保存。');chunks.push(c);}const body=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');
   if(busy)throw Error('前一個操作仍在進行，請等待完成，不必重複按鈕。');busy=true;operation={kind:req.url.slice(5),started:Date.now(),state:'running'};
   try{if(!nodeSupported()||process.platform!=='win32')throw Error('請先安裝Windows版Node.js 24.19以上的24系列版本，再重新開啟導引。');
    if(req.url==='/api/models')return reply(200,await localModels(body.endpoint));
    if(req.url==='/api/check')return reply(200,await inspectChoice(root,body.draft,{preflight}));
    if(req.url==='/api/save')return reply(200,await saveChoice(root,body,{preflight}));
    if(req.url==='/api/install')return reply(200,await installDeps(root));
    if(req.url==='/api/install-codex')return reply(200,await installCLI(root,{onProgress:progress=>operation.progress=progress}));
    if(req.url==='/api/login'){if(Object.keys(body).length)throw Error('登入操作不接受密碼或憑證。');return reply(200,await login());}
    if(req.url==='/api/console'){const {readSession}=await import('./development.mjs');const {s}=await readSession(loadEnvironment(root));return reply(200,{url:s.endpoint+'/#'+s.token});}
    if(req.url==='/api/stop-existing'){const {command}=await import('./development.mjs');if(childApp){await childApp.close();childApp=null;}else await command('stop',loadEnvironment(root));return reply(200,{stopped:true,message:'這份副本的控制台已送出停止要求；請重新檢查確認關閉。其他環境未操作。'});}
    if(req.url==='/api/start'){
     if(configRevision(root)!==body.revision)throw Error('設定已變更。請重新讀取並確認後再啟動。');
     const state=await setupState(root);if(!state.dependencies_ok)throw Error('請先完成第1步依賴安裝，再啟動控制台。');const env=loadEnvironment(root);if(fs.existsSync(env.session))throw Error('本副本已有控制台或未確認的連線。請用本副本的開啟／停止入口，避免重複啟動。');
     const {startDevelopment}=await import('./development.mjs');childApp=await (startApp??startDevelopment)(env);return reply(200,{started:true,url:childApp.endpoint+'/#'+childApp.ownerToken,message:'自己的控制台已啟動。新個體仍需批准、出生與生活授權；既有個體只依原每日授權及目前條件運作，不會因啟動而新增授權。'});
    }
    if(req.url==='/api/stop'){if(!childApp)throw Error('這個導引沒有持有控制台，請使用本副本的停止入口。');await childApp.close();childApp=null;return reply(200,{stopped:true,message:'本導引啟動的控制台已關閉，個體資料保留。'});}
    if(req.url==='/api/close'){if(childApp)throw Error('請先在本導引停止自己的控制台，再關閉導引。');reply(200,{closed:true});server.close();return;}
    return reply(404,{error:'找不到這個操作。'});
   }catch(e){operation={...operation,state:'failed',message:e.message};throw e;}finally{busy=false;if(operation?.state==='running')operation.state='finished';}
  }catch(e){reply(400,{error:e instanceof SyntaxError?'設定資料無法讀取。請檢查來源是否完整；既有設定沒有改寫。':e.message});}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});endpoint='http://127.0.0.1:'+server.address().port;
 return {server,endpoint,token,root,async close(){if(childApp){await childApp.close();childApp=null;}await new Promise(resolve=>server.close(resolve));}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===import.meta.filename){const app=await serveSetup();console.log('Kinseed 初次設定：'+app.endpoint+'/#'+app.token+'\n請保留此視窗。設定只作用於這份副本，不會啟動任何個體。');if(!process.argv.includes('--no-open')){const url=app.endpoint+'/#'+app.token;const p=spawn('powershell.exe',['-NoProfile','-Command',"Start-Process '"+url+"'"],{windowsHide:true,stdio:'ignore'});p.on('error',()=>console.log('瀏覽器未開啟，請手動使用上方連結。'));}let closing=false;const close=async()=>{if(closing)return;closing=true;await app.close();process.exit(0);};process.on('SIGINT',close);process.on('SIGTERM',close);app.server.on('close',()=>process.exit(0));}
