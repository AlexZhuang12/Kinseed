let draftRows=[],packageRows=[],reviewRows=[];
globalThis.kinseedDraftUI={get rows(){return draftRows;}};
let restoredContext=false;const writingContext={read(){try{return JSON.parse(sessionStorage.getItem('kinseed-writing-context')||'{}');}catch{return {};}},save(){try{sessionStorage.setItem('kinseed-writing-context',JSON.stringify({target:targetID(),draft_id:draft?.draft_id||$('draftList').value}));}catch{}}};
const named=id=>ownerName(status?.individuals??[],id),targetID=()=>$('builderTarget').value;
const oldDraftHeading=oldBuilder.querySelector('h2');oldDraftHeading.textContent='替個體填寫出生條件';
pageMap.draft.querySelector('h2').textContent='出生條件與已保存填寫';
nav.querySelector('[data-page="draft"]').textContent='出生條件與草稿';
targetLabel.firstChild.textContent='第 1 步：選擇要設定的個體 ';
context.querySelector('small').textContent='選擇後只查看這個個體的資料，不會批准身份或讓他出生。';
oldBuilder.querySelector('p:not(.steps p)').textContent='出生條件是你對這個個體的初始期待。「草稿」就是已保存、還可以繼續修改的填寫內容。';
draftActions.replaceChildren(el('p','① 選擇個體 → ② 繼續填寫並保存 → ③ 預覽與審核 → ④ 你親自決定出生'));
const flow=el('div');flow.className='steps';flow.id='draftFlow';const flowTitle=el('h3'),flowNext=el('p');flow.append(flowTitle,flowNext);draftActions.after(flow);
const listLabel=$('draftList').closest('label');listLabel.firstChild.textContent='已保存的填寫 ';flow.append(listLabel,$('loadDraft'));
const first=el('button','開始填寫出生條件');first.id='startConditions';first.className='primary';flow.append(first,goLibrary);
const extras=el('details');extras.id='otherDraftActions';extras.append(el('summary','其他操作：另開一份、查看舊草稿'));flow.after(extras);
extras.append(el('p','日常接續填寫請用上方「繼續填寫」。只有想保留目前內容、另寫不同方案時，才需要另外建立空白草稿。原內容不會消失。'));
const altLabel=el('label','另一份文件的標題（由你命名） '),altTitle=el('input');altTitle.id='alternateDraftTitle';altTitle.maxLength=200;altLabel.append(altTitle);extras.append(altLabel,$('newDraft'));
$('newDraft').textContent='另外建立空白草稿（保留原內容）';
const allLabel=el('label'),all=el('input');all.type='checkbox';all.id='showAllDrafts';allLabel.append(all,document.createTextNode('查看其他個體及尚未指定對象的舊草稿'));extras.append(allLabel);
extras.append(el('p','舊草稿不會自動移交給所選個體。開啟時會顯示它原來的對象；尚未指定者在提交審核前再確認對象。'));
extras.append($('draftHistory'));flow.after(extras);
const titleLabel=$('builderTitle').closest('label');titleLabel.firstChild.textContent='這份條件的標題（文件名稱，不是另一個個體） ';advancedMetadata.append(titleLabel);
oldBuilder.insertBefore(advancedMetadata,extras.nextSibling);
advancedMetadata.querySelector('summary').textContent='文件名稱與系統資訊（進階）';
const identityNote=el('p','下方識別碼是系統用來分開保存資料的編號，不是你替個體取的名字，也不會加入出生條件。一般操作不需要修改。');advancedMetadata.append(identityNote);
function choices(id,rows,preferred){const s=$(id),value=preferred??s.value;s.replaceChildren(...rows.map(([value,label])=>{const o=el('option',label);o.value=value;return o;}));s.value=rows.some(r=>r[0]===value)?value:rows[0]?.[0]??'';}
function paintFlow(){
 const target=targetID(),rows=visibleDrafts(draftRows,target,all.checked),isLoaded=!!draft;
 const previous=$('draftList').value,preferred=rows.some(x=>x.draft_id===previous)?previous:isLoaded&&rows.some(x=>x.draft_id===draft.draft_id)?draft.draft_id:rows.at(-1)?.draft_id;
 choices('draftList',rows.map(d=>[d.draft_id,draftLabel(d,rows,status?.individuals??[],all.checked)]),preferred);
 listLabel.hidden=!rows.length;$('loadDraft').hidden=!rows.length;first.hidden=!!rows.length||!target;first.disabled=busy||!target;
 $('loadDraft').disabled=busy||!rows.length;
 $('newDraft').disabled=busy||!target;altLabel.hidden=!target;
 if(!target&&!isLoaded){flowTitle.textContent='請先選擇要設定的個體';flowNext.textContent='在上方選名字。系統接著會列出他的已保存填寫，沒有內容時才開始新問卷。';}
 else if(isLoaded){flowTitle.textContent=(draft.candidate&&!draft.dirty&&!localDirty?'第 3 步：核對 ':'第 2 步：正在替 ')+named(draft.individual_id||target)+(draft.candidate&&!draft.dirty&&!localDirty?'的出生條件':' 填寫');flowNext.textContent='目前文件：「'+draft.title+'」。'+(localDirty?'有尚未保存的修改，請按「儲存填寫進度」。':draft.candidate&&!draft.dirty?'已保存並預覽。下一步核對內容，再提交審核；尚未批准或出生。':'回答已保存，可以接著寫；寫好後按「下一步：預覽出生條件」。');}
 else {flowTitle.textContent='第 2 步：'+named(target)+'的出生條件';flowNext.textContent=rows.length?'找到 '+rows.length+' 份已保存填寫。選一份後按「繼續填寫」，不需要重新開始。':'還沒有這個個體的填寫內容。按「開始填寫出生條件」，系統會為他保存第一份草稿。';}
 if(isLoaded&&!draft.individual_id)flowNext.textContent='這份舊草稿尚未指定對象。'+(target?'目前預定交給 '+named(target)+'，提交審核時會再次列明對象。':'請先在上方選擇個體，再繼續填寫與提交。')+' 原有回答不會改寫。';
 $('loadDraft').textContent='繼續填寫所選內容';goLibrary.textContent='改用已保存的身份版本';
}
all.onchange=paintFlow;
const packageTitles=new Map();
builderRefresh=async function(){
 const b=await api('builder');draftRows=b.drafts;packageRows=b.packages;reviewRows=b.reviews;
 choices('builderTarget',[['','請先選擇個體'],...(status?.individuals??[]).map(e=>[e.profile.individual_id,named(e.profile.individual_id)])]);
 if(!restoredContext){restoredContext=true;const remembered=writingContext.read();if(!targetID()&&status?.individuals.some(e=>e.profile.individual_id===remembered.target)){$('builderTarget').value=remembered.target;previousTarget=remembered.target;}paintFlow();if(draftRows.some(d=>d.draft_id===remembered.draft_id&&d.individual_id===targetID()))$('draftList').value=remembered.draft_id;}
 await Promise.all(packageRows.map(async p=>{const key=p.id+'@'+p.version;if(!packageTitles.has(key)){const data=await bread('package',{package_id:p.id,version:p.version});packageTitles.set(key,data.title);}}));
 const candidates=draftRows.filter(d=>d.candidate_version&&!d.dirty&&!packageRows.some(p=>p.id===d.package_id&&p.version===d.candidate_version));
 choices('versionList',[...packageRows.map(p=>[p.id+'@'+p.version,packageTitles.get(p.id+'@'+p.version)+' · 第'+p.version+'版（已保存）']),...candidates.map(d=>['draft:'+d.draft_id,d.title+' · 第'+d.candidate_version+'版（待保存）'])]);
 choices('reviewList',reviewRows.map(r=>[r.review_id,named(r.individual_id)+' · '+(packageTitles.get(r.package_id+'@'+r.package_version)??'已提交的出生條件')+' · 第'+r.package_version+'版 · '+({pending:'待審',approved:'已批准',reject:'已拒絕',return:'已退回'}[r.status]??r.status)]));
 paintFlow();syncReviewButtons();
};
function clearLoaded(){draft=null;domainIndex=0;localDirty=false;$('wizard').hidden=true;$('candidatePanel').hidden=true;$('builderTitle').disabled=false;$('draftStatus').textContent='請從上方繼續已保存填寫，或開始第一份出生條件。';$('savedHistory')?.remove();}
$('builderTarget').onchange=()=>{
 if(busy||localDirty){$('builderTarget').value=draft?.individual_id||previousTarget;show('請先儲存目前的填寫進度，再切換個體；你的回答仍保留在畫面中。');return;}
 if(draft&&!draft.individual_id){previousTarget=targetID();updateTarget();renderDraft();show('舊草稿的預定提交對象：'+named(previousTarget)+'。回答仍保留，尚未提交或批准。');return;}
 clearLoaded();previousTarget=targetID();updateTarget();paintFlow();writingContext.save();show(previousTarget?'目前查看 '+named(previousTarget)+'。請依上方第 2 步繼續。':'請先選擇個體。');
};let previousTarget='';
updateTarget=function(){const e=status?.individuals.find(e=>e.profile.individual_id===targetID());if(e)$('builderTest').checked=e.profile.test_only;viewedVersion=null;submitVersion.disabled=true;libPreview.replaceChildren(el('p','請唯讀查看所選版本，核對後再提交審核。'));};
async function startConditions(title){
 if(localDirty)throw Error('請先儲存目前填寫進度，再開另一份。');
 const e=status?.individuals.find(e=>e.profile.individual_id===targetID());if(!e)throw Error('請先選擇要設定的個體。');
 draft=await ba('create',{individual_id:e.profile.individual_id,package_id:'identity-'+rid().slice(0,8),title,test_only:e.profile.test_only,...(templateOverride?{template:templateOverride}:{})});
 localDirty=false;domainIndex=0;$('builderPackage').value=draft.package_id;renderDraft();await builderRefresh();$('draftList').value=draft.draft_id;paintFlow();return '已為 '+named(e.profile.individual_id)+' 保存一份可繼續填寫的草稿。填寫後記得儲存進度；尚未批准或出生。';
}
bind('startConditions',async()=>{const e=status?.individuals.find(e=>e.profile.individual_id===targetID());if(!e)throw Error('請先選擇個體。');if(draftRows.some(d=>d.individual_id===targetID()))throw Error('這個個體已有保存內容，請先用「繼續填寫」開啟；另寫方案請展開其他操作。');return startConditions(e.name);});
bind('newDraft',async()=>{const title=altTitle.value.trim();if(!title)throw Error('請為另一份文件填寫標題，讓你之後能分辨不同草稿。');const r=await startConditions(title);altTitle.value='';extras.open=false;return r;});
bind('loadDraft',async()=>{
 if(localDirty)throw Error('請先儲存目前填寫進度，再開啟另一份。');if(!$('draftList').value)throw Error('請先選擇已保存填寫。');
 draft=await bread('get',{draft_id:$('draftList').value});localDirty=false;domainIndex=0;
 $('builderTarget').value=draft.individual_id||'';previousTarget=targetID();renderDraft();
 return '已開啟「'+draft.title+'」，'+(draft.individual_id?'對象是 '+named(draft.individual_id)+'。':'這份舊草稿尚未指定對象，請在上方選擇，再核對後提交。')+' 原有回答完整保留。';
});
const priorDraftRender=renderDraft;renderDraft=function(){priorDraftRender();if(!draft)return;
 const target=draft.individual_id||targetID();previousTarget=target;$('draftList').value=draft.draft_id;
 $('draftStatus').textContent='正在編輯「'+draft.title+'」｜對象：'+named(target)+'｜'+(localDirty?'尚未保存':'已保存')+'。保存只是保留填寫進度，不會批准或出生。';paintFlow();writingContext.save();
};
$('saveDraft').textContent='儲存填寫進度';$('compileDraft').textContent='下一步：預覽出生條件';$('submitCandidate').textContent='下一步：提交這份條件審核';
const candidateExtras=el('details');candidateExtras.append(el('summary','其他操作：另存版本、下載或重新檢查'),el('p','日常流程核對後直接提交審核即可；另存與下載是選用操作。'));$('candidatePanel').append(candidateExtras);for(const id of ['validateCandidate','saveVersion','exportCandidate'])candidateExtras.append($(id));$('submitCandidate').className='primary';
bind('compileDraft',async()=>{const result=await compileDraft();$('candidatePanel').querySelector('h3').textContent='第 3 步：核對出生條件';$('candidatePanel').tabIndex=-1;$('candidatePanel').focus();return result;});
bind('saveDraft',async()=>{if(!draft)throw Error('請先開啟填寫內容。');await saveDraft();return '填寫進度已保存。下次選這個個體，再按「繼續填寫」即可接續，不需要重新建立。';});
const priorDirty=markDirty;markDirty=function(){priorDirty();if(draft)$('draftStatus').textContent='正在編輯「'+draft.title+'」｜對象：'+named(draft.individual_id||targetID())+'｜尚未保存，請儲存填寫進度。';paintFlow();};
bind('create',async()=>{
 if(localDirty)throw Error('請先儲存目前填寫進度，再建立新個體。');const name=$('newName').value.trim();if(!name)throw Error('請先替新個體取名字。');
 const individual_id=$('newID').value.trim()||'kinseed-'+rid().slice(0,8);
 await api('create',{individual_id,name,test_only:$('testOnly').checked});await refresh();clearLoaded();selected=individual_id;$('builderTarget').value=individual_id;previousTarget=individual_id;
 $('builderTitle').value=name;$('newID').value='';$('newName').value='';all.checked=false;render();navigate('draft');paintFlow();writingContext.save();
 return name+'已建立，尚未出生。下一步：按「開始填寫出生條件」。';
});
const priorFlowRender=render;render=function(){priorFlowRender();
 for(const o of $('selected').options){const e=status?.individuals.find(x=>x.profile.individual_id===o.value);if(e)o.textContent=named(o.value)+' · '+lifeName(e.life.state);}
 for(const [i,card]of [...cards.children].entries()){const e=status?.individuals[i];if(!e)continue;card.querySelector('small')?.remove();
  const technical=el('details');technical.append(el('summary','系統識別資訊'),el('p','內部編號：'+e.profile.individual_id+'。用於資料隔離，不是姓名或出生條件。'));card.append(technical);
  const manage=card.querySelectorAll('button')[0],configure=card.querySelectorAll('button')[1];manage.hidden=!e.identities.length;configure.className=e.identities.length?'':'primary';configure.textContent=e.identities.length?'查看或修改出生條件':'填寫出生條件';configure.onclick=()=>{if(localDirty){show('請先儲存目前填寫進度，再切換個體。');return;}clearLoaded();$('builderTarget').value=e.profile.individual_id;previousTarget=targetID();all.checked=false;updateTarget();navigate('draft');paintFlow();writingContext.save();};
 }paintFlow();
};
const priorReviewRender=renderReview;renderReview=function(r){priorReviewRender(r);const h=reviewReadable.querySelector('h3');if(h)h.textContent=named(r.individual_id)+' · 已提交的出生條件 · 第'+r.package_version+'版';$('approveReview').textContent='批准 '+named(r.individual_id)+' 採用此版本（不出生）';};
const priorDifference=differenceView;differenceView=function(p,container){priorDifference(p,container);const row=container.querySelector(':scope > p');if(row)row.textContent='指定個體：'+named(p.individual_id)+'。採用只更新此個體的身份；不改記憶、歷史或出生。';};
const priorSubmission=showSubmission;showSubmission=async function(r){await priorSubmission(r);return '已提交 '+named(r.individual_id)+' 的出生條件，下一步：核對內容並由 Owner 決定是否批准。提交不會讓個體出生。';};
paintFlow();
