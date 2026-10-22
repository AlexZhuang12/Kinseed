import {parentPort,workerData} from 'node:worker_threads';
import {newQuickJSWASMModule} from 'quickjs-emscripten';
// Guest code runs ONLY inside QuickJS/WASM. Never eval it in Node or expose a
// host function, object, environment, file descriptor, module loader or fetch.
let runtime,context,interrupted=false;
try {
 const wasm=await newQuickJSWASMModule();runtime=wasm.newRuntime();
 runtime.setMemoryLimit(16*1024*1024);runtime.setMaxStackSize(256*1024);
 runtime.setInterruptHandler(()=>{if(Date.now()>=workerData.deadline)interrupted=true;return interrupted;});
 context=runtime.newContext();
 const source=`(()=>{const stringify=JSON.stringify;const input=JSON.parse(${JSON.stringify(JSON.stringify(workerData.inputs))});const value=(function(input){"use strict";\n${workerData.code}\n})(input);if(value&&typeof value.then==='function')throw new Error('請回傳同步JSON結果，第一版尚不執行非同步工作。');const text=stringify(value);if(typeof text!=='string')throw new Error('請使用return回傳可保存的JSON結果。');if(text.length>32000)throw new Error('結果超過32000字元，請縮小本次輸出。');return text;})()`;
 const result=context.evalCode(source,'individual-work.js');
 if(result.error){let message='程式執行失敗';try{const error=context.dump(result.error);message=String(error?.message??error).slice(0,1500);}finally{result.error.dispose();}const explanation=interrupted?'程式到達本次時間界線，已停止；可縮小工作後再執行。':/out of memory/i.test(message)?'程式回報記憶體不足；可減少一次處理的資料或改為分批。':'程式未完成：'+message+'。原作品保留，可修改程式後另開新工作。';parentPort.postMessage({ok:false,error:explanation,diagnostic:message,timed_out:interrupted});}
 else {const text=context.getString(result.value);result.value.dispose();parentPort.postMessage({ok:true,text});}
}catch(err){parentPort.postMessage({ok:false,error:String(err.message).slice(0,1500)});}
finally{try{context?.dispose();runtime?.dispose();}catch{}}
