// Read-only candidate diagnostics. It never changes an adapter or life authorization.
(()=>{
 const box=el('section');box.id='appServerCandidate';box.hidden=true;
 const heading=el('h3','接頭執行狀態'),name=el('p','Codex app-server'),notice=el('p'),help=el('p','更換接頭前，請先等待工作收尾並停止這份控制台；身份、記憶與每日安排不會因選擇接頭而改寫。');notice.id='appServerCandidateNotice';notice.setAttribute('role','status');
 const update=el('button','更新接頭狀態');update.id='appServerCandidateRefresh';const details=el('details'),debug=el('pre');details.append(el('summary','進階：背景工作與程序'),debug);const readiness=el('p','登入檢查與工作準備分開核對；準備失敗保留每日安排。');readiness.id='appServerReadinessNotice';box.append(heading,name,notice,readiness,help,update,details);pageMap.home.append(box);
 function paint(){const r=status?.app_server;box.hidden=!r;if(!r)return;notice.textContent=r.synthetic?'使用合成替身，沒有連接真實模型。':r.production_binding?'已接回原生活與工作計次；登入狀態與個體授權分開核對。':r.real_inference_authorized?'真實呼叫仍受本次授權與額度限制；不會自動切換接頭。':'未授權真實呼叫，已保留設定；不會切換到其他接頭。';debug.textContent=pretty({runtime:r,background:status?.background_jobs??null});}
 update.onclick=async()=>{update.disabled=true;try{await refresh();debug.textContent=pretty(await api('app-server/status'));}catch(e){notice.textContent=e.message;}finally{update.disabled=false;}};
 const before=refresh;refresh=async function(...args){const result=await before(...args);paint();return result;};document.addEventListener('kinseed-control-render',paint);paint();
})();
