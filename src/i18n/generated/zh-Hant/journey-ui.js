// A confirmation is about the displayed individual and material settings, never an elapsed timer.
const journeyAPI=(action,b={})=>api('journey/'+action,b);
const journeyMemory={read(){try{return JSON.parse(sessionStorage.getItem('kinseed-owner-progress')||'{}');}catch{return {};}},write(patch){try{sessionStorage.setItem('kinseed-owner-progress',JSON.stringify({...this.read(),...patch}));}catch{}}};
let birthCheck=null,birthAttempt=null,globalCheck=null,checkingBirth=false,birthChanges=[];
Object.assign(errorMessages,{CONFIRMATION_CHANGED:"內容或生活設定已有變更，已重新讀取。請核對畫面上的變更後，再確認一次；不用重建提案。",REVIEW_CONTENT_CHANGED:"提案與保存的身份內容不一致，已停止採用。請保留提案並查看原始身份來源。",GLOBAL_CLEAR_ACTIVE:"仍有個體尚未完成停止。請先按全域緊急停止，等待任務結束後，再查看解除範圍。",GLOBAL_LIMIT:"今天平台可用活動輪數已用完，請在明天的生活時段繼續。",CYCLE_LIMIT:"此個體本時段的活動輪數已用完，請在下一個有效時段繼續。",ALREADY_LIVED:"此個體已出生或有生活歷史。請查看出生結果，之後使用恢復生活，不會再次出生。"});
errorMessages.PREVIEW_INVALID="舊畫面已更新。請按「重新檢查出生條件」繼續，原身份與設定仍保留。";
errorMessages.PREVIEW_STALE="個體設定已更新。請重新查看目前內容再確認，不用重新提交相同提案。";
errorMessages.REVIEW_STALE="提交後草稿已有修改。原提案及審核歷史仍保留；請核對新的草稿內容，決定提交新內容或從版本庫選原版。";

selectionSection.querySelector('small').textContent="切換只查看資料，不會啟動個體；每次操作都只作用於畫面明確指定的對象。";lifeIntro.hidden=true;const oldQuota=[...lifeSection.querySelectorAll('p')].find(e=>e.textContent.startsWith("每個體每窗口最多"));if(oldQuota)oldQuota.hidden=true;
const lifeSteps=el('section');lifeSteps.id='lifeJourney';lifeSteps.append(el('h3',"首次生活準備"),el('p',"① 確認已批准身份 → ② 保存生活時段與工具設定 → ③ 檢查條件 → ④ Owner 親自確認出生"));
const readinessText=el('div');readinessText.id='birthReadiness';readinessText.setAttribute('aria-live','polite');const checkBirth=el('button',"重新檢查出生條件");checkBirth.id='checkBirth';lifeSteps.append(readinessText,checkBirth);lifeSection.prepend(lifeSteps);
$('previewBirth').textContent="檢查條件，準備首次出生";$('birth').textContent="我確認讓此指定個體首次出生";
$('windowStart').closest('label').firstChild.textContent="每天開始生活的時間（生活時區） ";
$('windowMinutes').closest('label').firstChild.textContent="每日可活動時段長度（分鐘，最多240） ";
$('tasks').closest('section').querySelector('small').textContent="本機停止與遠端取消分開記錄；沒有遠端確認時會明示尚未確認。";
const settingsHelp=el('p',"生活時間是允許活動的範圍，不保證持續思考。每輪最多2分鐘，包含工具與等待；接近期限會保留交接時間。時段與額度不自動增加。只有Owner明確停止才取消每日授權，異常或重啟會先核對執行條件。");$('window').after(settingsHelp);
const toolsHelp=el('p',"工具權限請查看上方逐項清單。「生活必備」與「尚未開放」會說明原因；只有可自行勾選的項目能保存成設定，身份描述不會替代實際授權。");$('permissions').after(toolsHelp);
const settingResult=el('p');settingResult.id='settingResult';$('permissions').after(settingResult);
const globalPanelFlow=el('div');globalPanelFlow.id='globalClearFlow';globalPanelFlow.hidden=true;globalPanel.append(globalPanelFlow);$('globalClear').textContent="查看解除平台停止的範圍";
const confirmGlobal=el('button',"確認解除平台停止（不啟動個體）");confirmGlobal.id='confirmGlobal';
const cancelGlobal=el('button',"保留全域停止");cancelGlobal.onclick=()=>{globalPanelFlow.hidden=true;globalCheck=null;show("平台停止狀態未改變。");};

