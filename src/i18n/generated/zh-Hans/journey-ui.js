// A confirmation is about the displayed individual and material settings, never an elapsed timer.
const journeyAPI=(action,b={})=>api('journey/'+action,b);
const journeyMemory={read(){try{return JSON.parse(sessionStorage.getItem('kinseed-owner-progress')||'{}');}catch{return {};}},write(patch){try{sessionStorage.setItem('kinseed-owner-progress',JSON.stringify({...this.read(),...patch}));}catch{}}};
let birthCheck=null,birthAttempt=null,globalCheck=null,checkingBirth=false,birthChanges=[];
Object.assign(errorMessages,{CONFIRMATION_CHANGED:"内容或生活设置已有变更，已重新读取。请核对画面上的变更后，再确认一次；不用重建提案。",REVIEW_CONTENT_CHANGED:"提案与保存的身份内容不一致，已停止采用。请保留提案并查看原始身份来源。",GLOBAL_CLEAR_ACTIVE:"仍有个体尚未完成停止。请先按全域紧急停止，等待任务结束后，再查看解除范围。",GLOBAL_LIMIT:"今天平台可用活动轮数已用完，请在明天的生活时段继续。",CYCLE_LIMIT:"此个体本时段的活动轮数已用完，请在下一个有效时段继续。",ALREADY_LIVED:"此个体已出生或有生活历史。请查看出生结果，之后使用恢复生活，不会再次出生。"});
errorMessages.PREVIEW_INVALID="旧画面已更新。请按「重新检查出生条件」继续，原身份与设置仍保留。";
errorMessages.PREVIEW_STALE="个体设置已更新。请重新查看目前内容再确认，不用重新提交相同提案。";
errorMessages.REVIEW_STALE="提交后草稿已有修改。原提案及审核历史仍保留；请核对新的草稿内容，决定提交新内容或从版本库选原版。";

selectionSection.querySelector('small').textContent="切换只查看数据，不会启动个体；每次操作都只作用于画面明确指定的对象。";lifeIntro.hidden=true;const oldQuota=[...lifeSection.querySelectorAll('p')].find(e=>e.textContent.startsWith("每个体每窗口最多"));if(oldQuota)oldQuota.hidden=true;
const lifeSteps=el('section');lifeSteps.id='lifeJourney';lifeSteps.append(el('h3',"首次生活准备"),el('p',"① 确认已批准身份 → ② 保存生活时段与工具设置 → ③ 检查条件 → ④ Owner 亲自确认出生"));
const readinessText=el('div');readinessText.id='birthReadiness';readinessText.setAttribute('aria-live','polite');const checkBirth=el('button',"重新检查出生条件");checkBirth.id='checkBirth';lifeSteps.append(readinessText,checkBirth);lifeSection.prepend(lifeSteps);
$('previewBirth').textContent="检查条件，准备首次出生";$('birth').textContent="我确认让此指定个体首次出生";
$('windowStart').closest('label').firstChild.textContent="每天开始生活的时间（生活时区） ";
$('windowMinutes').closest('label').firstChild.textContent="每日可活动时段长度（分钟，最多240） ";
$('tasks').closest('section').querySelector('small').textContent="本机停止与远程取消分开记录；没有远程确认时会明示尚未确认。";
const settingsHelp=el('p',"这是每天允许活动的时间范围，并非保证持续思考。个体与平台的轮数上限请见本步显示的实际设置，每轮最多2分钟。保存设置不会启动生活。时段结束、Owner停止、撤回权限、额度用完或运行异常都会停止；重新打开控制器不会自动恢复。");$('window').after(settingsHelp);
const toolsHelp=el('p',"工具权限请查看上方逐项清单。「生活必备」与「尚未开放」会说明原因；只有可自行勾选的项目能保存成设置，身份描述不会替代实际授权。");$('permissions').after(toolsHelp);
const settingResult=el('p');settingResult.id='settingResult';$('permissions').after(settingResult);
const globalPanelFlow=el('div');globalPanelFlow.id='globalClearFlow';globalPanelFlow.hidden=true;globalPanel.append(globalPanelFlow);$('globalClear').textContent="查看解除平台停止的范围";
const confirmGlobal=el('button',"确认解除平台停止（不启动个体）");confirmGlobal.id='confirmGlobal';
const cancelGlobal=el('button',"保留全域停止");cancelGlobal.onclick=()=>{globalPanelFlow.hidden=true;globalCheck=null;show("平台停止状态未改变。");};

