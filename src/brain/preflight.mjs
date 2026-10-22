import {spawnSync} from 'node:child_process';
import {resolveCodex} from '../runtime-binary.mjs';
import {safeEnv} from './codex-policy.mjs';
import {descriptor} from './contract.mjs';
import {inspectLocalModel} from './local-http.mjs';
export function codexLoginProblem(r){
 const text=(r.stdout??'')+(r.stderr??'');
 if(r.error?.code==='ETIMEDOUT'||r.signal==='SIGTERM')return '登入檢查逾時。請稍後重新檢查，不必重新登入或重建個體。';
 if(/could not find home directory|home directory.*(?:not|unavailable)/i.test(text))return '無法取得目前使用者的資料夾。請從一般Windows使用者環境執行本副本「首次設定.cmd」後重新檢查；這不代表帳號尚未登入。';
 if(['EACCES','EPERM'].includes(r.error?.code)||/access is denied|permission denied/i.test(text))return '目前程式無法讀取Codex登入狀態。請確認使用同一個Windows使用者開啟首次設定，勿停用安全防護或重複登入。';
 if(r.status===0&&/ChatGPT/i.test(text))return null;
 if(/not logged in|please log in|no credentials/i.test(text))return '尚未登入Codex。請在首次設定按「開啟登入視窗」，自行完成登入後再檢查。';
 if(r.status===0)return '目前登入方式不是此版本支援的ChatGPT登入。請先核對帳號模式；系統不會代你切換或登出。';
 return 'Codex登入狀態尚未確認。請先重新檢查版本與登入；這不是模型容量檢查，也不需要重建個體。';
}
export async function brainPreflight(config){const brain=descriptor(config),result={ok:false,brain,checked_at:new Date().toISOString(),inference_access:'not_yet_verified'};if(!brain.enabled)return {...result,error:'大腦接頭未啟用；開發資料保留，不會開始生活。'};
 if(config.adapter==='ollama-local'){try{const model=await inspectLocalModel(config);return {...result,ok:true,local_model:model,message:'本機模型協定預檢通過；真實推理、容量與工具可靠度尚待實測。'};}catch(e){return {...result,error:'本地模型尚未就緒：'+e.message};}}
 try{if(process.platform!=='win32'||Number(process.versions.node.split('.')[0])!==24)throw Error('需要Windows與Node.js 24。');const binary=resolveCodex(),r=spawnSync(binary,['login','status'],{env:safeEnv(),encoding:'utf8',windowsHide:true,timeout:10000,stdio:['ignore','pipe','pipe']});const problem=codexLoginProblem(r);if(problem)throw Error(problem);return {...result,ok:true,cli_version:'0.163.0-alpha.10.2',authentication:'existing ChatGPT login',message:'接頭與登入預檢通過；即時模型容量仍以實際工作結果為準。'};}catch(e){return {...result,error:'Codex接頭預檢未通過：'+e.message};}
}