async function showGlobalImpact(){globalCheck=await journeyAPI('globalImpact');globalPanelFlow.replaceChildren(el('h3',"解除平台停止會影響誰？"),el('p',globalCheck.message));for(const e of globalCheck.individuals)globalPanelFlow.append(el('p',e.name+'（'+e.individual_id+'） · '+lifeName(e.state)+' · '+modeName(e.mode)+(e.state!=='unborn'?"；解除後仍須個別恢復":'')));if(!globalCheck.can_clear)globalPanelFlow.append(el('p',"尚有任務或生活狀態未停止。請先使用上方全域緊急停止。"));globalPanelFlow.append(confirmGlobal,cancelGlobal);globalPanelFlow.hidden=false;confirmGlobal.disabled=!globalCheck.can_clear||!globalCheck.stopped;globalPanelFlow.tabIndex=-1;globalPanelFlow.focus();return "請核對影響範圍。此步只有查看，尚未解除停止。";}
globalPanelFlow.append(confirmGlobal,cancelGlobal);
bind('globalClear',showGlobalImpact);bind('confirmGlobal',async()=>{if(!globalCheck)throw Error("請先查看解除範圍。");await journeyAPI('clearGlobal',{confirmation_hash:globalCheck.confirmation_hash,request_id:rid()});globalPanelFlow.hidden=true;globalCheck=null;await refresh();await loadBirthCheck();return "已解除平台停止；沒有出生或恢復任何個體。請回到指定個體的出生確認，或另行恢復已生活個體。";});

