// One visible step; existing authenticated review/birth/stop handlers remain authoritative.
(()=>{
 const time=t=>new Date(t).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false});
 let scope=null,step=1;
 const legacy=el('div');legacy.hidden=true;while(lifeSection.children.length)legacy.append(lifeSection.firstChild);lifeSection.append(legacy);
 const title=el('h2',"初回誕生を順に進める"),progress=el('ol');progress.className='birthProgress';progress.setAttribute('aria-label',"誕生準備の進捗");
 const names=["対象とアイデンティティを確認","時間とツールを設定","プラットフォームの状態を確認","自分で誕生を確認","誕生の結果"];
 const panels=names.map((name,i)=>{progress.append(el('li',name));const pane=el('div');pane.id='birthStep'+(i+1);pane.hidden=true;pane.append(el('h3',"第"+(i+1)+"段階｜"+name));return pane;});
 const state=el('p');state.id='wizardStatus';state.setAttribute('aria-live','polite');lifeSection.append(title,progress,state,...panels);
 const button=(id,text,parent,fn,primary=true)=>{const b=el('button',text);b.id=id;b.className=primary?'primary':'';parent.append(b);if(fn)bind(id,fn);return b;};
 const identity=el('div');panels[0].append(identity);
 button('wizardIdentity',"次へ：活動時間とツールを設定",panels[0],()=>{if(!birthCheck?.identity)throw Error('IDENTITY_NOT_APPROVED');go(2);return "次へ：先に時間を設定して、今誕生を完了できます。活動時間まで待つ必要はありません。";});
 const choose=button('wizardChooseIdentity',"アイデンティティを選ぶ・既存の審査を続ける",panels[0],async()=>{const target=selected,b=await api('builder');if(selected!==target)throw Error("管理対象が切り替わりました。もう一度確認してください。");$('builderTarget').value=target;const pending=b.reviews.filter(r=>r.individual_id===target&&r.status==='pending').at(-1);if(pending){await builderRefresh();$('reviewList').value=pending.review_id;reviewShown=await bread('reviewPreview',{review_id:pending.review_id});renderReview(reviewShown);navigate('review');return "既存の審査待ち提案を開きました。重複提出はしません。確認・承認後、「この個体の生活設定を見る」で続けてください。";}navigate('library');return "アイデンティティの版を選んで審査に提出してください。承認後、「生活と記憶」に戻り誕生準備を続けてください。";});
 const setupIntro=el('p');panels[1].append(setupIntro);
 for(const id of ['windowStart','windowMinutes'])panels[1].append($(id).closest('label'));
 const permissionPanel=el('section');permissionPanel.id='ownerPermissionOptions';permissionPanel.append(el('h3',"この個体に何を許可しますか？"),el('p',"ここで切り替えられるのは選択可能な項目のみです。生活の必須能力は解除できず、未提供の能力も許可済みと誤解しないよう選択できません。"));
 const permissionTarget=el('p');permissionTarget.id='permissionTarget';permissionPanel.append(permissionTarget,el('p',"LLM大脳：GPT-6.1-Solに固定。各回で自分のアイデンティティと記憶を読み、考え、進捗を保存します。生活の基本能力で、別途許可は不要です。"));const permissionInputs={note:$('notePermission')};
 for(const [group,title]of [['optional',"任意で選択可能"],['required',"生活の基本機能（常に有効）"],['unavailable',"未提供（現在は許可できません）"]]){
  const rows=ownerPermissionRows.filter(r=>r.group===group),container=group==='optional'?el('fieldset'):el('details');
  container.append(el(group==='optional'?'legend':'summary',title+' · '+rows.length+" 件"));if(group==='optional')container.id='optionalPermissions';
  for(const row of rows){if(row.id==='chat'){container.append(el('p',row.title+'：'+row.description));continue;}let label,input;if(row.id==='note'){label=$('notePermission').closest('label');input=$('notePermission');label.lastChild.textContent=' '+row.title;}
   else {label=el('label');input=el('input');input.type='checkbox';input.id='permission-'+row.id;input.disabled=group!=='optional';input.checked=group==='required';input.setAttribute('aria-label',row.title+(group==='required'?"（生活の基本機能）":''));label.append(input,document.createTextNode(' '+row.title));if(group==='optional')permissionInputs[row.id]=input;}
   const description=el('p',row.description);description.id='permissionHelp-'+row.id;input.setAttribute('aria-describedby',description.id);container.append(label,description);
  }if(rows.length)permissionPanel.append(container);
 }
 const domainsLabel=el('label',"閲覧を許可するサイトのドメイン（1行1件、旧設定互換） "),domains=el('textarea');domains.id='webDomains';domains.placeholder="例：www.wikipedia.org\nパスを含めずドメインだけを入力してください。wwwと他のサブドメインは別々に指定します。";domainsLabel.append(domains);permissionPanel.append(domainsLabel,el('p',"公開モードにドメイン入力は不要です。Ownerのログイン情報を持ち込まず動的サイトを閲覧でき、ノート送信は都度承認が必要です。枠は「ネット使用量と配分」で確認でき、使い切っても外網だけが停止します。"));
 const webMode=el('select');webMode.id='webMode';for(const [value,title]of [['public',"すべての公開HTTPSサイト（分離ブラウザ）"],['allowlist',"指定サイト一覧を使用"]]){const o=el('option',title);o.value=value;webMode.append(o);}const modeLabel=el('label',"閲覧範囲 ");modeLabel.append(webMode);domainsLabel.before(modeLabel);webMode.onchange=()=>{domainsLabel.hidden=webMode.value==='public';remember();};
 const backendReady=()=>status?.capabilities?.version===1;
 const normalizedDomains=()=>{const rows=domains.value.split(/[\s,，]+/).filter(Boolean);return [...new Set(rows.map(x=>{if(/[/:@?#*\\]/.test(x))throw Error("zh.wikipedia.orgなどのドメインだけを入力し、https://やパスは含めないでください。");let host;try{host=new URL('https://'+x).hostname;}catch{throw Error("サイトのドメインの形式を確認してください。");}if(!host.includes('.')||host.endsWith('.')||/^\d+\./.test(host)||!host.split('.').every(v=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(v))||/(^|\.)(localhost|local|internal|invalid|test|example|home|onion)$/.test(host))throw Error("公開サイトのドメインを入力してください。ローカルや私設ネットワークは利用できません。");return host;}))];};
 const formPermissions=()=>{let list;try{list=normalizedDomains();}catch{list=domains.value.split(/[\s,，]+/).filter(Boolean);}return {note:permissionInputs.note.checked,...(backendReady()?{consult:permissionInputs.consult.checked,chat:true,web:permissionInputs.web.checked,web_domains:list,web_mode:webMode.value}:{})};};
 permissionPanel.append(el('p',"権限は選択中の個体だけに適用します。アイデンティティの記述は道具の許可を与えず、すべての操作を後端とサンドボックスが確認します。"));
 panels[1].append(permissionPanel);
 $('windowStart').closest('label').firstChild.textContent="毎日の活動開始時刻（生活タイムゾーン） ";
 $('windowMinutes').closest('label').firstChild.textContent="1日の最大活動時間（1～240分） ";
 const quota=el('p'),saved=el('p');saved.id='savedBirthSetup';panels[1].append(quota,saved);
 const help=el('details');help.append(el('summary',"利用可能なツールと停止条件"),toolsHelp,settingsHelp);panels[1].append(help);
 button('wizardSave',"設定を保存して次へ：プラットフォームを確認",panels[1],async()=>{
  const target=selected,start=$('windowStart').value,minutes=Number($('windowMinutes').value),permissions=formPermissions();
  if(backendReady())permissions.web_domains=normalizedDomains();
  if(permissions.web&&permissions.web_mode!=='public'&&!permissions.web_domains.length)throw Error("許可するドメインを入力するか、ウェブ閲覧の選択を解除してください。");
  if(!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(start)||!Number.isInteger(minutes)||minutes<1||minutes>240)throw Error("開始時間と、1〜240の整数の分数を入力してください。");
  await refresh();if(selected!==target)throw Error("管理対象が切り替わりました。もう一度確認してください。");const c=entity().control;
  if(c.window_start!==start||c.window_minutes!==minutes){await command('window',{start,minutes});await refresh();}
  if(selected!==target)throw Error("管理対象が切り替わりました。もう一度確認してください。");const actual=entity().control.permissions;if(Object.entries(permissions).some(([k,v])=>JSON.stringify(v)!==JSON.stringify(actual[k]??(k==='web_domains'?[]:false))))await command('permissions',permissions);
  await refresh();await loadBirthCheck();const unborn=entity().life.state==='unborn';saved.textContent="時間とツールの設定を保存しました。";go(unborn?3:5);return unborn?"設定を保存しました。次はプラットフォーム状態を確認します。活動時間前でも誕生できます。":"活動を再開せず設定を保存しました。現在の活動状態を確認してください。";
 });
 const platform=el('div');platform.id='wizardPlatform';panels[2].append(platform,globalPanelFlow);
 button('wizardPlatformNext',"次へ：最終確認",panels[2],async()=>{await loadBirthCheck();if(birthCheck.life.state!=='unborn'){go(5);return "活動を再開せずプラットフォーム状態を確認しました。現在の結果をご覧ください。";}if(!birthCheck?.can_confirm)throw Error("この段階に表示された原因を解消してから続けてください。");go(4);return "個体、アイデンティティ、初回活動時間を確認し、あなた自身で誕生を確定してください。";});
 panels[3].append($('birthReview'));const timing=el('p');timing.id='birthTimingHelp';$('birthPreview').after(timing);
 $('birth').textContent="画面に示された個体の初回誕生を確認";
 const recovery=el('div');recovery.id='birthRecovery';panels[3].append(recovery);
 const result=el('div');result.id='birthResult';panels[4].append(result);const inference=el('div');inference.id='inferenceStatus';inference.setAttribute('aria-live','polite');panels[4].append(inference);
 button('wizardEditSettings',"活動時間とツールを調整",panels[4],()=>{go(2);return "保存だけでは活動を再開しません。初回活動の待機中に設定を変えると、元の予定を取り消します。";},false);
 for(let i=1;i<4;i++){const b=button('wizardBack'+i,"前へ",panels[i],null,false);b.onclick=()=>go(i);}
 const controls=el('div');controls.id='livedControls';controls.append(el('h3',"誕生後の活動制御"),$('resume'),$('pause'),$('stop'));lifeSection.append(controls,checkBirth);checkBirth.textContent="現在の状態を再読み込み";
 const diagnostics=el('details');diagnostics.append(el('summary',"記憶・履歴・バックアップ・実行詳細を見る"));for(const id of ['state','historyData','tasks'])diagnostics.append($(id).closest('section'));pageMap.life.append(diagnostics);
 const css=el('style');css.textContent='.birthProgress{display:flex;flex-wrap:wrap;gap:8px;padding:0;list-style:none;counter-reset:step}.birthProgress li{counter-increment:step;background:#eef2ed;padding:10px;border-radius:8px;color:#60716b}.birthProgress li:before{content:counter(step) " · "}.birthProgress li[aria-current=step]{background:#23634c;color:white}.birthProgress li[data-done=true]{background:#dfebe1;color:#23513c}#birthStep2 label{display:block;margin:18px 0}#birthStep4 pre{max-height:none;white-space:pre-wrap}#lifeJourney{display:none}#birthWizard button.primary{margin-top:16px}#savedBirthSetup{color:#37634d}';document.head.append(css);
 function remember(){if(!selected||scope!==selected)return;const m=journeyMemory.read();journeyMemory.write({wizard:{...m.wizard,[selected]:{step,form:{start:$('windowStart').value,minutes:$('windowMinutes').value,...formPermissions()}}}});}
 for(const input of [$('windowStart'),$('windowMinutes'),...Object.values(permissionInputs),domains])input.addEventListener('input',()=>{remember();saved.textContent="未保存です。「設定を保存して次へ」を押してください。";});
 function go(next){step=next;remember();paint();title.tabIndex=-1;title.focus();}
 document.addEventListener('kinseed-birth-step',event=>{const d=event.detail;if(d?.individual_id===selected&&[2,3,5].includes(d.step))go(d.step);});
 function paint(){
  const r=birthCheck;if(!r||r.individual_id!==selected)return;
  if(scope!==selected){scope=selected;const mem=journeyMemory.read().wizard?.[scope];step=mem?.step??1;saved.textContent="保存済みの設定を表示しています。そのまま次へ進めます。";for(const [key,input]of Object.entries(permissionInputs))input.checked=!!r.settings.permissions[key];domains.value=(r.settings.permissions.web_domains??[]).join('\n');webMode.value=r.settings.permissions.web_mode??'public';domainsLabel.hidden=webMode.value==='public';if(mem?.form){$('windowStart').value=mem.form.start;$('windowMinutes').value=mem.form.minutes;for(const [key,input]of Object.entries(permissionInputs))if(mem.form[key]!==undefined)input.checked=!!mem.form[key];if(mem.form.web_domains)domains.value=mem.form.web_domains.join('\n');if(mem.form.web_mode)webMode.value=mem.form.web_mode;domainsLabel.hidden=webMode.value==='public';}}
  const unborn=r.life.state==='unborn';if(!unborn&&![2,3,5].includes(step))step=5;else if(unborn&&step>4)step=1;
  title.textContent=r.name+' · '+(unborn?"初回誕生の準備":"誕生と活動の状態");
  panels.forEach((p,i)=>p.hidden=i+1!==step);[...progress.children].forEach((li,i)=>{li.setAttribute('aria-current',i+1===step?'step':'false');li.dataset.done=String(i+1<step);});
  state.textContent=unborn?"現在は第"+step+"／4段階。"+names[step-1]+"。保存済みの内容は保持されるため、後で続けられます。":step===2?"誕生済み個体の設定変更です。保存しても活動は再開しません。":"誕生の事実と活動状態は別々に表示します。活動を止めても誕生は取り消されません。";
  setupIntro.textContent=unborn?"今、誕生を完了できます。活動時間前なら、誕生後は待機し、指定時刻に最初の活動を始めます。":"この個体は誕生済みです。毎日の時間と道具を変更できますが、初回活動待ちの間に変えると元の予定を取り消します。";
  for(const [key,input]of Object.entries(permissionInputs))input.disabled=key!=='note'&&!backendReady();domains.disabled=!backendReady();
  permissionTarget.textContent="現在の設定対象："+r.name+"。チェック後、下の保存ボタンを押すと有効になります。"+(!backendReady()?" 新しい対話とウェブ機能はコントローラーの更新待ちのため、まだ選択できません。":"権限は後端で毎回確認します。日常の思考とモデルへの相談は同じ利用枠を使います。");
  $('wizardSave').textContent=unborn?"設定を保存して次へ：プラットフォームを確認":"設定を保存して活動状態へ戻る";
  identity.replaceChildren(el('p',"対象個体："+r.name+'（'+r.individual_id+'）'),el('p',r.identity?"承認済みアイデンティティ：「"+r.identity.title+"」第"+r.identity.package_version+"版。アイデンティティを承認しても自動誕生しません。":"承認済みアイデンティティがありません。選択、提出、承認を済ませてから戻ってください。"));
  $('wizardIdentity').hidden=!r.identity;choose.hidden=!!r.identity;
  quota.textContent="この個体の活動時間帯ごとの上限は "+r.settings.max_cycles+" 回のモデル呼び出し。全体の1日上限は "+r.settings.global_limit+"回。日常の思考とモデル相談は枠を共有します。各回は最長2分で、時間帯全体を考え続けるわけではありません。"+(!unborn?" この個体は誕生済みです。初回活動待ちの設定変更は元の予定を取り消し、保存だけでは再開しません。":'');
  saved.textContent=$('windowStart').value===r.settings.window_start&&Number($('windowMinutes').value)===r.settings.window_minutes&&Object.entries(formPermissions()).every(([k,v])=>JSON.stringify(v)===JSON.stringify(r.settings.permissions[k]??(k==='web_domains'?[]:false)))?"現在の時間とツールの設定は保存済みです。":"未保存の変更があります。「設定を保存して次へ」で続けてください。";
  platform.replaceChildren(el('p',r.global_stopped?"プラットフォームは全体停止中です。影響範囲を確認してから、解除するか判断してください。":"個別の許可を受け付けられる状態です。次の手順で他の個体が誕生したり再開したりはしません。"));
  for(const b of r.blockers.filter(b=>b.code!=='ALREADY_LIVED')){if(b.code!=='GLOBAL_STOP')platform.append(el('p',b.message));if(b.code==='GLOBAL_STOP'){const inspect=el('button',"全体停止解除の影響範囲を確認");inspect.onclick=()=>$('globalClear').click();platform.append(inspect);}}
  $('wizardPlatformNext').textContent=unborn?"次へ：最終確認":"活動状態へ戻る";$('wizardPlatformNext').disabled=busy||(unborn?!r.can_confirm:r.global_stopped);
  $('birthReview').hidden=!unborn;$('birthPreview').textContent="対象："+r.name+'（'+r.individual_id+"）\n承認済みアイデンティティ：「"+(r.identity?.title??"未承認")+"」第"+(r.identity?.package_version??'?')+"版\n毎日 "+r.settings.window_start+" から、最大 "+r.settings.window_minutes+" 分間\nこの個体の活動上限："+r.settings.max_cycles+" 回。プラットフォーム共用の1日上限："+r.settings.global_limit+" 回\n制御されたノート追加："+(r.settings.permissions.note?"許可":"許可しない")+"\n今回の初回活動："+time(r.next_window_start)+"\n今回の許可の最終終了時刻："+time(r.first_window.end);
  if(backendReady())$('birthPreview').textContent+="\n公開Webの閲覧："+(r.settings.permissions.web?(r.settings.permissions.web_mode==='public'?"許可、すべての公開HTTPSサイト": "許可、指定サイト一覧"):"いいえ")+"\nLLMへの自発的な相談："+(r.settings.permissions.consult?"許可、相談ごとに別途モデル回数を消費":"いいえ")+"\nOwnerとの双方向対話：すべての個体の基本機能";
  timing.textContent="確認すると直ちに誕生を記録します。"+(r.window_open?"現在は活動時間帯内なので、最初のラウンドを開始できます。":"まだ活動時間前のため、誕生後も上記時刻まで待機し、前倒しで活動しません。")+" 今回の許可はこの個体と上記の時間だけに適用します。誕生は永久に残り、停止しても取り消されません。時間帯を逃したりコントローラーを再起動したりしても自動で補完実行しません。";
  $('birth').disabled=busy||!r.can_confirm||!$('birthConfirm').checked;
  recovery.replaceChildren();if(unborn&&!r.can_confirm){recovery.append(el('p',"要件はまだ整っていません。アイデンティティと設定は保持されています。"));const b=el('button',"第3段階へ戻り、原因を解消");b.onclick=()=>go(3);recovery.append(b);}
  controls.hidden=unborn||step!==5;$('resume').disabled=unborn||entity().control.mode==='running'||busy;
  if(!unborn){const c=entity().control;result.replaceChildren(el('p',r.name+' '+(r.born_at?"誕生済み。誕生日時："+time(r.born_at):"以前の活動記録があります。")),el('p',"アイデンティティ：「"+(r.identity?.title??"以前のアイデンティティ")+"」第"+(r.identity?.package_version??r.identity?.version??'?')+"版"),el('p',"毎日 "+r.settings.window_start+" から、最大 "+r.settings.window_minutes+" 分間"),el('p',r.global_stopped||r.individual_stopped||c.mode!=='running'?"現在の活動は停止中です。自動では再開しません。":r.next_activity>Date.now()?(c.next_wake?.source==='provider-retry'?"モデルが混雑中です。再試行予定："+time(r.next_activity)+" に自動再試行します。手動再開は不要です。":c.next_wake?.source==='birth-scheduled'?"誕生済み。開始予定の "+time(r.next_activity)+" から初回活動を開始します。":"次の活動予定："+time(r.next_activity)):r.next_activity?"次の活動予定："+time(r.next_activity):entity().lease?"この活動ラウンドを実行中です。":"現在、実行待ちの活動はありません。"),el('p',"停止やコントローラーの再起動後は、別途明示的に再開してください。誕生を繰り返す必要はありません。"));}
  const e=entity(),info=e.control.inference_status,policy=e.inference_policy;inference.replaceChildren(el('h3',"モデルと活動の状態"),el('p',"指定された固定モデル："+(policy?.model??"更新前は未指定")+"。別のモデルへ自動切り替えしません。"));if(e.lease)inference.append(el('p',e.control.provider_retry?.retries?"第"+e.control.provider_retry.retries+"回の再試行を実行中です。":"この活動ラウンドを実行中です。"));else if(e.control.next_wake?.source==='provider-retry')inference.append(el('p',"モデルが一時的に混雑しています。予定時刻："+time(e.control.next_wake.at)+" に自動で第"+info.retries+'／'+info.max_retries+"回の再試行をします。再開ボタンを押す必要はありません。"));else if(info)inference.append(el('p',info.message));else if(e.control.reason)inference.append(el('p',"現在の状態："+(e.control.reason==='控制器已關閉；下次需明確恢復'?"コントローラーを再起動しました。Ownerが明示的に再開するまで、この個体は停止したままです":e.control.reason)));if(e.controller_health)inference.append(el('p',e.controller_health.message),el('p',"次の操作："+e.controller_health.action));inference.append(el('p',"容量不足は30秒、90秒、180秒後の最大3回まで再試行し、毎回活動枠に数えます。停止、時間終了、権限変更で待機を取り消します。一時切断は処理終了と未書込を確認できる場合のみ有限再試行します。提出済み記憶は照合し、同じ回を繰り返しません。一部書込、結果不明、ログインや枠の問題は記録して再送を止めます。"));
  remember();
 }
 const oldReadiness=renderReadiness;renderReadiness=function(r){oldReadiness(r);paint();};
 const oldRender=render;render=function(){oldRender();paint();for(const card of cards.children)for(const b of card.querySelectorAll('button'))if(b.textContent==="生活と記憶を見る")b.textContent="状態を見る・誕生準備を続ける";};
 bind('globalClear',async()=>{navigate('life');await loadBirthCheck();go(3);return showGlobalImpact();});
 // Async handlers retain one primary next action. The global emergency stop remains available.
 const oldNavigate=navigate;navigate=function(page){oldNavigate(page);if(page==='life')paint();};
 paint();
})();
