// Source distribution differs from npm pack: npm deliberately omits package-lock.json.
import fs from 'node:fs';import path from 'node:path';import {randomUUID,createHash} from 'node:crypto';import {APP_ROOT,beneath,noLinks} from './environment.mjs';import {reviewRelease} from './release-check.mjs';
export function exportSource(root=APP_ROOT,destination=path.join(root,'.private/exports/kinseed-windows-'+randomUUID())){
 const boundary=reviewRelease(root);if(boundary.status!=='PASS')throw Error('來源邊界或秘密形狀檢查未通過，不建立安裝包。');const privateRoot=path.join(root,'.private');noLinks(root,privateRoot);if(!beneath(privateRoot,path.resolve(destination)))throw Error('來源輸出必須留在這份副本自己的.private內。');noLinks(root,destination);if(fs.existsSync(destination))throw Error('輸出資料夾已存在，不合併或覆寫。');
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'))),files=new Set(['package.json','package-lock.json','README.md','.gitignore','.gitattributes']);
 function walk(rel){const file=path.join(root,rel);noLinks(root,file);const info=fs.lstatSync(file);if(info.isSymbolicLink())throw Error('來源含連結，未匯出。');if(info.isDirectory())for(const e of fs.readdirSync(file))walk(path.join(rel,e));else files.add(rel.replaceAll('\\','/'));}
 for(const rel of pkg.files){if(typeof rel!=='string'||path.isAbsolute(rel)||rel.split(/[\\/]/).includes('..')||rel.startsWith('.private')||rel.includes('node_modules'))throw Error('來源清單含不允許的位置。');walk(rel.replace(/[\\/]$/,''));}
 for(const file of files)if(/(?:^|\/)(?:\.private|node_modules|runtime_v1_2|runtime_reports)(?:\/|$)|\.sqlite|\.jsonl$|(?:development|formal-brain)\.local\.json/.test(file))throw Error('來源包含私人檔案，未匯出。');
 fs.mkdirSync(destination,{recursive:true});const manifest={};for(const rel of [...files].sort()){noLinks(root,path.join(root,rel));const bytes=fs.readFileSync(path.join(root,rel)),target=path.join(destination,rel);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes,{flag:'wx'});manifest[rel]=createHash('sha256').update(bytes).digest('hex');}return {destination,files:manifest,count:Object.keys(manifest).length,lockfile_included:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===import.meta.filename)console.log(JSON.stringify(exportSource(),null,2));