function rememberBirth(){journeyMemory.write({birth:birthCheck?{individual_id:birthCheck.individual_id,confirmation_hash:birthCheck.confirmation_hash,checked:$('birthConfirm').checked,request_id:birthAttempt,settings:birthCheck.settings,identity:birthCheck.identity,changes:birthChanges}:null});}
function renderReadiness(r){
 const previous=birthCheck,stored=journeyMemory.read().birth,matching=previous?.individual_id===r.individual_id&&previous.confirmation_hash===r.confirmation_hash,remembered=stored?.individual_id===r.individual_id&&stored.confirmation_hash===r.confirmation_hash;
 const wasChecked=matching?$('birthConfirm').checked:remembered?stored.checked:false;
 const comparison=previous?.individual_id===r.individual_id?previous:stored?.individual_id===r.individual_id&&stored.settings?stored:null;const changed=comparison&&comparison.confirmation_hash!==r.confirmation_hash;if(!matching)birthChanges=remembered?(stored.changes??[]):[];
 birthCheck=r;birthAttempt=matching?birthAttempt:remembered?stored.request_id:null;
 readinessText.replaceChildren(el('p',r.name+'：'+(r.identity?"已批准身份「"+r.identity.title+'」':"尚未批准身份")+'，'+lifeName(r.life.state)+'。'));
 if(changed&&r.life.state==='unborn'){birthChanges=["身份或生活設定已改變；請核對下列變更，再勾選確認。"];if(comparison.identity?.package_hash!==r.identity?.package_hash)birthChanges.push("採用身份："+(comparison.identity?.title??"未批准")+' → '+(r.identity?.title??"未批准"));for(const [key,label]of [['window_start',"每日開始時間"],['window_minutes',"活動時段分鐘"],['max_cycles',"每時段最多輪數"],['global_limit',"平台每日輪數"]])if(comparison.settings[key]!==r.settings[key])birthChanges.push(label+'：'+comparison.settings[key]+' → '+r.settings[key]);if(comparison.settings.permissions.note!==r.settings.permissions.note)birthChanges.push("新增筆記權限："+(comparison.settings.permissions.note?"允許":"不允許")+' → '+(r.settings.permissions.note?"允許":"不允許"));}for(const message of birthChanges)if(r.life.state==='unborn')readinessText.append(el('p',message));
 if(r.life.state!=='unborn'){
  readinessText.append(el('p',r.born_at?"出生時間："+new Date(r.born_at).toLocaleString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:status?.timezone??'Asia/Taipei'}):"已有早期生活紀錄，出生時間未記載。"),el('p',"目前採用身份："+(r.identity?.title??"早期身份")+" · 第"+(r.identity?.package_version??r.identity?.version??'?')+"版"),el('p',"每日 "+r.settings.window_start+" 起 "+r.settings.window_minutes+" 分鐘；"+(r.next_activity?"下一次預定活動："+new Date(r.next_activity).toLocaleString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:status?.timezone??'Asia/Taipei'}):"目前沒有待執行活動；停止後須明確恢復。")));
  $('birthReview').hidden=true;return;
 }
 for(const blocker of r.blockers){const row=el('div');row.append(el('p',blocker.message));if(blocker.action==='global'){const go=el('button',"查看解除平台停止的範圍");go.onclick=()=>$('globalClear').click();row.append(go);}if(blocker.action==='review'){const go=el('button',"前往身份審核");go.onclick=()=>navigate('review');row.append(go);}readinessText.append(row);}
 readinessText.append(el('p',"每日 "+r.settings.window_start+" 起 "+r.settings.window_minutes+" 分鐘；本個體最多 "+r.settings.max_cycles+" 輪，平台每日最多 "+r.settings.global_limit+" 輪。"),el('p',r.window_open?"目前在生活時段內；完成出生確認後可派送第一輪活動。":"下一個生活時段："+new Date(r.next_window_start).toLocaleString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:status?.timezone??'Asia/Taipei'})+"。尚未授權出生，也沒有預約自動出生。"));
 if(r.can_confirm)readinessText.append(el('p',"出生條件已準備完成，等待 Owner 最終確認。"));
 $('birthPreview').textContent=r.name+'（'+r.individual_id+"）\n身份："+(r.identity?.title??"尚未批准")+" · 包第"+(r.identity?.package_version??'?')+"版\n每日 "+r.settings.window_start+" 起 "+r.settings.window_minutes+" 分鐘\n受控新增筆記："+(r.settings.permissions.note?"允許":"不允許")+"\n出生事實永久保留，停止及還原不能撤銷。這次確認只作用於此指定個體。";
 $('birthReview').hidden=!r.can_confirm;$('birthConfirm').checked=!!wasChecked;$('birth').disabled=!r.can_confirm||!wasChecked||busy;rememberBirth();
}
async function loadBirthCheck(){if(!selected||checkingBirth)return;checkingBirth=true;const scope=selected;try{const r=await journeyAPI('readiness',{individual_id:scope});if(scope===selected)renderReadiness(r);}finally{checkingBirth=false;}}
$('birthConfirm').onchange=()=>{if($('birthConfirm').checked)birthChanges=[];rememberBirth();$('birth').disabled=!birthCheck?.can_confirm||!$('birthConfirm').checked||busy;};
bind('checkBirth',async()=>{await loadBirthCheck();return birthCheck?.can_confirm?"條件已準備完成，請核對並勾選首次出生確認。":"目前仍有條件待處理；請依畫面上的下一步繼續。";});
bind('previewBirth',async()=>{await loadBirthCheck();return birthCheck?.can_confirm?"請核對指定個體與設定，再親自確認出生。":"已在確認前檢查阻擋原因，尚未出生。";});
bind('birth',async()=>{
 if(!birthCheck||birthCheck.individual_id!==selected||!$('birthConfirm').checked)throw Error("請先核對目前個體並勾選首次出生確認。");
 birthAttempt??=rid();rememberBirth();
 try{const result=await journeyAPI('birth',{individual_id:birthCheck.individual_id,confirmation_hash:birthCheck.confirmation_hash,confirmation:'我授權此指定個體首次出生',request_id:birthAttempt});await refresh();await loadBirthCheck();return "已完成 "+entity().name+" 的首次出生。請在「身份與出生」查看出生結果，並在「狀態與啟停」查看下一次活動。";}
 catch(e){const attempted=birthAttempt;await refresh();await loadBirthCheck();const life=entity().life;if(life.state==='born'&&life.birth_snapshot?.request_id==='journey-'+attempted)return "已核對前次操作：首次出生已完成，只是回覆未送達。出生結果顯示在上方，不需再次出生。";throw e;}
});
for(const [button,action,getBody]of [['window','window',()=>({start:$('windowStart').value,minutes:Number($('windowMinutes').value)})],['permissions','permissions',()=>({note:$('notePermission').checked})]])bind(button,async()=>{await command(action,getBody());settingResult.textContent=action==='window'?"生活時段已保存；沒有啟動或出生。":"工具設定已保存；沒有啟動或出生。";await refresh();await loadBirthCheck();return settingResult.textContent;});