async function showGlobalImpact(){globalCheck=await journeyAPI('globalImpact');globalPanelFlow.replaceChildren(el('h3',"解除平台停止会影响谁？"),el('p',globalCheck.message));for(const e of globalCheck.individuals)globalPanelFlow.append(el('p',e.name+'（'+e.individual_id+'） · '+lifeName(e.state)+' · '+modeName(e.mode)+(e.state!=='unborn'?"；解除后仍须个别恢复":'')));if(!globalCheck.can_clear)globalPanelFlow.append(el('p',"尚有任务或生活状态未停止。请先使用上方全域紧急停止。"));globalPanelFlow.append(confirmGlobal,cancelGlobal);globalPanelFlow.hidden=false;confirmGlobal.disabled=!globalCheck.can_clear||!globalCheck.stopped;globalPanelFlow.tabIndex=-1;globalPanelFlow.focus();return "请核对影响范围。此步只有查看，尚未解除停止。";}
globalPanelFlow.append(confirmGlobal,cancelGlobal);
bind('globalClear',showGlobalImpact);bind('confirmGlobal',async()=>{if(!globalCheck)throw Error("请先查看解除范围。");await journeyAPI('clearGlobal',{confirmation_hash:globalCheck.confirmation_hash,request_id:rid()});globalPanelFlow.hidden=true;globalCheck=null;await refresh();await loadBirthCheck();return "已解除平台停止；没有出生或恢复任何个体。请回到指定个体的出生确认，或另行恢复已生活个体。";});

