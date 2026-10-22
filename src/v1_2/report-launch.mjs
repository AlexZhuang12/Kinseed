import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';
export function ensureReportService(root){
 const dir=path.join(root,'runtime_reports'),file=path.join(dir,'service.json');if(fs.existsSync(path.join(dir,'DISABLED')))return {disabled:true};if(fs.existsSync(file)){try{const previous=JSON.parse(fs.readFileSync(file));if(Number.isInteger(previous.pid)&&previous.endpoint==='http://127.0.0.1:47431'){process.kill(previous.pid,0);return {already_running:true};}}catch{}}
 fs.mkdirSync(dir,{recursive:true});const out=fs.openSync(path.join(dir,'startup.log'),'a'),err=fs.openSync(path.join(dir,'startup-error.log'),'a');try{const child=spawn(process.execPath,[path.join(root,'src/v1_2/report-main.mjs')],{cwd:root,windowsHide:true,detached:true,stdio:['ignore',out,err]});child.on('error',()=>{});child.unref();return {starting:true};}finally{fs.closeSync(out);fs.closeSync(err);}
}
