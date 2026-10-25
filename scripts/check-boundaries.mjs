import fs from 'node:fs';
import path from 'node:path';
import {APP_ROOT} from './environment.mjs';
export function inspectBoundaries(root=APP_ROOT){
 const problems=[],allowed=new Set(['src','scripts','config','docs','tests','packages','package.json','package-lock.json','README.md','AGENTS.md','LICENSE','NOTICE','SECURITY.md','SUPPORT.md','CONTRIBUTING.md','CODE_OF_CONDUCT.md','CHANGELOG.md','.github','.gitignore','.gitattributes','.kinseed-development.json','source-baseline.json','data-boundaries.json','啟動開發控制台.cmd','停止開發控制台.cmd','開啟開發控制台.cmd','檢查開發環境.cmd','首次設定.cmd','啟動控制台.cmd','開啟控制台.cmd','關閉控制台.cmd','檢查環境.cmd']);
 const privateNames=new RegExp(['b09'+'89','kinseed-'+'amous-001','kinseed-'+'080b5230','莊一'+'新','Am'+'ous'].join('|'));
 function inspect(file){const rel=path.relative(root,file).replaceAll('\\','/'),name=path.basename(file);if(/\.(sqlite(?:-wal|-shm)?|db|jsonl|pem|key)$/i.test(file)||/owner-session\.json|service\.json|individual-options\.json|\.env(?:\.|$)/i.test(name))problems.push(rel+':私人檔案不應出現在來源區');if(/\.(mjs|js|json|md|html|cmd|yml|yaml|txt)$/.test(file)&&privateNames.test(fs.readFileSync(file,'utf8')))problems.push(rel+':含原Owner或正式個體識別');}
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name),rel=path.relative(root,file).replaceAll('\\','/');if(entry.isSymbolicLink()){problems.push(rel+':連結不允許');continue;}if(entry.isDirectory())walk(file);else inspect(file);}}
 for(const entry of fs.readdirSync(root,{withFileTypes:true})){if(['.private','node_modules','.git'].includes(entry.name))continue;if(!allowed.has(entry.name))problems.push(entry.name+':未列入來源邊界');const file=path.join(root,entry.name);if(entry.isSymbolicLink())problems.push(entry.name+':連結不允許');else if(entry.isDirectory())walk(file);else inspect(file);}
 for(const file of ['src/main.mjs','src/v1_1/main.mjs','src/v1_2/main.mjs','src/v1_2/report-main.mjs'])if(!fs.readFileSync(path.join(root,file),'utf8').startsWith('throw Error('))problems.push(file+':舊入口未停用');
 const result={status:problems.length?'FAIL':'PASS',scope:'開發來源區靜態邊界檢查，排除私人資料與依賴；不是完整秘密掃描或OS沙箱',problems};return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename)){const r=inspectBoundaries();console.log(JSON.stringify(r,null,2));if(r.status!=='PASS')process.exitCode=2;}