function rememberBirth(){journeyMemory.write({birth:birthCheck?{individual_id:birthCheck.individual_id,confirmation_hash:birthCheck.confirmation_hash,checked:$('birthConfirm').checked,request_id:birthAttempt,settings:birthCheck.settings,identity:birthCheck.identity,changes:birthChanges}:null});}
function renderReadiness(r){
 const previous=birthCheck,stored=journeyMemory.read().birth,matching=previous?.individual_id===r.individual_id&&previous.confirmation_hash===r.confirmation_hash,remembered=stored?.individual_id===r.individual_id&&stored.confirmation_hash===r.confirmation_hash;
 const wasChecked=matching?$('birthConfirm').checked:remembered?stored.checked:false;
 const comparison=previous?.individual_id===r.individual_id?previous:stored?.individual_id===r.individual_id&&stored.settings?stored:null;const changed=comparison&&comparison.confirmation_hash!==r.confirmation_hash;if(!matching)birthChanges=remembered?(stored.changes??[]):[];
 birthCheck=r;birthAttempt=matching?birthAttempt:remembered?stored.request_id:null;
 readinessText.replaceChildren(el('p',r.name+'：'+(r.identity?"已批准身份「"+r.identity.title+'」':"尚未批准身份")+'，'+lifeName(r.life.state)+'。'));
 if(changed&&r.life.state==='unborn'){birthChanges=["身份或生活设置已改变；请核对下列变更，再勾选确认。"];if(comparison.identity?.package_hash!==r.identity?.package_hash)birthChanges.push("采用身份："+(comparison.identity?.title??"未批准")+' → '+(r.identity?.title??"未批准"));for(const [key,label]of [['window_start',"每日开始时间"],['window_minutes',"活动时段分钟"],['max_cycles',"每时段最多轮数"],['global_limit',"平台每日轮数"]])if(comparison.settings[key]!==r.settings[key])birthChanges.push(label+'：'+comparison.settings[key]+' → '+r.settings[key]);if(comparison.settings.permissions.note!==r.settings.permissions.note)birthChanges.push("添加笔记权限："+(comparison.settings.permissions.note?"允许":"不允许")+' → '+(r.settings.permissions.note?"允许":"不允许"));}for(const message of birthChanges)if(r.life.state==='unborn')readinessText.append(el('p',message));
 if(r.life.state!=='unborn'){
  readinessText.append(el('p',r.born_at?"出生时间："+new Date(r.born_at).toLocaleString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:status?.timezone??'Asia/Taipei'}):"已有早期生活纪录，出生时间未记载。"),el('p',"目前采用身份："+(r.identity?.title??"早期身份")+" · 第"+(r.identity?.package_version??r.identity?.version??'?')+"版"),el('p',"每日 "+r.settings.window_start+" 起 "+r.settings.window_minutes+" 分钟；"+(r.next_activity?"下一次预定活动："+new Date(r.next_activity).toLocaleString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:status?.timezone??'Asia/Taipei'}):"目前没有待运行活动；停止后须明确恢复。")));
  $('birthReview').hidden=true;return;
 }
 for(const blocker of r.blockers){const row=el('div');row.append(el('p',blocker.message));if(blocker.action==='global'){const go=el('button',"查看解除平台停止的范围");go.onclick=()=>$('globalClear').click();row.append(go);}if(blocker.action==='review'){const go=el('button',"前往身份审核");go.onclick=()=>navigate('review');row.append(go);}readinessText.append(row);}
 readinessText.append(el('p',"每日 "+r.settings.window_start+" 起 "+r.settings.window_minutes+" 分钟；本个体最多 "+r.settings.max_cycles+" 轮，平台每日最多 "+r.settings.global_limit+" 轮。"),el('p',r.window_open?"目前在生活时段内；完成出生确认后可派送第一轮活动。":"下一个生活时段："+new Date(r.next_window_start).toLocaleString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:status?.timezone??'Asia/Taipei'})+"。尚未授权出生，也没有预约自动出生。"));
 if(r.can_confirm)readinessText.append(el('p',"出生条件已准备完成，等待 Owner 最终确认。"));
 $('birthPreview').textContent=r.name+'（'+r.individual_id+"）\n身份："+(r.identity?.title??"尚未批准")+" · 包第"+(r.identity?.package_version??'?')+"版\n每日 "+r.settings.window_start+" 起 "+r.settings.window_minutes+" 分钟\n受控添加笔记："+(r.settings.permissions.note?"允许":"不允许")+"\n出生事实永久保留，停止及还原不能撤销。这次确认只作用于此指定个体。";
 $('birthReview').hidden=!r.can_confirm;$('birthConfirm').checked=!!wasChecked;$('birth').disabled=!r.can_confirm||!wasChecked||busy;rememberBirth();
}
async function loadBirthCheck(){if(!selected||checkingBirth)return;checkingBirth=true;const scope=selected;try{const r=await journeyAPI('readiness',{individual_id:scope});if(scope===selected)renderReadiness(r);}finally{checkingBirth=false;}}
$('birthConfirm').onchange=()=>{if($('birthConfirm').checked)birthChanges=[];rememberBirth();$('birth').disabled=!birthCheck?.can_confirm||!$('birthConfirm').checked||busy;};
bind('checkBirth',async()=>{await loadBirthCheck();return birthCheck?.can_confirm?"条件已准备完成，请核对并勾选首次出生确认。":"目前仍有条件待处理；请依画面上的下一步继续。";});
bind('previewBirth',async()=>{await loadBirthCheck();return birthCheck?.can_confirm?"请核对指定个体与设置，再亲自确认出生。":"已在确认前检查阻挡原因，尚未出生。";});
bind('birth',async()=>{
 if(!birthCheck||birthCheck.individual_id!==selected||!$('birthConfirm').checked)throw Error("请先核对目前个体并勾选首次出生确认。");
 birthAttempt??=rid();rememberBirth();
 try{const result=await journeyAPI('birth',{individual_id:birthCheck.individual_id,confirmation_hash:birthCheck.confirmation_hash,confirmation:'我授權此指定個體首次出生',request_id:birthAttempt});await refresh();await loadBirthCheck();return "已完成 "+entity().name+" 的首次出生。请在「身份与出生」查看出生结果，并在「状态与启停」查看下一次活动。";}
 catch(e){const attempted=birthAttempt;await refresh();await loadBirthCheck();const life=entity().life;if(life.state==='born'&&life.birth_snapshot?.request_id==='journey-'+attempted)return "已核对前次操作：首次出生已完成，只是回复未送达。出生结果显示在上方，不需再次出生。";throw e;}
});
for(const [button,action,getBody]of [['window','window',()=>({start:$('windowStart').value,minutes:Number($('windowMinutes').value)})],['permissions','permissions',()=>({note:$('notePermission').checked})]])bind(button,async()=>{await command(action,getBody());settingResult.textContent=action==='window'?"生活时段已保存；没有启动或出生。":"工具设置已保存；没有启动或出生。";await refresh();await loadBirthCheck();return settingResult.textContent;});

