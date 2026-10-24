(()=>{
 const ui=globalThis.kinseedControlUI;if(!ui)return;ui.firstActivityLabel=firstActivityLabel;
 const help=el('div');help.id='page-help';help.hidden=true;pageMap.help=help;pages.append(help);
 const add=(title,text)=>{help.append(el('h3',title),el('p',text));};
 help.append(el('h2','操作導引｜從設定到第一次活動'));
 add('先分清楚兩個畫面','「首次設定」準備整個平台的大腦與工具；「控制台」管理每個個體。使用Codex作為大腦，不代表必須另外勾選Codex作品工具。');
 add('1．建立個體，再準備他的出生條件','從首頁建立新個體並填名字。問卷草稿是尚未完成的出生條件，可以儲存後繼續；不代表已批准或出生。恢復草稿會接續原回答，建立可編輯副本才會另開一份。');
 add('2．預覽、提交與批准','填完後預覽出生條件，再提交審核。核對對象、內容與差異後，由你批准採用。查看原版不會建立新版本；修改副本並保存才產生新候選。批准身份不會開始生活。');
 add('3．設定第一次生活','進入「管理個體 → 身份與出生」。按導引先到「時間與額度」保存時間及輪數，再到「工具權限」保存選擇；每頁下方都有返回出生準備的按鈕。沒有要開的新工具可以保留現狀。保存設定不等於啟動。');
 add('4．大腦未連上時怎麼辦？','先保存控制台內的設定。回到原本的「首次設定」分頁；若找不到，從這份程式資料夾執行「首次設定.cmd」。先停止這份控制台，再到第2步選擇大腦並檢查連線，第3步的作品工具可不開，第4步保存、第5步重新啟動。回到同一個體繼續，身份與草稿保留，不必重填。停止會中止本副本的其他活動，請先核對；不要停止不相干的服務。');
 add('5．檢查平台，由你親自確認出生','回「身份與出生」檢查平台。全域停止時先閱讀影響範圍，再由你決定是否解除；解除不會自動出生或恢復其他個體。最後核對名字、身份、第一次活動的完整日期、截止時間與輪數，勾選並親自確認。');
 add('6．出生之後','出生立即留存紀錄，可以提前完成；活動要到指定時間才開始。到「狀態與啟停」可選「開啟每日生活」，確認後每天按已保存時段生活；單次臨時加開另行操作，不改每日時間。停止、暫停、全域停止、重啟或修改生活設定會取消每日生活，須重新開啟。輪數與網路額度不會因此增加。');
 add('7．閱讀成果與互動','「個體來訊」查看並回覆訊息；「工具工作與成品 → 作品與執行」閱讀作品版本與實際執行結果；「閱讀紀錄」查看生活日誌與每日生活報告。沒有紀錄的成果不代表已完成。');
 add('網頁斷線或更換瀏覽器','網頁分頁關閉不等於停止服務。請用本副本「開啟開發控制台.cmd」取得有效連結；跨瀏覽器使用首次設定的「複製控制台連結」，不要只複製位址列。不要因畫面失聯就重新建立個體或重複出生。');
 const back=el('button','返回目前個體的出生或活動狀態');back.onclick=()=>ui.openTab(ui.scope, current()?.life.state==='unborn'?'identity':'status');help.append(back);
 const helpNav=el('button','操作導引');helpNav.id='ownerHelp';helpNav.dataset.page='help';helpNav.onclick=()=>navigate('help');nav.append(helpNav);
 const home=el('section');home.id='ownerWelcomeGuide';home.append(el('h3','第一次使用：依這個順序完成'),el('p','平台首次設定 → 建立個體 → 填寫並保存草稿 → 預覽與批准 → 生活設定 → 親自確認出生 → 閱讀活動與成果'));const read=el('button','閱讀完整操作導引');read.onclick=()=>navigate('help');home.append(read);pageMap.home.prepend(home);
 const guide=el('section');guide.id='ownerNextGuide';guide.setAttribute('aria-label','目前個體的下一步');const title=el('h3'),body=el('p'),next=el('button');next.className='primary';guide.append(title,body,next);ui.notice.after(guide);let action='identity';
 function current(){return status?.individuals.find(e=>e.profile.individual_id===ui.scope);}
 next.onclick=()=>{if(action==='help'||action==='create')navigate(action);else ui.openTab(ui.scope,action);};
 const footers={};for(const [key,text,dest] of [['settings','時間與輪數確認後，下一步：工具權限','permissions'],['permissions','權限確認後，下一步：返回出生準備','identity']]){const footer=el('section'),p=el('p'),b=el('button',text);footer.className='ownerJourneyReturn';b.id='ownerJourneyNext-'+key;b.className='primary';b.onclick=()=>{const dirty=key==='settings'?ui.hasUnsavedSettings:ui.hasUnsavedPermissions;if(dirty){show('這一頁還有未保存的修改。請先按各項的保存按鈕；不想採用時可捨棄修改。');return;}ui.openTab(ui.scope,dest);};footer.append(p,b);$('hubPane-'+key).append(footer);footers[key]={footer,p,b};}
 function paint(){const e=current(),g=ownerGuide(e,status,{settings:ui.hasUnsavedSettings,permissions:ui.hasUnsavedPermissions});action=g.destination;title.textContent=g.title;next.textContent=g.next;next.disabled=busy||ui.pending;body.textContent='進度依已保存資料顯示。查看、切換與下一步不會替你批准、出生或啟動。';if(e?.life.state==='unborn'&&birthCheck?.individual_id===ui.scope)body.textContent+=' 依目前已保存設定，第一次活動：'+firstActivityLabel(birthCheck.next_window_start,Date.now(),status.timezone)+'；最晚結束：'+firstActivityLabel(birthCheck.first_window.end,Date.now(),status.timezone)+'。';for(const [key,{footer,p,b}]of Object.entries(footers)){footer.hidden=!e||e.life.state!=='unborn';const dirty=key==='settings'?ui.hasUnsavedSettings:ui.hasUnsavedPermissions;p.textContent=(e?.name??'')+'｜'+(dirty?'尚有未保存的修改，請先保存。':'此頁目前顯示已保存設定，可以繼續。');b.disabled=busy||ui.pending;}}
 document.addEventListener('kinseed-control-render',paint);ui.page.addEventListener('input',paint);ui.page.addEventListener('change',paint);
 const css=el('style');css.textContent='#ownerNextGuide,.ownerJourneyReturn{background:#eef5ef;border:1px solid #b8d0bf;padding:14px;margin:12px 0;border-radius:8px}#ownerNextGuide h3{margin-top:0}#page-help{max-width:900px}#page-help p{line-height:1.9}';document.head.append(css);paint();
})();
