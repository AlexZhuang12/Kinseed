// Keep heavyweight concurrency at one. Only PDF previews opt into the finite queue;
// ordinary execution/conversion keeps its existing fail-fast behavior.
let active=false;const waiting=[];
export const PREVIEW_QUEUE_LIMITS=Object.freeze({waiting:6,wait_ms:15000});
const cancelled=()=>Error('PDF預覽已取消，沒有開始等待中的工作。');
function pump(){if(active)return;const entry=waiting.shift();if(!entry)return;entry.cleanup();active=true;Promise.resolve().then(()=>{if(entry.signal?.aborted)throw cancelled();return entry.fn();}).then(value=>{active=false;pump();entry.resolve(value);},error=>{active=false;pump();entry.reject(error);});}
export function queuedLocalJob(fn,{signal,waitTimeout=PREVIEW_QUEUE_LIMITS.wait_ms}={}){
 if(signal?.aborted)return Promise.reject(cancelled());
 if(waiting.length>=PREVIEW_QUEUE_LIMITS.waiting)return Promise.reject(Error('PDF預覽佇列已滿，請等目前頁面完成再提出；沒有擴大本機同時工作數。'));
 return new Promise((resolve,reject)=>{let timer;const entry={fn,resolve,reject,signal,cleanup:()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);}};const remove=error=>{const i=waiting.indexOf(entry);if(i<0)return;waiting.splice(i,1);entry.cleanup();reject(error);pump();};const abort=()=>remove(cancelled());signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>remove(Error('PDF預覽等待已到期限，未開始轉換；可稍後重試原頁面，沒有延長生活時間。')),Math.max(1,Math.min(PREVIEW_QUEUE_LIMITS.wait_ms,waitTimeout)));waiting.push(entry);pump();});
}
export async function localJob(fn){
 if(active)throw Error('另一項本機轉換或隔離工作尚未收尾，請稍後再試。');
 active=true;try{return await fn();}finally{active=false;pump();}
}
