// One visible step; existing authenticated review/birth/stop handlers remain authoritative.
(()=>{
 const time=t=>new Date(t).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false});
 let scope=null,step=1;
 const legacy=el('div');legacy.hidden=true;while(lifeSection.children.length)legacy.append(lifeSection.firstChild);lifeSection.append(legacy);
 const title=el('h2',"一步一步完成首次出生"),progress=el('ol');progress.className='birthProgress';progress.setAttribute('aria-label',"出生准备进度");
 const names=["确认对象与身份","设置时间与工具","确认平台状态","亲自确认出生","出生结果"];
 const panels=names.map((name,i)=>{progress.append(el('li',name));const pane=el('div');pane.id='birthStep'+(i+1);pane.hidden=true;pane.append(el('h3',"第"+(i+1)+"步｜"+name));return pane;});
 const state=el('p');state.id='wizardStatus';state.setAttribute('aria-live','polite');lifeSection.append(title,progress,state,...panels);
 const button=(id,text,parent,fn,primary=true)=>{const b=el('button',text);b.id=id;b.className=primary?'primary':'';parent.append(b);if(fn)bind(id,fn);return b;};
 const identity=el('div');panels[0].append(identity);
 button('wizardIdentity',"下一步：设置生活时间与工具",panels[0],()=>{if(!birthCheck?.identity)throw Error('IDENTITY_NOT_APPROVED');go(2);return "下一步：可以先设置好时间，现在完成出生，不必等到时段内。";});
 const choose=button('wizardChooseIdentity',"选择身份或继续既有审核",panels[0],async()=>{const target=selected,b=await api('builder');if(selected!==target)throw Error("管理对象已切换，请重新核对。");$('builderTarget').value=target;const pending=b.reviews.filter(r=>r.individual_id===target&&r.status==='pending').at(-1);if(pending){await builderRefresh();$('reviewList').value=pending.review_id;reviewShown=await bread('reviewPreview',{review_id:pending.review_id});renderReview(reviewShown);navigate('review');return "已打开这个个体原有的待审提案，不会重复提交。核对并批准后，按「查看这个个体的生活设置」继续。";}navigate('library');return "请选择身份版本并提交审核；批准后回到「生活与记忆」继续出生准备。";});
 const setupIntro=el('p');panels[1].append(setupIntro);
 for(const id of ['windowStart','windowMinutes'])panels[1].append($(id).closest('label'));
 const permissionPanel=el('section');permissionPanel.id='ownerPermissionOptions';permissionPanel.append(el('h3',"这个个体可以做什么？"),el('p',"只有「可自行勾选」的项目能在此开关。生活必备能力会列出但不能取消；尚未开放的能力不可勾选，避免误以为已授权。"));
 const permissionTarget=el('p');permissionTarget.id='permissionTarget';permissionPanel.append(permissionTarget,el('p',"LLM大脑：固定使用 GPT-6.1-Sol。每轮读取自己的身份与记忆，思考后保存进度；属于生活基本能力，不需要另外开通。"));const permissionInputs={note:$('notePermission')};
 for(const [group,title]of [['optional',"可自行勾选"],['required',"生活必备（固定激活）"],['unavailable',"尚未开放（目前无法授权）"]]){
  const rows=ownerPermissionRows.filter(r=>r.group===group),container=group==='optional'?el('fieldset'):el('details');
  container.append(el(group==='optional'?'legend':'summary',title+' · '+rows.length+" 项"));if(group==='optional')container.id='optionalPermissions';
  for(const row of rows){if(row.id==='chat'){container.append(el('p',row.title+'：'+row.description));continue;}let label,input;if(row.id==='note'){label=$('notePermission').closest('label');input=$('notePermission');label.lastChild.textContent=' '+row.title;}
   else {label=el('label');input=el('input');input.type='checkbox';input.id='permission-'+row.id;input.disabled=group!=='optional';input.checked=group==='required';input.setAttribute('aria-label',row.title+(group==='required'?"（生活必备）":''));label.append(input,document.createTextNode(' '+row.title));if(group==='optional')permissionInputs[row.id]=input;}
   const description=el('p',row.description);description.id='permissionHelp-'+row.id;input.setAttribute('aria-describedby',description.id);container.append(label,description);
  }if(rows.length)permissionPanel.append(container);
 }
 const domainsLabel=el('label',"允许浏览的网站网域（每行一个，旧设置兼容） "),domains=el('textarea');domains.id='webDomains';domains.placeholder="例如：www.wikipedia.org\n只能填网站网域，不含网址路径；www与其他子网域需分别列出。";domainsLabel.append(domains);permissionPanel.append(domainsLabel,el('p',"公开模式不用填网域。可读动态网站、不带入Owner登录数据；上传笔记需逐次批准。网络额度请至「网络用量与分配」查看；用完只暂停外网。"));
 const webMode=el('select');webMode.id='webMode';for(const [value,title]of [['public',"所有公开HTTPS网站（隔离浏览器）"],['allowlist',"沿用指定网站清单"]]){const o=el('option',title);o.value=value;webMode.append(o);}const modeLabel=el('label',"浏览范围 ");modeLabel.append(webMode);domainsLabel.before(modeLabel);webMode.onchange=()=>{domainsLabel.hidden=webMode.value==='public';remember();};
 const backendReady=()=>status?.capabilities?.version===1;
 const normalizedDomains=()=>{const rows=domains.value.split(/[\s,，]+/).filter(Boolean);return [...new Set(rows.map(x=>{if(/[/:@?#*\\]/.test(x))throw Error("请只填网站网域，例如 zh.wikipedia.org，不含 https:// 或路径。");let host;try{host=new URL('https://'+x).hostname;}catch{throw Error("请检查网站网域的写法。");}if(!host.includes('.')||host.endsWith('.')||/^\d+\./.test(host)||!host.split('.').every(v=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(v))||/(^|\.)(localhost|local|internal|invalid|test|example|home|onion)$/.test(host))throw Error("请填写公开网站网域，不能使用本机或私人网络。");return host;}))];};
 const formPermissions=()=>{let list;try{list=normalizedDomains();}catch{list=domains.value.split(/[\s,，]+/).filter(Boolean);}return {note:permissionInputs.note.checked,...(backendReady()?{consult:permissionInputs.consult.checked,chat:true,web:permissionInputs.web.checked,web_domains:list,web_mode:webMode.value}:{})};};
 permissionPanel.append(el('p',"权限只作用于目前选取的个体，不会更改其他个体。身份描述不会另外授予工具；所有操作仍由后端及沙箱检查。"));
 panels[1].append(permissionPanel);
 $('windowStart').closest('label').firstChild.textContent="每天何时开始活动（生活时区） ";
 $('windowMinutes').closest('label').firstChild.textContent="每天最多可活动多久（分钟，1–240） ";
 const quota=el('p'),saved=el('p');saved.id='savedBirthSetup';panels[1].append(quota,saved);
 const help=el('details');help.append(el('summary',"可用工具及何时停止"),toolsHelp,settingsHelp);panels[1].append(help);
 button('wizardSave',"保存设置，下一步：检查平台",panels[1],async()=>{
  const target=selected,start=$('windowStart').value,minutes=Number($('windowMinutes').value),permissions=formPermissions();
  if(backendReady())permissions.web_domains=normalizedDomains();
  if(permissions.web&&permissions.web_mode!=='public'&&!permissions.web_domains.length)throw Error("请先填写允许浏览的网站网域，或取消网页浏览勾选。");
  if(!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(start)||!Number.isInteger(minutes)||minutes<1||minutes>240)throw Error("请填写开始时间，以及1到240之间的整数分钟。");
  await refresh();if(selected!==target)throw Error("管理对象已切换，请重新核对。");const c=entity().control;
  if(c.window_start!==start||c.window_minutes!==minutes){await command('window',{start,minutes});await refresh();}
  if(selected!==target)throw Error("管理对象已切换，请重新核对。");const actual=entity().control.permissions;if(Object.entries(permissions).some(([k,v])=>JSON.stringify(v)!==JSON.stringify(actual[k]??(k==='web_domains'?[]:false))))await command('permissions',permissions);
  await refresh();await loadBirthCheck();const unborn=entity().life.state==='unborn';saved.textContent="时间与工具设置已保存。";go(unborn?3:5);return unborn?"设置已保存。下一步：确认平台状态，不用等到生活时段才出生。":"设置已保存，没有恢复活动。请查看目前活动状态。";
 });
 const platform=el('div');platform.id='wizardPlatform';panels[2].append(platform,globalPanelFlow);
 button('wizardPlatformNext',"下一步：最后核对",panels[2],async()=>{await loadBirthCheck();if(birthCheck.life.state!=='unborn'){go(5);return "平台状态已核对；没有恢复活动，请查看目前结果。";}if(!birthCheck?.can_confirm)throw Error("请先处理本步画面显示的原因，再继续。");go(4);return "请核对个体、身份及首次活动时间，由您亲自确认出生。";});
 panels[3].append($('birthReview'));const timing=el('p');timing.id='birthTimingHelp';$('birthPreview').after(timing);
 $('birth').textContent="确认让画面指定的个体首次出生";
 const recovery=el('div');recovery.id='birthRecovery';panels[3].append(recovery);
 const result=el('div');result.id='birthResult';panels[4].append(result);const inference=el('div');inference.id='inferenceStatus';inference.setAttribute('aria-live','polite');panels[4].append(inference);
 button('wizardEditSettings',"调整生活时间与工具",panels[4],()=>{go(2);return "保存设置不会恢复活动；若原本在等待首次活动，修改设置会先取消该次安排。";},false);
 for(let i=1;i<4;i++){const b=button('wizardBack'+i,"上一步",panels[i],null,false);b.onclick=()=>go(i);}
 const controls=el('div');controls.id='livedControls';controls.append(el('h3',"出生后的活动控制"),$('resume'),$('pause'),$('stop'));lifeSection.append(controls,checkBirth);checkBirth.textContent="重新读取目前状态";
 const diagnostics=el('details');diagnostics.append(el('summary',"查看记忆、历史、备份及运行详情"));for(const id of ['state','historyData','tasks'])diagnostics.append($(id).closest('section'));pageMap.life.append(diagnostics);
 const css=el('style');css.textContent='.birthProgress{display:flex;flex-wrap:wrap;gap:8px;padding:0;list-style:none;counter-reset:step}.birthProgress li{counter-increment:step;background:#eef2ed;padding:10px;border-radius:8px;color:#60716b}.birthProgress li:before{content:counter(step) " · "}.birthProgress li[aria-current=step]{background:#23634c;color:white}.birthProgress li[data-done=true]{background:#dfebe1;color:#23513c}#birthStep2 label{display:block;margin:18px 0}#birthStep4 pre{max-height:none;white-space:pre-wrap}#lifeJourney{display:none}#birthWizard button.primary{margin-top:16px}#savedBirthSetup{color:#37634d}';document.head.append(css);
 function remember(){if(!selected||scope!==selected)return;const m=journeyMemory.read();journeyMemory.write({wizard:{...m.wizard,[selected]:{step,form:{start:$('windowStart').value,minutes:$('windowMinutes').value,...formPermissions()}}}});}
 for(const input of [$('windowStart'),$('windowMinutes'),...Object.values(permissionInputs),domains])input.addEventListener('input',()=>{remember();saved.textContent="尚未保存；请按「保存设置，下一步」继续。";});
 function go(next){step=next;remember();paint();title.tabIndex=-1;title.focus();}
 document.addEventListener('kinseed-birth-step',event=>{const d=event.detail;if(d?.individual_id===selected&&[2,3,5].includes(d.step))go(d.step);});
 function paint(){
  const r=birthCheck;if(!r||r.individual_id!==selected)return;
  if(scope!==selected){scope=selected;const mem=journeyMemory.read().wizard?.[scope];step=mem?.step??1;saved.textContent="目前显示已保存的设置；可直接按下一步。";for(const [key,input]of Object.entries(permissionInputs))input.checked=!!r.settings.permissions[key];domains.value=(r.settings.permissions.web_domains??[]).join('\n');webMode.value=r.settings.permissions.web_mode??'public';domainsLabel.hidden=webMode.value==='public';if(mem?.form){$('windowStart').value=mem.form.start;$('windowMinutes').value=mem.form.minutes;for(const [key,input]of Object.entries(permissionInputs))if(mem.form[key]!==undefined)input.checked=!!mem.form[key];if(mem.form.web_domains)domains.value=mem.form.web_domains.join('\n');if(mem.form.web_mode)webMode.value=mem.form.web_mode;domainsLabel.hidden=webMode.value==='public';}}
  const unborn=r.life.state==='unborn';if(!unborn&&![2,3,5].includes(step))step=5;else if(unborn&&step>4)step=1;
  title.textContent=r.name+' · '+(unborn?"首次出生准备":"出生与活动状态");
  panels.forEach((p,i)=>p.hidden=i+1!==step);[...progress.children].forEach((li,i)=>{li.setAttribute('aria-current',i+1===step?'step':'false');li.dataset.done=String(i+1<step);});
  state.textContent=unborn?"目前第"+step+"／4步。"+names[step-1]+"；已保存的内容会保留，可稍后继续。":step===2?"调整已出生个体的设置；保存不会恢复活动。":"出生事实与活动状态分开显示，停止活动不会撤销出生。";
  setupIntro.textContent=unborn?"您可以现在完成出生。尚未到生活时间时，出生后会等待，到了指定时间才开始第一次活动。":"此个体已出生。您可以调整每天的活动时间与工具；若正在等待首次活动，修改设置会取消原安排。";
  for(const [key,input]of Object.entries(permissionInputs))input.disabled=key!=='note'&&!backendReady();domains.disabled=!backendReady();
  permissionTarget.textContent="目前设置对象："+r.name+"。勾选后请按下方保存，才会生效。"+(!backendReady()?" 添加对话与网页能力尚待控制器更新，目前不能勾选。":"每项授权都会在后端重新检查；LLM日常思考与主动咨询共用模型额度。");
  $('wizardSave').textContent=unborn?"保存设置，下一步：检查平台":"保存设置，返回活动状态";
  identity.replaceChildren(el('p',"指定个体："+r.name+'（'+r.individual_id+'）'),el('p',r.identity?"已批准身份：「"+r.identity.title+"」第"+r.identity.package_version+"版。批准身份不会自动出生。":"尚未有已批准身份。请先选择、提交并批准，再回来继续。"));
  $('wizardIdentity').hidden=!r.identity;choose.hidden=!!r.identity;
  quota.textContent="此个体每个生活时段最多"+r.settings.max_cycles+"次模型请求，平台全体每天最多"+r.settings.global_limit+"次；日常思考与主动咨询共用额度。每轮最多2分钟，并非整段时段持续思考。"+(!unborn?" 此个体已出生；修改等待中的首次活动设置会先取消原安排，保存不会恢复活动。":'');
  saved.textContent=$('windowStart').value===r.settings.window_start&&Number($('windowMinutes').value)===r.settings.window_minutes&&Object.entries(formPermissions()).every(([k,v])=>JSON.stringify(v)===JSON.stringify(r.settings.permissions[k]??(k==='web_domains'?[]:false)))?"目前时间与工具设置已保存。":"尚有未保存的修改；请按「保存设置，下一步」继续。";
  platform.replaceChildren(el('p',r.global_stopped?"平台目前全域停止。先查看解除范围，再由您决定是否解除。":"平台已可接受个别授权；其他个体不会因下一步而出生或恢复。"));
  for(const b of r.blockers.filter(b=>b.code!=='ALREADY_LIVED')){if(b.code!=='GLOBAL_STOP')platform.append(el('p',b.message));if(b.code==='GLOBAL_STOP'){const inspect=el('button',"查看解除平台停止的影响范围");inspect.onclick=()=>$('globalClear').click();platform.append(inspect);}}
  $('wizardPlatformNext').textContent=unborn?"下一步：最后核对":"返回活动状态";$('wizardPlatformNext').disabled=busy||(unborn?!r.can_confirm:r.global_stopped);
  $('birthReview').hidden=!unborn;$('birthPreview').textContent="对象："+r.name+'（'+r.individual_id+"）\n已批准身份：「"+(r.identity?.title??"未批准")+"」第"+(r.identity?.package_version??'?')+"版\n每日 "+r.settings.window_start+" 起，最多 "+r.settings.window_minutes+" 分钟\n此个体活动上限："+r.settings.max_cycles+"轮；平台每日共用上限："+r.settings.global_limit+"轮\n受控添加笔记："+(r.settings.permissions.note?"允许":"不允许")+"\n这次第一次活动："+time(r.next_window_start)+"\n这次授权最晚结束："+time(r.first_window.end);
  if(backendReady())$('birthPreview').textContent+="\n允许公开网页："+(r.settings.permissions.web?(r.settings.permissions.web_mode==='public'?"是，所有公开HTTPS网站": "是，指定网站清单"):"否")+"\n允许主动请教LLM："+(r.settings.permissions.consult?"是，每次另计模型轮数":"否")+"\nOwner双向交互：所有个体的基本能力";
  timing.textContent="按下确认后立即记录出生。"+(r.window_open?"目前在时段内，可开始第一轮活动。":"尚未到时段，出生后会等待到上述时间，不会提前活动。")+" 这次只授权此个体与上述时段。出生事实永久保留；停止会取消活动，但不会撤销出生。错过此时段或重启控制器不会自动补跑。";
  $('birth').disabled=busy||!r.can_confirm||!$('birthConfirm').checked;
  recovery.replaceChildren();if(unborn&&!r.can_confirm){recovery.append(el('p',"目前条件尚未完成，身份与设置均保留。"));const b=el('button',"回第3步处理原因");b.onclick=()=>go(3);recovery.append(b);}
  controls.hidden=unborn||step!==5;$('resume').disabled=unborn||entity().control.mode==='running'||busy;
  if(!unborn){const c=entity().control;result.replaceChildren(el('p',r.name+' '+(r.born_at?"已出生，出生时间："+time(r.born_at):"已有早期生活纪录。")),el('p',"身份：「"+(r.identity?.title??"早期身份")+"」第"+(r.identity?.package_version??r.identity?.version??'?')+"版"),el('p',"每日 "+r.settings.window_start+" 起，最多 "+r.settings.window_minutes+" 分钟"),el('p',r.global_stopped||r.individual_stopped||c.mode!=='running'?"目前活动已停止，不会自动恢复。":r.next_activity>Date.now()?(c.next_wake?.source==='provider-retry'?"模型繁忙，等待于 "+time(r.next_activity)+" 自动重试，不需手动恢复。":c.next_wake?.source==='birth-scheduled'?"已出生，等待于 "+time(r.next_activity)+" 开始第一次活动。":"下一次预定活动："+time(r.next_activity)):r.next_activity?"下一次预定活动："+time(r.next_activity):entity().lease?"正在运行本轮活动。":"目前没有待运行活动。"),el('p',"停止或重启控制器后，请另行明确恢复；不用再次出生。"));}
  const e=entity(),info=e.control.inference_status,policy=e.inference_policy;inference.replaceChildren(el('h3',"模型与活动状态"),el('p',"固定模型："+(policy?.model??"更新前未指定")+"；不自动切换其他模型。"));if(e.lease)inference.append(el('p',e.control.provider_retry?.retries?"正在运行第"+e.control.provider_retry.retries+"次重试。":"正在运行本轮活动。"));else if(e.control.next_wake?.source==='provider-retry')inference.append(el('p',"模型暂时繁忙；预定 "+time(e.control.next_wake.at)+" 自动进行第"+info.retries+'／'+info.max_retries+"次重试，您不必按恢复。"));else if(info)inference.append(el('p',info.message));else if(e.control.reason)inference.append(el('p',"目前状态："+(e.control.reason==='控制器已關閉；下次需明確恢復'?"控制器已重新打开；此个体保持停止，等待 Owner 明确恢复":e.control.reason)));if(e.controller_health)inference.append(el('p',e.controller_health.message),el('p',"下一步："+e.controller_health.action));inference.append(el('p',"容量不足最多重试3次，分别等待30秒、90秒、180秒；每次都计入活动轮数。停止、时段结束或权限变更会取消等待。可确认进程结束且未写入的暂时断线也可有限重试；已有记忆提交则核对后接续，不重做本轮。部分写入、结果不明、登录或额度问题保留纪录并停止重送。"));
  remember();
 }
 const oldReadiness=renderReadiness;renderReadiness=function(r){oldReadiness(r);paint();};
 const oldRender=render;render=function(){oldRender();paint();for(const card of cards.children)for(const b of card.querySelectorAll('button'))if(b.textContent==="查看生活与记忆")b.textContent="查看状态／继续出生准备";};
 bind('globalClear',async()=>{navigate('life');await loadBirthCheck();go(3);return showGlobalImpact();});
 // Async handlers retain one primary next action. The global emergency stop remains available.
 const oldNavigate=navigate;navigate=function(page){oldNavigate(page);if(page==='life')paint();};
 paint();
})();