// A material-change rejection reloads the same proposal; it never silently approves a replacement.
bind('approveReview',async()=>{if(!reviewShown||reviewShown.review_id!==$('reviewList').value||!reviewShown.confirmation_hash)throw Error("請先查看目前提案內容。");const r=reviewShown;try{await ba('review',{review_id:r.review_id,decision:'approve',reason:'',confirmation_hash:r.confirmation_hash});}catch(e){reviewShown=await bread('reviewPreview',{review_id:r.review_id});renderReview(reviewShown);throw e;}reviewShown=await bread('reviewPreview',{review_id:r.review_id});renderReview(reviewShown);return "已批准 "+r.individual_id+" 採用身份，個體仍停止且不會自動出生。可前往這個個體的生活設定。";});
const journeyRender=render;render=function(){journeyRender();if(currentPage==='life')loadBirthCheck().catch(e=>{readinessText.textContent=friendlyError(e);});journeyMemory.write({page:currentPage,selected,review_id:$('reviewList').value,target:$('builderTarget').value,version:$('versionList').value});if(birthCheck?.individual_id===selected)$('birth').disabled=busy||!birthCheck.can_confirm||!$('birthConfirm').checked;};
const journeyNavigate=navigate;navigate=function(page){journeyNavigate(page);journeyMemory.write({page});if(page==='life')loadBirthCheck().catch(e=>show(friendlyError(e)));};
const originalReviewChange=$('reviewList').onchange;$('reviewList').onchange=()=>{originalReviewChange();journeyMemory.write({review_id:$('reviewList').value});};
// Restore only UI choices. Authorizations and facts always come from the server after authentication.
const savedProgress=journeyMemory.read();
refresh().then(async()=>{if(status.individuals.some(e=>e.profile.individual_id===savedProgress.selected)){selected=savedProgress.selected;$('selected').value=selected;render();}if([...$('builderTarget').options].some(o=>o.value===savedProgress.target))$('builderTarget').value=savedProgress.target;if([...$('versionList').options].some(o=>o.value===savedProgress.version))$('versionList').value=savedProgress.version;if([...$('reviewList').options].some(o=>o.value===savedProgress.review_id)){$('reviewList').value=savedProgress.review_id;reviewShown=await bread('reviewPreview',{review_id:savedProgress.review_id});renderReview(reviewShown);}navigate(pageMap[savedProgress.page]?savedProgress.page:'home');show("已連線，已保存的提案與生活設定均保留。請依目前步驟繼續。");}).catch(e=>show(friendlyError(e)));
