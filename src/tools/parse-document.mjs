import path from 'node:path';import {spawn} from 'node:child_process';import {boundedBrowserExecutable} from './browser-job.mjs';import {localJob} from './resource-gate.mjs';
export const parseDocument=(bytes,ext,{signal,timeout=20000}={})=>localJob(()=>new Promise((resolve,reject)=>{
 if(signal?.aborted)return reject(Error('文件解析已取消，未開始工作。'));
 const child=spawn(boundedBrowserExecutable(),[path.join(import.meta.dirname,'parse-document-child.mjs')],{windowsHide:true,env:{...Object.fromEntries(['SystemRoot','WINDIR','TEMP','TMP','PATH'].filter(k=>process.env[k]).map(k=>[k,process.env[k]])),KINSEED_REAL_CHROME:process.execPath},stdio:['pipe','pipe','pipe']});
 let out='',error='',stopped=false;const stop=()=>{stopped=true;child.kill();},timer=setTimeout(stop,Math.max(1,Math.min(20000,timeout)));const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',stop);};signal?.addEventListener('abort',stop,{once:true});if(signal?.aborted)stop();
 child.stdout.on('data',c=>{out+=c;if(out.length>7000000)stop();});child.stderr.on('data',c=>error=(error+c).slice(0,1500));child.once('error',err=>{cleanup();reject(err);});
 child.once('close',code=>{cleanup();if(stopped||signal?.aborted)return reject(Error('文件解析已取消或逾時，自己的工作程序已確認關閉。'));if(code!==0)return reject(Error('文件解析未完成，已關閉自己的工作程序：'+error));try{resolve(JSON.parse(out));}catch{reject(Error('文件解析結果不完整。'));}});
 child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify({data:bytes.toString('base64'),ext}));
}));
