import {Worker} from 'node:worker_threads';
export const EXECUTION_LIMITS=Object.freeze({milliseconds:5000,memory_bytes:16*1024*1024,stack_bytes:256*1024,input_bytes:262144,output_chars:32000,source_chars:64000,workspace_bytes:10*1024*1024});
export function executeJavascript({code,inputs=[],signal,timeout=5000,onUnconfirmed=()=>{},createWorker=(url,options)=>new Worker(url,options)}){
 if(typeof code!=='string'||code.length>64000||Buffer.byteLength(JSON.stringify(inputs))>262144)throw Error('本次程式或輸入資料超過工作範圍。');
 const duration=Math.max(1,Math.min(5000,timeout));
 return new Promise(resolve=>{const worker=createWorker(new URL('./javascript-worker.mjs',import.meta.url),{execArgv:[],workerData:{code,inputs,deadline:Date.now()+duration},resourceLimits:{maxOldGenerationSizeMb:64,maxYoungGenerationSizeMb:16,stackSizeMb:4}});let ending=false;
  const finish=async result=>{if(ending)return;ending=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);try{await worker.terminate();}catch(err){try{onUnconfirmed(err);}catch{}return;}resolve({...result,cleanup_confirmed:true});};
  const cancel=()=>finish({ok:false,cancelled:true,error:'本次工作已取消，沒有延長生活或保存為成功成果。'});
  const timer=setTimeout(()=>finish({ok:false,timed_out:true,error:'程式超過5秒或本輪剩餘時間，已停止；可縮小工作後另行執行。'}),duration);
  worker.once('message',r=>{if(!r||typeof r.ok!=='boolean'||r.ok&&(typeof r.text!=='string'||r.text.length>32000))return finish({ok:false,error:'解析結果不符合輸出範圍，未登記成果。'});finish(r);});
  worker.once('error',err=>finish({ok:false,error:'隔離工作執行失敗：'+String(err.message).slice(0,1500)}));
  worker.once('exit',code=>{if(!ending)finish({ok:false,error:'隔離工作提早結束，沒有確認成功結果。',exit_code:code});});
  signal?.addEventListener('abort',cancel,{once:true});if(signal?.aborted)cancel();
 });
}
