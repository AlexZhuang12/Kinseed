// A confirmation is about the displayed individual and material settings, never an elapsed timer.
const journeyAPI=(action,b={})=>api('journey/'+action,b);
const journeyMemory={read(){try{return JSON.parse(sessionStorage.getItem('kinseed-owner-progress')||'{}');}catch{return {};}},write(patch){try{sessionStorage.setItem('kinseed-owner-progress',JSON.stringify({...this.read(),...patch}));}catch{}}};
let birthCheck=null,birthAttempt=null,globalCheck=null,checkingBirth=false,birthChanges=[];
Object.assign(errorMessages,{CONFIRMATION_CHANGED:"内容や生活設定を再読込しました。変更を確認し、提案を作り直さず再確認してください。",REVIEW_CONTENT_CHANGED:"提案と保存されたアイデンティティが異なるため採用を止めました。提案を残し、元の出典を確認してください。",GLOBAL_CLEAR_ACTIVE:"完全に停止していない個体があります。全体緊急停止を使い、作業終了後に解除範囲を確認してください。",GLOBAL_LIMIT:"本日の全体モデル枠を使い切りました。翌日の生活時間に続けてください。",CYCLE_LIMIT:"この個体の時間帯の活動枠を使い切りました。次の有効な時間帯に続けてください。",ALREADY_LIVED:"誕生済みか生活履歴があります。結果を確認し、以後は生活再開を使ってください。誕生は繰り返しません。"});
errorMessages.PREVIEW_INVALID="古い表示を更新しました。「出生条件を再確認」で続けてください。アイデンティティと設定は保持されています。";
errorMessages.PREVIEW_STALE="個体の設定が更新されました。現在の内容を見直して確認してください。同じ提案の再提出は不要です。";
errorMessages.REVIEW_STALE="提出後に下書きが変更されました。元の提案と審査履歴は残っています。新内容を提出するか、版の一覧から元の版を選んでください。";

selectionSection.querySelector('small').textContent="切り替えは閲覧だけで、個体を起動しません。操作は画面に明示された対象だけに適用します。";lifeIntro.hidden=true;const oldQuota=[...lifeSection.querySelectorAll('p')].find(e=>e.textContent.startsWith("個体・時間帯ごとの上限 "));if(oldQuota)oldQuota.hidden=true;
const lifeSteps=el('section');lifeSteps.id='lifeJourney';lifeSteps.append(el('h3',"初回活動の準備"),el('p',"① 承認済みアイデンティティを確認 → ② 生活時間と道具を保存 → ③ 条件を確認 → ④ Owner自身が誕生を確定"));
const readinessText=el('div');readinessText.id='birthReadiness';readinessText.setAttribute('aria-live','polite');const checkBirth=el('button',"誕生の要件を再確認");checkBirth.id='checkBirth';lifeSteps.append(readinessText,checkBirth);lifeSection.prepend(lifeSteps);
$('previewBirth').textContent="要件を確認して初回誕生の準備";$('birth').textContent="指定されたこの個体の初回誕生を確認します";
$('windowStart').closest('label').firstChild.textContent="毎日の活動開始時刻（生活タイムゾーン） ";
$('windowMinutes').closest('label').firstChild.textContent="毎日の活動時間帯の長さ（分、最大240） ";
$('tasks').closest('section').querySelector('small').textContent="ローカル終了と遠隔取消は分けて記録します。遠隔側の確認がなければ未確認と明示します。";
const settingsHelp=el('p',"生活時間は活動を許可する範囲で、常に思考する保証ではありません。各回の上限はツールと待機を含む2分です。期限前に引き継ぎ時間を確保します。時間や使用枠を自動で増やしません。毎日の許可はOwnerの明示的な停止でのみ取り消され、異常や再起動時は実行条件を確認します。");$('window').after(settingsHelp);
const toolsHelp=el('p',"道具の権限は上の一覧で確認してください。必須と未提供の項目には理由を表示します。選択可能な項目のみ保存でき、アイデンティティの記述は実際の許可を代替しません。");$('permissions').after(toolsHelp);
const settingResult=el('p');settingResult.id='settingResult';$('permissions').after(settingResult);
const globalPanelFlow=el('div');globalPanelFlow.id='globalClearFlow';globalPanelFlow.hidden=true;globalPanel.append(globalPanelFlow);$('globalClear').textContent="全体停止解除の影響範囲を見る";
const confirmGlobal=el('button',"全体停止の解除を確認（個体は開始しません）");confirmGlobal.id='confirmGlobal';
const cancelGlobal=el('button',"全体停止を維持");cancelGlobal.onclick=()=>{globalPanelFlow.hidden=true;globalCheck=null;show("全体停止の状態は変更していません。");};

