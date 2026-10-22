import {spawn} from 'node:child_process';
import readline from 'node:readline';
import path from 'node:path';
import fs from 'node:fs';
export const PROJECT=path.resolve(import.meta.dirname,'..');
export function codexArgs(cwd){
 const args=['--no-daemon','exec','--ignore-user-config','--ignore-rules','--skip-git-repo-check','--ephemeral','--sandbox','read-only','--json','-C',cwd];
 for(const name of ['shell_tool','apps','plugins','multi_agent','browser_use','browser_use_external','computer_use','image_generation','view_image','memories','workspace_dependencies','goals','skill_search','remote_plugin','skill_mcp_dependency_install','unbounded_connection_retries'])args.push('-c',`features.${name}=false`);
 args.push('-c','features.code_mode_host=true','-c','project_doc_max_bytes=0','-c','web_search="disabled"','-c','hide_agent_reasoning=true');
 args.push('-c',`mcp_servers.kinseed.command=${JSON.stringify(process.execPath)}`,'-c',`mcp_servers.kinseed.args=${JSON.stringify([path.join(PROJECT,'src','mcp.mjs')])}`,'-c','mcp_servers.kinseed.env_vars=["KINSEED_CYCLE_TOKEN","KINSEED_ENDPOINT"]','-c','mcp_servers.kinseed.required=true','-c','mcp_servers.kinseed.tool_timeout_sec=8');
 return args;
}
export function safeEnv(extra={}){const allowed=['PATH','SystemRoot','WINDIR','USERPROFILE','HOMEDRIVE','HOMEPATH','LOCALAPPDATA','APPDATA','TEMP','TMP'];return {...Object.fromEntries(allowed.filter(k=>process.env[k]).map(k=>[k,process.env[k]])),...extra};}
export function makeRunner({endpoint,cwd,evidenceDir,prompt=null}){
 fs.mkdirSync(cwd,{recursive:true});fs.mkdirSync(evidenceDir,{recursive:true});
 return ({lease,token,controller,task})=>new Promise((resolve)=>{
  const args=codexArgs(cwd),events=[];let bytes=0,errorText='',cancelled=false,ended=false,turnCompleted=false,killTimer;
  const child=spawn('codex.exe',[...args,'-'],{windowsHide:true,env:safeEnv({KINSEED_ENDPOINT:endpoint,KINSEED_CYCLE_TOKEN:token}),stdio:['pipe','pipe','pipe']});task.child=child;
  child.once('spawn',()=>controller.registerTask(lease.cycle_id,child.pid));
  const file=path.join(evidenceDir,lease.cycle_id+'.jsonl');
  const record=e=>{fs.appendFileSync(file,JSON.stringify({observed_at:new Date().toISOString(),...e})+'\n');};
  record({type:'invocation',cycle_id:lease.cycle_id,run_id:lease.run_id,args,transport:'MCP stdio → scoped loopback broker',source:lease.source});
  const cancel=()=>{if(ended||cancelled)return;cancelled=true;
   // Only this spawned process tree. No global process-name matching.
   if(process.platform==='win32'&&child.pid){const killer=spawn('taskkill.exe',['/PID',String(child.pid),'/T','/F'],{windowsHide:true});killer.on('error',()=>child.kill());}
   else child.kill('SIGTERM');
   killTimer=setTimeout(()=>{if(!ended)child.kill('SIGKILL');},3000);killTimer.unref();
  };task.cancel=cancel;
  const timeout=setTimeout(cancel,Math.max(1,lease.deadline-Date.now()));
  const reader=readline.createInterface({input:child.stdout});reader.on('line',line=>{
   bytes+=Buffer.byteLength(line);if(bytes>262144){cancel();return;}
   try{const e=JSON.parse(line);if(e.item?.type==='reasoning'||e.type?.includes('reasoning'))return;
    if(e.type==='thread.started')controller.session(lease.cycle_id,e.thread_id);
    if(e.type==='turn.completed')turnCompleted=true;
    events.push(e);record(e);
   }catch(e){record({type:'parse_error',error:e.message});}
  });
  child.stderr.on('data',chunk=>{bytes+=chunk.length;if(bytes>262144){cancel();return;}errorText=(errorText+chunk.toString()).slice(-4000);});
  const finish=(code,signal,spawnError)=>{if(ended)return;ended=true;clearTimeout(timeout);clearTimeout(killTimer);const r={ok:code===0&&turnCompleted&&!cancelled,cancelled,pid:child.pid??null,exit_code:code,signal,error:spawnError??(code===0?null:errorText),remote_result:turnCompleted?'turn_completed':'unknown',evidence:path.relative(PROJECT,file),usage:events.find(e=>e.type==='turn.completed')?.usage??null};record({type:'process.exit',...r});resolve(r);};
  child.on('error',e=>finish(null,null,e.message));child.on('exit',(code,signal)=>finish(code,signal));
  child.stdin.on('error',()=>{});
  child.stdin.end(prompt??`你是 kinseed 測試個體，非正式 Kinseed 個體。這是新 Codex Session，沒有其他對話經驗。只使用 kinseed MCP 工具進行低風險本地筆記活動。首先呼叫 get_context，讀取身份、完整有效授權、前輪記憶和計畫。不讀專案或個人檔案，不執行 shell，不呼叫外部服務。自主選一項有用的觀察筆記活動，必要時 query_history 或 read_workspace 核對來源，再 write_note 保存成果，最後 commit_cycle（expected_version 取自 get_context 的 a.version），留下簡短可公開結果、記憶與下一步計畫。記憶內容與計畫由你依本輪成果決定，保留前輪值得續接的資訊。前三輪可選 continue，之後選 wait 並合理安排 60000ms 以上間隔；若無有用活動可等待。不得將休眠說成持續思考。commit_cycle 後即結束，不再使用工具。成本未知。只輸出可公開的簡短理由，勿輸出內部推理。`);
 });
}