// A material-change rejection reloads the same proposal; it never silently approves a replacement.
bind('approveReview',async()=>{if(!reviewShown||reviewShown.review_id!==$('reviewList').value||!reviewShown.confirmation_hash)throw Error("请先查看目前提案内容。");const r=reviewShown;try{await ba('review',{review_id:r.review_id,decision:'approve',reason:'',confirmation_hash:r.confirmation_hash});}catch(e){reviewShown=await bread('reviewPreview',{review_id:r.review_id});renderReview(reviewShown);throw e;}reviewShown=await bread('reviewPreview',{review_id:r.review_id});renderReview(reviewShown);return "已批准 "+r.individual_id+" 采用身份，个体仍停止且不会自动出生。可前往这个个体的生活设置。";});
const journeyRender=render;render=function(){journeyRender();if(currentPage==='life')loadBirthCheck().catch(e=>{readinessText.textContent=friendlyError(e);});journeyMemory.write({page:currentPage,selected,review_id:$('reviewList').value,target:$('builderTarget').value,version:$('versionList').value});if(birthCheck?.individual_id===selected)$('birth').disabled=busy||!birthCheck.can_confirm||!$('birthConfirm').checked;};
const journeyNavigate=navigate;navigate=function(page){journeyNavigate(page);journeyMemory.write({page});if(page==='life')loadBirthCheck().catch(e=>show(friendlyError(e)));};
const originalReviewChange=$('reviewList').onchange;$('reviewList').onchange=()=>{originalReviewChange();journeyMemory.write({review_id:$('reviewList').value});};
// Restore only UI choices. Authorizations and facts always come from the server after authentication.
const savedProgress=journeyMemory.read();
refresh().then(async()=>{if(status.individuals.some(e=>e.profile.individual_id===savedProgress.selected)){selected=savedProgress.selected;$('selected').value=selected;render();}if([...$('builderTarget').options].some(o=>o.value===savedProgress.target))$('builderTarget').value=savedProgress.target;if([...$('versionList').options].some(o=>o.value===savedProgress.version))$('versionList').value=savedProgress.version;if([...$('reviewList').options].some(o=>o.value===savedProgress.review_id)){$('reviewList').value=savedProgress.review_id;reviewShown=await bread('reviewPreview',{review_id:savedProgress.review_id});renderReview(reviewShown);}navigate(pageMap[savedProgress.page]?savedProgress.page:'home');show("已连接，已保存的提案与生活设置均保留。请依目前步骤继续。");}).catch(e=>show(friendlyError(e)));