async function showGlobalImpact(){globalCheck=await journeyAPI('globalImpact');globalPanelFlow.replaceChildren(el('h3',"全体停止の解除は誰に影響しますか？"),el('p',globalCheck.message));for(const e of globalCheck.individuals)globalPanelFlow.append(el('p',e.name+'（'+e.individual_id+'） · '+lifeName(e.state)+' · '+modeName(e.mode)+(e.state!=='unborn'?"。解除後も個別の再開操作が必要です":'')));if(!globalCheck.can_clear)globalPanelFlow.append(el('p',"未停止の作業または生活状態があります。先に上の全体緊急停止を使ってください。"));globalPanelFlow.append(confirmGlobal,cancelGlobal);globalPanelFlow.hidden=false;confirmGlobal.disabled=!globalCheck.can_clear||!globalCheck.stopped;globalPanelFlow.tabIndex=-1;globalPanelFlow.focus();return "影響範囲を確認してください。この手順は閲覧のみで、停止はまだ解除していません。";}
globalPanelFlow.append(confirmGlobal,cancelGlobal);
bind('globalClear',showGlobalImpact);bind('confirmGlobal',async()=>{if(!globalCheck)throw Error("先に停止解除の影響範囲を確認してください。");await journeyAPI('clearGlobal',{confirmation_hash:globalCheck.confirmation_hash,request_id:rid()});globalPanelFlow.hidden=true;globalCheck=null;await refresh();await loadBirthCheck();return "プラットフォーム停止を解除しました。誕生や生活再開はしていません。対象の誕生確認に戻るか、既存個体の生活を別途再開してください。";});

