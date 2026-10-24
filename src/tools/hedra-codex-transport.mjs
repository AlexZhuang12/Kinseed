import {spawn} from 'node:child_process';
import readline from 'node:readline';
import {resolveCodex} from '../runtime-binary.mjs';
import {safeEnv} from '../brain/codex-policy.mjs';
export function hedraFailure(value){const raw=typeof value==='string'?value:JSON.stringify(value??{});if(/401|unauthenticated|unauthorized|invalid_token|token.expired|login.required/i.test(raw))return Error('Hedra登入授權已失效或被拒絕，請重新連接；目前不能讀取或提交。');if(/402|insufficient.credits|insufficient.balance|subscription.expired|subscription.required/i.test(raw))return Error('Hedra拒絕使用：點數或帳戶使用資格不足，請到Hedra核對餘額與訂閱狀態。');if(/403|forbidden|permission.denied/i.test(raw))return Error('Hedra拒絕存取，請核對帳戶、工作區與服務權限；無法單憑此回應判定訂閱是否過期。');if(/429|rate.limit/i.test(raw))return Error('Hedra暫時限制請求頻率，請稍後再試；不會自動重新生成。');if(/503|502|504|service.unavailable|timeout|timed.out|network|fetch failed/i.test(raw))return Error('暫時無法連上Hedra或服務逾時，請稍後重新檢查；不是已確認的訂閱失效。');return Error('Hedra未提供可核對的成功結果；請檢查連線狀態，不能據此判定訂閱是否過期。');}
const READ=new Set(['get_balance','list_workspaces','estimate','get_model','get_generations']);
const WRITE=new Set(['generate_image','generate_video','generate_music']);
// No model turns, credential export, arbitrary tools or account management.
export async function hedraSession(fn,{binary=resolveCodex(),timeout=35000,signal,paid=false}={}){
 if(signal?.aborted)throw Error('Hedra連線已取消。');
 const child=spawn(binary,['app-server','--stdio'],{windowsHide:true,env:safeEnv(),stdio:['pipe','pipe','pipe']});
 const pending=new Map();let id=0,total=0,closed=false;let finish;const done=new Promise(r=>finish=r);
 const fail=e=>{for(const q of pending.values())q.reject(e);pending.clear();};
 child.stdin.on('error',()=>fail(Error('Hedra連線已中斷；不自動重新提交。')));
 child.once('error',()=>{fail(Error('Codex接頭無法啟動。'));finish();});
 child.once('close',()=>{closed=true;finish();fail(Error('Hedra連線已關閉；提交結果需核對。'));});child.stderr.on('data',()=>{});
 const lines=readline.createInterface({input:child.stdout});
 lines.on('line',line=>{total+=Buffer.byteLength(line);if(total>4000000){fail(Error('Hedra回應超過上限。'));child.kill();return;}try{const m=JSON.parse(line);if(m.id&&pending.has(m.id)){const q=pending.get(m.id);pending.delete(m.id);m.error?q.reject(hedraFailure(m.error)):q.resolve(m.result);}else if(m.id)child.stdin.write(JSON.stringify({id:m.id,error:{code:-32601,message:'No interactive actions'}})+'\n');}catch{}});
 const request=(method,params)=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});child.stdin.write(JSON.stringify({id:n,method,params})+'\n');});
 const abort=()=>{fail(Error('Hedra連線逾時或取消；不自動重新提交。'));child.kill();};const timer=setTimeout(abort,Math.min(35000,timeout));signal?.addEventListener('abort',abort,{once:true});
 try{
  await request('initialize',{clientInfo:{name:'kinseed_hedra_scoped',version:'1.0.0'},capabilities:{experimentalApi:true}});child.stdin.write(JSON.stringify({method:'initialized',params:{}})+'\n');
  const enabled=[...READ,...(paid?WRITE:[])];const t=await request('thread/start',{ephemeral:true,sandbox:'read-only',config:{mcp_servers:{hedra:{url:'https://mcp.hedra.com',enabled_tools:enabled}},features:{plugins:false,apps:false}}});
  let submitted=false;
  return await fn(async(tool,args={})=>{
   if(!READ.has(tool)&&!(paid&&WRITE.has(tool)))throw Error('Hedra工具不在此接頭範圍。');
   if(WRITE.has(tool)){if(submitted||typeof args.idempotency_key!=='string'||!args.idempotency_key)throw Error('同一連線僅允許一筆有識別碼的提交。');submitted=true;}
   const r=await request('mcpServer/tool/call',{threadId:t.thread.id,server:'hedra',tool,arguments:args});
   if(r.isError)throw hedraFailure(r.content);if(!r.structuredContent)throw hedraFailure('missing structured result');return r.structuredContent;
  });
 }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);child.stdin.end();const kill=setTimeout(()=>{if(!closed)child.kill();},1000);await done;clearTimeout(kill);lines.close();}
}
