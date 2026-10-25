import fs from'node:fs';import path from'node:path';
const locales=['zh-Hant','zh-Hans','en','ja'],root=path.join(import.meta.dirname,'generated');
export function localizedAsset(requestUrl,mode='owner'){
 const url=new URL(requestUrl,'http://127.0.0.1');if(url.pathname==='/'){const lang=locales.includes(url.searchParams.get('lang'))?url.searchParams.get('lang'):'zh-Hant';return {file:path.join(root,lang,mode==='setup'?'setup.html':'owner.html'),type:'text/html; charset=utf-8'};}
 const m=url.pathname.match(/^\/(ui|i18n)\/(zh-Hant|zh-Hans|en|ja)\/([a-z-]+\.js)$/);if(!m)return null;const names=mode==='setup'?['setup-ui.js']:['builder-ui.js','console-ui.js','journey-ui.js','wizard-ui.js','network-ui.js','report-ui.js'];if(m[1]==='i18n'&&m[3]!=='runtime.js'||m[1]==='ui'&&!names.includes(m[3]))return null;return {file:path.join(root,m[2],m[3]),type:'text/javascript; charset=utf-8'};
}
export function readLocalized(requestUrl,mode){const asset=localizedAsset(requestUrl,mode);return asset?{...asset,content:fs.readFileSync(asset.file)}:null;}
