// Read-only resource snapshot. Does not contact, install, load or stop a model.
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
export function assessResources(snapshot){
 const valid=n=>Number.isFinite(n)&&n>=0;
 if(!snapshot||!valid(snapshot.total_memory_bytes)||!valid(snapshot.free_memory_bytes)||snapshot.free_memory_bytes>snapshot.total_memory_bytes)throw Error('記憶體盤點資料不正確。');
 const recommendedFree=6*1024**3;
 return {status:snapshot.free_memory_bytes>=recommendedFree?'headroom_available':'defer_model_load',
  recommended_free_bytes:recommendedFree,
  recommendation:snapshot.free_memory_bytes>=recommendedFree?'可進行單一小模型的受控實測；仍須量測實際記憶體、速度與工具正確性。':'建議暫緩載入本地模型；等待其他工作結束或由Owner關閉不需要的程式，再重新盤點。',
  threshold_note:'6 GiB是這次共機小模型測試的保守餘裕建議，不是模型官方最低需求，也不是工具權限限制。',
  inference_verified:false,automatic_action:false};
}
export function resourceSnapshot(root=path.resolve(import.meta.dirname,'..')){
 const cpus=os.cpus(),disk=fs.statfsSync(root,{bigint:true});
 return {schema:1,checked_at:new Date().toISOString(),platform:os.platform(),architecture:os.arch(),
  cpu_model:cpus[0]?.model??null,logical_processors:cpus.length,
  total_memory_bytes:os.totalmem(),free_memory_bytes:os.freemem(),
  disk_total_bytes:Number(disk.blocks*disk.bsize),disk_available_bytes:Number(disk.bavail*disk.bsize),
  gpu:'not_probed_by_this_script',note:'不收集主機名稱、序號、帳號、網路介面或個體資料；GPU另由Windows唯讀盤點確認。'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const snapshot=resourceSnapshot();console.log(JSON.stringify({snapshot,assessment:assessResources(snapshot)},null,2));}
