import {validTimezone} from '../src/timezone.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {brainSettings,DEFAULT_BRAIN} from '../src/brain/contract.mjs';
export const APP_ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const beneath=(parent,child)=>{const r=path.relative(parent,child);return r!==''&&!r.startsWith('..'+path.sep)&&r!=='..'&&!path.isAbsolute(r);};
function exact(o,keys,label){if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).length!==keys.length||keys.some(k=>!Object.hasOwn(o,k)))throw Error(label+'欄位不正確；請依範例設定，不加入憑證或其他欄位。');}
export function noLinks(root,target){
 const resolved=path.resolve(target);if(resolved!==root&&!beneath(root,resolved))throw Error('路徑超出開發環境。');
 let p=resolved;while(true){if(fs.lstatSync(p,{throwIfNoEntry:false})?.isSymbolicLink())throw Error('開發路徑不能使用符號連結或junction。');if(p===root)break;p=path.dirname(p);}
}
export function loadEnvironment(root=APP_ROOT,config='config/development.local.json'){
 const markerFile=path.join(root,'.kinseed-development.json');noLinks(root,markerFile);const marker=JSON.parse(fs.readFileSync(markerFile));if(marker.kind!=='kinseed-isolated-development'||marker.schema!==1)throw Error('缺少獨立開發環境標記。');
 if(config!=='config/development.local.json'&&config!=='config/development.example.json')throw Error('只能使用本開發環境的設定檔。');
 let file=path.resolve(root,config);noLinks(root,file);if(!fs.existsSync(file)&&config.endsWith('local.json'))file=path.join(root,'config/development.example.json');
 const c=JSON.parse(fs.readFileSync(file));exact(c,['version','environment','dataDirectory','http','reports','inference',...(Object.hasOwn(c,'tools')?['tools']:[]),...(Object.hasOwn(c,'timezone')?['timezone']:[])],'設定');exact(c.http,['host','port'],'控制台');exact(c.reports,['enabled'],'報告');
 if(Object.hasOwn(c,'tools')){exact(c.tools,['codex'],'工具');exact(c.tools.codex,['enabled'],'Codex工具');if(typeof c.tools.codex.enabled!=='boolean')throw Error('Codex工具接頭須明確選擇開啟或關閉。');}
 if(![1,2,3].includes(c.version)||c.environment!=='development')throw Error('這個入口只接受第1至3版development設定。');
 if(typeof c.dataDirectory!=='string'||!/^\.private\/[a-z0-9][a-z0-9-]{0,47}$/.test(c.dataDirectory))throw Error('私人資料位置必須是 .private/名稱，不能指向正式runtime或外部路徑。');
 if(c.http.host!=='127.0.0.1'||!Number.isInteger(c.http.port)||c.http.port<0||c.http.port>65535||[47429,47430,47431,62372].includes(c.http.port))throw Error('只允許本機位址與獨立埠號，不能使用正式控制器或報告服務的埠。');
 if(typeof c.reports.enabled!=='boolean')throw Error('報告排程須明確選擇開啟或關閉。');
 let brain;if(c.version===1){exact(c.inference,['enabled'],'模型');if(c.inference.enabled!==false)throw Error('第1版設定不啟用模型。');brain={...DEFAULT_BRAIN};}else {brain=brainSettings(c.inference);if(c.version===2&&brain.adapter!=='codex-cli'||c.version===3&&brain.adapter!=='ollama-local')throw Error('設定版本與大腦接頭不符。');}
 if(Object.hasOwn(c,'timezone'))validTimezone(c.timezone);
 const home=path.resolve(root,c.dataDirectory);noLinks(root,home);
 for(const name of ['runtime','reports','logs','session.json','instance.json'])noLinks(root,path.join(home,name));
 return {root,file,config:c,brain,home,runtime:path.join(home,'runtime'),reports:path.join(home,'reports'),logs:path.join(home,'logs'),session:path.join(home,'session.json')};
}
export function claimEnvironment(env){
 noLinks(env.root,env.home);const file=path.join(env.home,'instance.json');
 if(fs.existsSync(env.home)){const entries=fs.readdirSync(env.home);if(entries.length&&!fs.existsSync(file))throw Error('資料夾已有內容但沒有開發標記；不接管或遷移。');}
 if(fs.existsSync(file)){const v=JSON.parse(fs.readFileSync(file));if(v.kind!=='kinseed-development-data'||v.schema!==1)throw Error('不是本開發版的私人資料。');}
 fs.mkdirSync(env.home,{recursive:true});if(!fs.existsSync(file))fs.writeFileSync(file,JSON.stringify({schema:1,kind:'kinseed-development-data',created_at:new Date().toISOString()},null,2),{flag:'wx'});
 for(const name of ['runtime','reports','logs']){noLinks(env.root,path.join(env.home,name));fs.mkdirSync(path.join(env.home,name),{recursive:true});}
 return env;
}
