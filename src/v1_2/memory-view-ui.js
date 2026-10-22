// Read-only Owner view; exact text comparison, never writes an individual's memory.
(()=>{
 const ui=globalThis.kinseedControlUI,pane=$('hubPane-records');if(!ui||!pane)return;
 const old=pane.querySelector('section'),section=el('section');section.id='memoryViewer';pane.prepend(section);
 let scope='',serial=0,pending=false,data=null,next=null,versions=[];
 const heading=el('h3','記憶用量與版本'),notice=el('p','這裡只查閱，不修改記憶，也不啟動生活。'),usage=el('p'),refresh=el('button','更新記憶與版本'),message=el('p'),current=el('details'),history=el('details'),select=el('select'),read=el('button','讀取選定版本與差異'),more=el('button','載入更早版本'),detail=el('div');
 refresh.id='memoryRefresh';usage.id='memoryUsage';message.id='memoryMessage';message.setAttribute('role','status');current.id='memoryCurrent';history.id='memoryHistory';select.id='memoryVersionSelect';read.id='memoryReadVersion';more.id='memoryMore';detail.id='memoryVersionDetail';
 current.append(el('summary','查看這次讀取的累積記憶、計畫與總結'));
 history.append(el('summary','舊版與內容差異（歷史完整保留）'));
 const label=el('label','選擇記憶紀錄 ');label.append(select);history.append(label,read,more,el('p','以原文比對新增／改寫後與移出／改寫前的內容，不由模型判斷語意。移出目前摘要不代表從歷史刪除。'),detail);
 section.append(heading,notice,usage,refresh,message,current,history);more.hidden=true;
 function entries(parent,title,items){parent.append(el('h4',title));if(!items.length)parent.append(el('p','沒有內容。'));for(const text of items)parent.append(el('p',text));}
 function content(parent,value){entries(parent,'已保存記憶',value.memory);entries(parent,'個體提出的下一步',value.plan);parent.append(el('h4','當輪總結'),el('p',value.result||'沒有總結。'));}
 function appendVersions(rows){for(const row of rows){if(versions.some(v=>v.event_id===row.event_id))continue;versions.push(row);const option=el('option','第'+row.version+'版 · '+new Date(row.at).toLocaleString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:status?.timezone??'Asia/Taipei'})+(row.type==='restore.applied'?' · 備份恢復':''));option.value=row.event_id;select.append(option);}read.disabled=!versions.length;}
 function clear(){serial++;pending=false;data=null;next=null;versions=[];select.replaceChildren();detail.replaceChildren();usage.textContent='';current.replaceChildren(el('summary','查看這次讀取的累積記憶、計畫與總結'));more.hidden=true;read.disabled=true;refresh.disabled=false;message.textContent='請讀取這個個體的記憶。';if(old)old.hidden=false;}
 async function load(earlier=false){if(pending)return;pending=true;refresh.disabled=true;more.disabled=true;const ticket=++serial,target=scope;message.textContent='正在唯讀查閱記憶。';try{
  const r=await api('memory?individual_id='+encodeURIComponent(target)+(earlier?'&before='+next:''));if(ticket!==serial||scope!==target)return;if(r.individual_id!==target)throw Error('記憶對象不一致，沒有顯示資料。');
  if(!earlier){data=r;versions=[];select.replaceChildren();detail.replaceChildren();const u=r.current.usage;usage.textContent='記憶 '+u.memory_items+'／'+r.limits.memory_items+'條（'+u.memory_chars.toLocaleString()+'字元）；計畫 '+u.plan_items+'／'+r.limits.plan_items+'條（'+u.plan_chars.toLocaleString()+'字元）。目前記憶版本：'+r.current.version+'。';current.replaceChildren(el('summary','查看第'+r.current.version+'版的累積記憶、計畫與總結'));content(current,r.current);if(old)old.hidden=true;}
  appendVersions(r.versions);next=r.next_before;more.hidden=next===null;message.textContent='已讀取 '+r.name+'。每條記憶最多1000字元、計畫500字元；整份提交含其他欄位與格式共用20,000字元。上限不是填滿目標。';
 }catch(err){if(ticket===serial)message.textContent='暫時無法讀取，請重新整理連線後再試：'+friendlyError(err);}finally{if(ticket===serial){pending=false;refresh.disabled=false;more.disabled=false;}}}
 refresh.onclick=()=>load();more.onclick=()=>load(true);
 select.onchange=()=>detail.replaceChildren(el('p','尚未讀取這筆版本。'));
 read.onclick=async()=>{const target=scope,ticket=serial,id=select.value;if(!id)return;read.disabled=true;detail.replaceChildren(el('p','正在讀取所選版本。'));try{
  const r=await api('memory/version?individual_id='+encodeURIComponent(target)+'&event_id='+encodeURIComponent(id));if(ticket!==serial||scope!==target||select.value!==id)return;if(r.individual_id!==target)throw Error('記憶對象不一致。');
  detail.replaceChildren(el('h4','第'+r.selected.version+'版 · '+new Date(r.selected.at).toLocaleString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:status?.timezone??'Asia/Taipei'})));content(detail,r.selected);
  const comparison=el('details');comparison.id='memoryComparison';comparison.open=true;comparison.append(el('summary',r.previous?'與前一筆紀錄（第'+r.previous.version+'版）比較':'第一筆紀錄，沒有更早版本'));
  for(const [field,title]of [['memory','記憶'],['plan','計畫']]){const d=r.difference[field];comparison.append(el('h4',title+'差異'));if(!d.changed)comparison.append(el('p','內容沒有變更。'));else if(d.order_only)comparison.append(el('p','僅順序變更，文字沒有新增或移出。'));else{entries(comparison,'新增／改寫後（'+d.added_or_rewritten.length+'條）',d.added_or_rewritten);entries(comparison,'移出／改寫前（'+d.removed_or_rewritten.length+'條，原紀錄仍保留）',d.removed_or_rewritten);}}
  detail.append(comparison);
 }catch(err){if(ticket===serial&&scope===target)detail.replaceChildren(el('p','無法讀取所選版本：'+friendlyError(err)));}finally{if(ticket===serial)read.disabled=!versions.length;}};
 function sync(){if(scope!==ui.scope){scope=ui.scope;clear();}if(!pane.hidden&&scope&&!data&&!pending)load();else if(!pane.hidden&&data){const e=status?.individuals.find(e=>e.profile.individual_id===scope);if(e&&e.a.version!==data.current.version&&!pending)message.textContent='個體已有更新的記憶版本。這裡保留你正在閱讀的內容；按「更新記憶與版本」取得最新資料。';}}
 $('hubTab-records').addEventListener('click',sync);document.addEventListener('kinseed-control-render',sync);sync();
})();