function rememberBirth(){journeyMemory.write({birth:birthCheck?{individual_id:birthCheck.individual_id,confirmation_hash:birthCheck.confirmation_hash,checked:$('birthConfirm').checked,request_id:birthAttempt,settings:birthCheck.settings,identity:birthCheck.identity,changes:birthChanges}:null});}
function renderReadiness(r){
 const previous=birthCheck,stored=journeyMemory.read().birth,matching=previous?.individual_id===r.individual_id&&previous.confirmation_hash===r.confirmation_hash,remembered=stored?.individual_id===r.individual_id&&stored.confirmation_hash===r.confirmation_hash;
 const wasChecked=matching?$('birthConfirm').checked:remembered?stored.checked:false;
 const comparison=previous?.individual_id===r.individual_id?previous:stored?.individual_id===r.individual_id&&stored.settings?stored:null;const changed=comparison&&comparison.confirmation_hash!==r.confirmation_hash;if(!matching)birthChanges=remembered?(stored.changes??[]):[];
 birthCheck=r;birthAttempt=matching?birthAttempt:remembered?stored.request_id:null;
 readinessText.replaceChildren(el('p',r.name+'：'+(r.identity?"承認済みアイデンティティ「"+r.identity.title+'」':"アイデンティティは未承認")+'，'+lifeName(r.life.state)+'。'));
 if(changed&&r.life.state==='unborn'){birthChanges=["アイデンティティまたは生活設定が変わりました。下の変更を確認してから確認欄を選択してください。"];if(comparison.identity?.package_hash!==r.identity?.package_hash)birthChanges.push("採用するアイデンティティ："+(comparison.identity?.title??"未承認")+' → '+(r.identity?.title??"未承認"));for(const [key,label]of [['window_start',"毎日の開始時刻"],['window_minutes',"活動時間帯の分数"],['max_cycles',"時間帯ごとの最大回数"],['global_limit',"プラットフォームの1日回数"]])if(comparison.settings[key]!==r.settings[key])birthChanges.push(label+'：'+comparison.settings[key]+' → '+r.settings[key]);if(comparison.settings.permissions.note!==r.settings.permissions.note)birthChanges.push("ノート追加の権限："+(comparison.settings.permissions.note?"許可":"許可しない")+' → '+(r.settings.permissions.note?"許可":"許可しない"));}for(const message of birthChanges)if(r.life.state==='unborn')readinessText.append(el('p',message));
 if(r.life.state!=='unborn'){
  readinessText.append(el('p',r.born_at?"誕生日時："+new Date(r.born_at).toLocaleString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:status?.timezone??'Asia/Taipei'}):"以前の活動記録がありますが、誕生日時は記録されていません。"),el('p',"現在採用中のアイデンティティ："+(r.identity?.title??"以前のアイデンティティ")+" · 第"+(r.identity?.package_version??r.identity?.version??'?')+"版"),el('p',"毎日 "+r.settings.window_start+" から "+r.settings.window_minutes+" 分間、"+(r.next_activity?"次の活動予定："+new Date(r.next_activity).toLocaleString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:status?.timezone??'Asia/Taipei'}):"実行待ちの活動はありません。停止後は明示的な再開が必要です。")));
  $('birthReview').hidden=true;return;
 }
 for(const blocker of r.blockers){const row=el('div');row.append(el('p',blocker.message));if(blocker.action==='global'){const go=el('button',"全体停止解除の影響範囲を見る");go.onclick=()=>$('globalClear').click();row.append(go);}if(blocker.action==='review'){const go=el('button',"アイデンティティの審査へ");go.onclick=()=>navigate('review');row.append(go);}readinessText.append(row);}
 readinessText.append(el('p',"毎日 "+r.settings.window_start+" から "+r.settings.window_minutes+" 分間、この個体の上限 "+r.settings.max_cycles+" 回、プラットフォームの1日上限 "+r.settings.global_limit+" 回。"),el('p',r.window_open?"現在は活動時間内です。誕生確認後に最初の活動を開始できます。":"次の活動時間帯："+new Date(r.next_window_start).toLocaleString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:status?.timezone??'Asia/Taipei'})+"。誕生はまだ許可されておらず、自動誕生の予約もありません。"));
 if(r.can_confirm)readinessText.append(el('p',"誕生条件は整いました。Ownerの最終確認を待っています。"));
 $('birthPreview').textContent=r.name+'（'+r.individual_id+"）\nアイデンティティ："+(r.identity?.title??"まだ承認していません")+" · パッケージ第"+(r.identity?.package_version??'?')+"版\n毎日 "+r.settings.window_start+" から "+r.settings.window_minutes+" 分間\n制御されたノート追加："+(r.settings.permissions.note?"許可":"許可しない")+"\n誕生の事実は永久に残り、停止や復元でも取り消せません。この確認は指定した個体だけに適用します。";
 $('birthReview').hidden=!r.can_confirm;$('birthConfirm').checked=!!wasChecked;$('birth').disabled=!r.can_confirm||!wasChecked||busy;rememberBirth();
}
async function loadBirthCheck(){if(!selected||checkingBirth)return;checkingBirth=true;const scope=selected;try{const r=await journeyAPI('readiness',{individual_id:scope});if(scope===selected)renderReadiness(r);}finally{checkingBirth=false;}}
$('birthConfirm').onchange=()=>{if($('birthConfirm').checked)birthChanges=[];rememberBirth();$('birth').disabled=!birthCheck?.can_confirm||!$('birthConfirm').checked||busy;};
bind('checkBirth',async()=>{await loadBirthCheck();return birthCheck?.can_confirm?"条件は整いました。内容を確認し、初回誕生の確認欄を選択してください。":"未解決の条件があります。画面に表示された次の手順へ進んでください。";});
bind('previewBirth',async()=>{await loadBirthCheck();return birthCheck?.can_confirm?"指定された個体と設定を確認し、自分で誕生を確認してください。":"最終確認前に阻害要因を調べました。まだ誕生していません。";});
bind('birth',async()=>{
 if(!birthCheck||birthCheck.individual_id!==selected||!$('birthConfirm').checked)throw Error("現在の個体を確認し、初回誕生の確認にチェックしてください。");
 birthAttempt??=rid();rememberBirth();
 try{const result=await journeyAPI('birth',{individual_id:birthCheck.individual_id,confirmation_hash:birthCheck.confirmation_hash,confirmation:'我授權此指定個體首次出生',request_id:birthAttempt});await refresh();await loadBirthCheck();return "完了しました："+entity().name+"の初回誕生です。「アイデンティティと誕生」で結果、「状態と開始・停止」で次回活動を確認できます。";}
 catch(e){const attempted=birthAttempt;await refresh();await loadBirthCheck();const life=entity().life;if(life.state==='born'&&life.birth_snapshot?.request_id==='journey-'+attempted)return "前回の操作を照合しました。誕生は完了し、応答だけ届いていませんでした。結果は上に表示され、再度の誕生は不要です。";throw e;}
});
for(const [button,action,getBody]of [['window','window',()=>({start:$('windowStart').value,minutes:Number($('windowMinutes').value)})],['permissions','permissions',()=>({note:$('notePermission').checked})]])bind(button,async()=>{await command(action,getBody());settingResult.textContent=action==='window'?"活動時間帯を保存しました。活動の開始・誕生はしていません。":"ツール設定を保存しました。活動の開始・誕生はしていません。";await refresh();await loadBirthCheck();return settingResult.textContent;});

