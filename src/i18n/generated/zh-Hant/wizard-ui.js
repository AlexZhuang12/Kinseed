// One visible step; existing authenticated review/birth/stop handlers remain authoritative.
(()=>{
 const time=t=>new Date(t).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false});
 let scope=null,step=1;
 const legacy=el('div');legacy.hidden=true;while(lifeSection.children.length)legacy.append(lifeSection.firstChild);lifeSection.append(legacy);
 const title=el('h2',"一步一步完成首次出生"),progress=el('ol');progress.className='birthProgress';progress.setAttribute('aria-label',"出生準備進度");
 const names=["確認對象與身份","設定時間與工具","確認平台狀態","親自確認出生","出生結果"];
 const panels=names.map((name,i)=>{progress.append(el('li',name));const pane=el('div');pane.id='birthStep'+(i+1);pane.hidden=true;pane.append(el('h3',"第"+(i+1)+"步｜"+name));return pane;});
 const state=el('p');state.id='wizardStatus';state.setAttribute('aria-live','polite');lifeSection.append(title,progress,state,...panels);
 const button=(id,text,parent,fn,primary=true)=>{const b=el('button',text);b.id=id;b.className=primary?'primary':'';parent.append(b);if(fn)bind(id,fn);return b;};
 const identity=el('div');panels[0].append(identity);
 button('wizardIdentity',"下一步：設定生活時間與工具",panels[0],()=>{if(!birthCheck?.identity)throw Error('IDENTITY_NOT_APPROVED');go(2);return "下一步：可以先設定好時間，現在完成出生，不必等到時段內。";});
 const choose=button('wizardChooseIdentity',"選擇身份或繼續既有審核",panels[0],async()=>{const target=selected,b=await api('builder');if(selected!==target)throw Error("管理對象已切換，請重新核對。");$('builderTarget').value=target;const pending=b.reviews.filter(r=>r.individual_id===target&&r.status==='pending').at(-1);if(pending){await builderRefresh();$('reviewList').value=pending.review_id;reviewShown=await bread('reviewPreview',{review_id:pending.review_id});renderReview(reviewShown);navigate('review');return "已開啟這個個體原有的待審提案，不會重複提交。核對並批准後，按「查看這個個體的生活設定」繼續。";}navigate('library');return "請選擇身份版本並提交審核；批准後回到「生活與記憶」繼續出生準備。";});
 const setupIntro=el('p');panels[1].append(setupIntro);
 for(const id of ['windowStart','windowMinutes'])panels[1].append($(id).closest('label'));
 const permissionPanel=el('section');permissionPanel.id='ownerPermissionOptions';permissionPanel.append(el('h3',"這個個體可以做什麼？"),el('p',"只有「可自行勾選」的項目能在此開關。生活必備能力會列出但不能取消；尚未開放的能力不可勾選，避免誤以為已授權。"));
 const permissionTarget=el('p');permissionTarget.id='permissionTarget';permissionPanel.append(permissionTarget,el('p',"LLM大腦：固定使用 GPT-6.1-Sol。每輪讀取自己的身份與記憶，思考後保存進度；屬於生活基本能力，不需要另外開通。"));const permissionInputs={note:$('notePermission')};
 for(const [group,title]of [['optional',"可自行勾選"],['required',"生活必備（固定啟用）"],['unavailable',"尚未開放（目前無法授權）"]]){
  const rows=ownerPermissionRows.filter(r=>r.group===group),container=group==='optional'?el('fieldset'):el('details');
  container.append(el(group==='optional'?'legend':'summary',title+' · '+rows.length+" 項"));if(group==='optional')container.id='optionalPermissions';
  for(const row of rows){if(row.id==='chat'){container.append(el('p',row.title+'：'+row.description));continue;}let label,input;if(row.id==='note'){label=$('notePermission').closest('label');input=$('notePermission');label.lastChild.textContent=' '+row.title;}
   else {label=el('label');input=el('input');input.type='checkbox';input.id='permission-'+row.id;input.disabled=group!=='optional';input.checked=group==='required';input.setAttribute('aria-label',row.title+(group==='required'?"（生活必備）":''));label.append(input,document.createTextNode(' '+row.title));if(group==='optional')permissionInputs[row.id]=input;}
   const description=el('p',row.description);description.id='permissionHelp-'+row.id;input.setAttribute('aria-describedby',description.id);container.append(label,description);
  }if(rows.length)permissionPanel.append(container);
 }
 const domainsLabel=el('label',"允許瀏覽的網站網域（每行一個，舊設定相容） "),domains=el('textarea');domains.id='webDomains';domains.placeholder="例如：www.wikipedia.org\n只能填網站網域，不含網址路徑；www與其他子網域需分別列出。";domainsLabel.append(domains);permissionPanel.append(domainsLabel,el('p',"公開模式不用填網域。可讀動態網站、不帶入Owner登入資料；上傳筆記需逐次批准。網路額度請至「網路用量與分配」查看；用完只暫停外網。"));
 const webMode=el('select');webMode.id='webMode';for(const [value,title]of [['public',"所有公開HTTPS網站（隔離瀏覽器）"],['allowlist',"沿用指定網站清單"]]){const o=el('option',title);o.value=value;webMode.append(o);}const modeLabel=el('label',"瀏覽範圍 ");modeLabel.append(webMode);domainsLabel.before(modeLabel);webMode.onchange=()=>{domainsLabel.hidden=webMode.value==='public';remember();};
 const backendReady=()=>status?.capabilities?.version===1;
 const normalizedDomains=()=>{const rows=domains.value.split(/[\s,，]+/).filter(Boolean);return [...new Set(rows.map(x=>{if(/[/:@?#*\\]/.test(x))throw Error("請只填網站網域，例如 zh.wikipedia.org，不含 https:// 或路徑。");let host;try{host=new URL('https://'+x).hostname;}catch{throw Error("請檢查網站網域的寫法。");}if(!host.includes('.')||host.endsWith('.')||/^\d+\./.test(host)||!host.split('.').every(v=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(v))||/(^|\.)(localhost|local|internal|invalid|test|example|home|onion)$/.test(host))throw Error("請填寫公開網站網域，不能使用本機或私人網路。");return host;}))];};
 const formPermissions=()=>{let list;try{list=normalizedDomains();}catch{list=domains.value.split(/[\s,，]+/).filter(Boolean);}return {note:permissionInputs.note.checked,...(backendReady()?{consult:permissionInputs.consult.checked,chat:true,web:permissionInputs.web.checked,web_domains:list,web_mode:webMode.value}:{})};};
 permissionPanel.append(el('p',"權限只作用於目前選取的個體，不會更改其他個體。身份描述不會另外授予工具；所有操作仍由後端及沙箱檢查。"));
 panels[1].append(permissionPanel);
 $('windowStart').closest('label').firstChild.textContent="每天何時開始活動（生活時區） ";
 $('windowMinutes').closest('label').firstChild.textContent="每天最多可活動多久（分鐘，1–240） ";
 const quota=el('p'),saved=el('p');saved.id='savedBirthSetup';panels[1].append(quota,saved);
 const help=el('details');help.append(el('summary',"可用工具及何時停止"),toolsHelp,settingsHelp);panels[1].append(help);
 button('wizardSave',"保存設定，下一步：檢查平台",panels[1],async()=>{
  const target=selected,start=$('windowStart').value,minutes=Number($('windowMinutes').value),permissions=formPermissions();
  if(backendReady())permissions.web_domains=normalizedDomains();
  if(permissions.web&&permissions.web_mode!=='public'&&!permissions.web_domains.length)throw Error("請先填寫允許瀏覽的網站網域，或取消網頁瀏覽勾選。");
  if(!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(start)||!Number.isInteger(minutes)||minutes<1||minutes>240)throw Error("請填寫開始時間，以及1到240之間的整數分鐘。");
  await refresh();if(selected!==target)throw Error("管理對象已切換，請重新核對。");const c=entity().control;
  if(c.window_start!==start||c.window_minutes!==minutes){await command('window',{start,minutes});await refresh();}
  if(selected!==target)throw Error("管理對象已切換，請重新核對。");const actual=entity().control.permissions;if(Object.entries(permissions).some(([k,v])=>JSON.stringify(v)!==JSON.stringify(actual[k]??(k==='web_domains'?[]:false))))await command('permissions',permissions);
  await refresh();await loadBirthCheck();const unborn=entity().life.state==='unborn';saved.textContent="時間與工具設定已保存。";go(unborn?3:5);return unborn?"設定已保存。下一步：確認平台狀態，不用等到生活時段才出生。":"設定已保存，沒有恢復活動。請查看目前活動狀態。";
 });
 const platform=el('div');platform.id='wizardPlatform';panels[2].append(platform,globalPanelFlow);
 button('wizardPlatformNext',"下一步：最後核對",panels[2],async()=>{await loadBirthCheck();if(birthCheck.life.state!=='unborn'){go(5);return "平台狀態已核對；沒有恢復活動，請查看目前結果。";}if(!birthCheck?.can_confirm)throw Error("請先處理本步畫面顯示的原因，再繼續。");go(4);return "請核對個體、身份及首次活動時間，由您親自確認出生。";});
 panels[3].append($('birthReview'));const timing=el('p');timing.id='birthTimingHelp';$('birthPreview').after(timing);
 $('birth').textContent="確認讓畫面指定的個體首次出生";
 const recovery=el('div');recovery.id='birthRecovery';panels[3].append(recovery);
 const result=el('div');result.id='birthResult';panels[4].append(result);const inference=el('div');inference.id='inferenceStatus';inference.setAttribute('aria-live','polite');panels[4].append(inference);
 button('wizardEditSettings',"調整生活時間與工具",panels[4],()=>{go(2);return "保存設定不會恢復活動；若原本在等待首次活動，修改設定會先取消該次安排。";},false);
 for(let i=1;i<4;i++){const b=button('wizardBack'+i,"上一步",panels[i],null,false);b.onclick=()=>go(i);}
 const controls=el('div');controls.id='livedControls';controls.append(el('h3',"出生後的活動控制"),$('resume'),$('pause'),$('stop'));lifeSection.append(controls,checkBirth);checkBirth.textContent="重新讀取目前狀態";
 const diagnostics=el('details');diagnostics.append(el('summary',"查看記憶、歷史、備份及執行詳情"));for(const id of ['state','historyData','tasks'])diagnostics.append($(id).closest('section'));pageMap.life.append(diagnostics);
 const css=el('style');css.textContent='.birthProgress{display:flex;flex-wrap:wrap;gap:8px;padding:0;list-style:none;counter-reset:step}.birthProgress li{counter-increment:step;background:#eef2ed;padding:10px;border-radius:8px;color:#60716b}.birthProgress li:before{content:counter(step) " · "}.birthProgress li[aria-current=step]{background:#23634c;color:white}.birthProgress li[data-done=true]{background:#dfebe1;color:#23513c}#birthStep2 label{display:block;margin:18px 0}#birthStep4 pre{max-height:none;white-space:pre-wrap}#lifeJourney{display:none}#birthWizard button.primary{margin-top:16px}#savedBirthSetup{color:#37634d}';document.head.append(css);
 function remember(){if(!selected||scope!==selected)return;const m=journeyMemory.read();journeyMemory.write({wizard:{...m.wizard,[selected]:{step,form:{start:$('windowStart').value,minutes:$('windowMinutes').value,...formPermissions()}}}});}
 for(const input of [$('windowStart'),$('windowMinutes'),...Object.values(permissionInputs),domains])input.addEventListener('input',()=>{remember();saved.textContent="尚未保存；請按「保存設定，下一步」繼續。";});
 function go(next){step=next;remember();paint();title.tabIndex=-1;title.focus();}
 document.addEventListener('kinseed-birth-step',event=>{const d=event.detail;if(d?.individual_id===selected&&[2,3,5].includes(d.step))go(d.step);});
 function paint(){
  const r=birthCheck;if(!r||r.individual_id!==selected)return;
  if(scope!==selected){scope=selected;const mem=journeyMemory.read().wizard?.[scope];step=mem?.step??1;saved.textContent="目前顯示已保存的設定；可直接按下一步。";for(const [key,input]of Object.entries(permissionInputs))input.checked=!!r.settings.permissions[key];domains.value=(r.settings.permissions.web_domains??[]).join('\n');webMode.value=r.settings.permissions.web_mode??'public';domainsLabel.hidden=webMode.value==='public';if(mem?.form){$('windowStart').value=mem.form.start;$('windowMinutes').value=mem.form.minutes;for(const [key,input]of Object.entries(permissionInputs))if(mem.form[key]!==undefined)input.checked=!!mem.form[key];if(mem.form.web_domains)domains.value=mem.form.web_domains.join('\n');if(mem.form.web_mode)webMode.value=mem.form.web_mode;domainsLabel.hidden=webMode.value==='public';}}
  const unborn=r.life.state==='unborn';if(!unborn&&![2,3,5].includes(step))step=5;else if(unborn&&step>4)step=1;
  title.textContent=r.name+' · '+(unborn?"首次出生準備":"出生與活動狀態");
  panels.forEach((p,i)=>p.hidden=i+1!==step);[...progress.children].forEach((li,i)=>{li.setAttribute('aria-current',i+1===step?'step':'false');li.dataset.done=String(i+1<step);});
  state.textContent=unborn?"目前第"+step+"／4步。"+names[step-1]+"；已保存的內容會保留，可稍後繼續。":step===2?"調整已出生個體的設定；保存不會恢復活動。":"出生事實與活動狀態分開顯示，停止活動不會撤銷出生。";
  setupIntro.textContent=unborn?"您可以現在完成出生。尚未到生活時間時，出生後會等待，到了指定時間才開始第一次活動。":"此個體已出生。您可以調整每天的活動時間與工具；若正在等待首次活動，修改設定會取消原安排。";
  for(const [key,input]of Object.entries(permissionInputs))input.disabled=key!=='note'&&!backendReady();domains.disabled=!backendReady();
  permissionTarget.textContent="目前設定對象："+r.name+"。勾選後請按下方保存，才會生效。"+(!backendReady()?" 新增對話與網頁能力尚待控制器更新，目前不能勾選。":"每項授權都會在後端重新檢查；LLM日常思考與主動諮詢共用模型額度。");
  $('wizardSave').textContent=unborn?"保存設定，下一步：檢查平台":"保存設定，返回活動狀態";
  identity.replaceChildren(el('p',"指定個體："+r.name+'（'+r.individual_id+'）'),el('p',r.identity?"已批准身份：「"+r.identity.title+"」第"+r.identity.package_version+"版。批准身份不會自動出生。":"尚未有已批准身份。請先選擇、提交並批准，再回來繼續。"));
  $('wizardIdentity').hidden=!r.identity;choose.hidden=!!r.identity;
  quota.textContent="此個體每個生活時段最多"+r.settings.max_cycles+"次模型請求，平台全體每天最多"+r.settings.global_limit+"次；日常思考與主動諮詢共用額度。每輪最多2分鐘，並非整段時段持續思考。"+(!unborn?" 此個體已出生；修改等待中的首次活動設定會先取消原安排，保存不會恢復活動。":'');
  saved.textContent=$('windowStart').value===r.settings.window_start&&Number($('windowMinutes').value)===r.settings.window_minutes&&Object.entries(formPermissions()).every(([k,v])=>JSON.stringify(v)===JSON.stringify(r.settings.permissions[k]??(k==='web_domains'?[]:false)))?"目前時間與工具設定已保存。":"尚有未保存的修改；請按「保存設定，下一步」繼續。";
  platform.replaceChildren(el('p',r.global_stopped?"平台目前全域停止。先查看解除範圍，再由您決定是否解除。":"平台已可接受個別授權；其他個體不會因下一步而出生或恢復。"));
  for(const b of r.blockers.filter(b=>b.code!=='ALREADY_LIVED')){if(b.code!=='GLOBAL_STOP')platform.append(el('p',b.message));if(b.code==='GLOBAL_STOP'){const inspect=el('button',"查看解除平台停止的影響範圍");inspect.onclick=()=>$('globalClear').click();platform.append(inspect);}}
  $('wizardPlatformNext').textContent=unborn?"下一步：最後核對":"返回活動狀態";$('wizardPlatformNext').disabled=busy||(unborn?!r.can_confirm:r.global_stopped);
  $('birthReview').hidden=!unborn;$('birthPreview').textContent="對象："+r.name+'（'+r.individual_id+"）\n已批准身份：「"+(r.identity?.title??"未批准")+"」第"+(r.identity?.package_version??'?')+"版\n每日 "+r.settings.window_start+" 起，最多 "+r.settings.window_minutes+" 分鐘\n此個體活動上限："+r.settings.max_cycles+"輪；平台每日共用上限："+r.settings.global_limit+"輪\n受控新增筆記："+(r.settings.permissions.note?"允許":"不允許")+"\n這次第一次活動："+time(r.next_window_start)+"\n這次授權最晚結束："+time(r.first_window.end);
  if(backendReady())$('birthPreview').textContent+="\n允許公開網頁："+(r.settings.permissions.web?(r.settings.permissions.web_mode==='public'?"是，所有公開HTTPS網站": "是，指定網站清單"):"否")+"\n允許主動請教LLM："+(r.settings.permissions.consult?"是，每次另計模型輪數":"否")+"\nOwner雙向互動：所有個體的基本能力";
  timing.textContent="按下確認後立即記錄出生。"+(r.window_open?"目前在時段內，可開始第一輪活動。":"尚未到時段，出生後會等待到上述時間，不會提前活動。")+" 這次只授權此個體與上述時段。出生事實永久保留；停止會取消活動，但不會撤銷出生。錯過此時段或重啟控制器不會自動補跑。";
  $('birth').disabled=busy||!r.can_confirm||!$('birthConfirm').checked;
  recovery.replaceChildren();if(unborn&&!r.can_confirm){recovery.append(el('p',"目前條件尚未完成，身份與設定均保留。"));const b=el('button',"回第3步處理原因");b.onclick=()=>go(3);recovery.append(b);}
  controls.hidden=unborn||step!==5;$('resume').disabled=unborn||entity().control.mode==='running'||busy;
  if(!unborn){const c=entity().control;result.replaceChildren(el('p',r.name+' '+(r.born_at?"已出生，出生時間："+time(r.born_at):"已有早期生活紀錄。")),el('p',"身份：「"+(r.identity?.title??"早期身份")+"」第"+(r.identity?.package_version??r.identity?.version??'?')+"版"),el('p',"每日 "+r.settings.window_start+" 起，最多 "+r.settings.window_minutes+" 分鐘"),el('p',entity().daily_life?.enabled?(entity().controller_health?.message??"每日生活授權保留，等待執行條件。"):r.global_stopped||r.individual_stopped||c.mode!=='running'?"目前活動已停止，不會自動恢復。":r.next_activity>Date.now()?(c.next_wake?.source==='provider-retry'?"模型繁忙，等待於 "+time(r.next_activity)+" 自動重試，不需手動恢復。":c.next_wake?.source==='birth-scheduled'?"已出生，等待於 "+time(r.next_activity)+" 開始第一次活動。":"下一次預定活動："+time(r.next_activity)):r.next_activity?"下一次預定活動："+time(r.next_activity):entity().lease?"正在執行本輪活動。":"目前沒有待執行活動。"),el('p',"出生不需重做。每日授權仍開啟時，重啟會重新核對後依原安排執行；Owner明確停止後不自行恢復。"));}
  const e=entity(),info=e.control.inference_status,policy=e.inference_policy;inference.replaceChildren(el('h3',"模型與活動狀態"),el('p',"固定模型："+(policy?.model??"更新前未指定")+"；不自動切換其他模型。"));if(e.lease)inference.append(el('p',e.control.provider_retry?.retries?"正在執行第"+e.control.provider_retry.retries+"次重試。":"正在執行本輪活動。"));else if(e.control.next_wake?.source==='provider-retry')inference.append(el('p',"模型暫時繁忙；預定 "+time(e.control.next_wake.at)+" 自動進行第"+info.retries+'／'+info.max_retries+"次重試，您不必按恢復。"));else if(info)inference.append(el('p',info.message));else if(e.control.reason)inference.append(el('p',"目前狀態："+(e.control.reason==='控制器已關閉；下次需明確恢復'?"控制器已重新開啟；此個體保持停止，等待 Owner 明確恢復":e.control.reason)));if(e.controller_health)inference.append(el('p',e.controller_health.message),el('p',"下一步："+e.controller_health.action));inference.append(el('p',"容量不足最多重試3次，分別等待30秒、90秒、180秒；每次都計入活動輪數。停止、時段結束或權限變更會取消等待。可確認程序結束且未寫入的暫時斷線也可有限重試；已有記憶提交則核對後接續，不重做本輪。部分寫入、結果不明、登入或額度問題保留紀錄並停止重送。"));
  remember();
 }
 const oldReadiness=renderReadiness;renderReadiness=function(r){oldReadiness(r);paint();};
 const oldRender=render;render=function(){oldRender();paint();for(const card of cards.children)for(const b of card.querySelectorAll('button'))if(b.textContent==="查看生活與記憶")b.textContent="查看狀態／繼續出生準備";};
 bind('globalClear',async()=>{navigate('life');await loadBirthCheck();go(3);return showGlobalImpact();});
 // Async handlers retain one primary next action. The global emergency stop remains available.
 const oldNavigate=navigate;navigate=function(page){oldNavigate(page);if(page==='life')paint();};
 paint();
})();