// A material-change rejection reloads the same proposal; it never silently approves a replacement.
bind('approveReview',async()=>{if(!reviewShown||reviewShown.review_id!==$('reviewList').value||!reviewShown.confirmation_hash)throw Error("先に現在の提案内容を確認してください。");const r=reviewShown;try{await ba('review',{review_id:r.review_id,decision:'approve',reason:'',confirmation_hash:r.confirmation_hash});}catch(e){reviewShown=await bread('reviewPreview',{review_id:r.review_id});renderReview(reviewShown);throw e;}reviewShown=await bread('reviewPreview',{review_id:r.review_id});renderReview(reviewShown);return "承認しました："+r.individual_id+"のアイデンティティを採用しました。個体は停止したままで、自動では誕生しません。生活設定に進めます。";});
const journeyRender=render;render=function(){journeyRender();if(currentPage==='life')loadBirthCheck().catch(e=>{readinessText.textContent=friendlyError(e);});journeyMemory.write({page:currentPage,selected,review_id:$('reviewList').value,target:$('builderTarget').value,version:$('versionList').value});if(birthCheck?.individual_id===selected)$('birth').disabled=busy||!birthCheck.can_confirm||!$('birthConfirm').checked;};
const journeyNavigate=navigate;navigate=function(page){journeyNavigate(page);journeyMemory.write({page});if(page==='life')loadBirthCheck().catch(e=>show(friendlyError(e)));};
const originalReviewChange=$('reviewList').onchange;$('reviewList').onchange=()=>{originalReviewChange();journeyMemory.write({review_id:$('reviewList').value});};
// Restore only UI choices. Authorizations and facts always come from the server after authentication.
const savedProgress=journeyMemory.read();
refresh().then(async()=>{if(status.individuals.some(e=>e.profile.individual_id===savedProgress.selected)){selected=savedProgress.selected;$('selected').value=selected;render();}if([...$('builderTarget').options].some(o=>o.value===savedProgress.target))$('builderTarget').value=savedProgress.target;if([...$('versionList').options].some(o=>o.value===savedProgress.version))$('versionList').value=savedProgress.version;if([...$('reviewList').options].some(o=>o.value===savedProgress.review_id)){$('reviewList').value=savedProgress.review_id;reviewShown=await bread('reviewPreview',{review_id:savedProgress.review_id});renderReview(reviewShown);}navigate(pageMap[savedProgress.page]?savedProgress.page:'home');show("接続しました。保存済みの提案と生活設定は保持されています。現在の手順から続けてください。");}).catch(e=>show(friendlyError(e)));
