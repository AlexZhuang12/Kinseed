// Display labels only; stored names, identity content and opaque IDs are unchanged.
export function ownerName(individuals,id){
 const e=individuals.find(x=>x.profile.individual_id===id);
 if(!e)return id?'不在目前清單的個體':'尚未指定個體';
 const same=individuals.filter(x=>x.name===e.name);
 return same.length>1?e.name+'（同名個體 '+(same.findIndex(x=>x.profile.individual_id===id)+1)+'）':e.name;
}
export function visibleDrafts(rows,target,includeAll=false){return rows.filter(d=>includeAll||!!target&&d.individual_id===target);}
export function draftLabel(d,rows,individuals,includeTarget=false){
 const same=rows.filter(x=>x.title===d.title),suffix=same.length>1?'（同標題第 '+(same.findIndex(x=>x.draft_id===d.draft_id)+1)+' 份）':'';
 return d.title+suffix+' · '+(d.candidate_version?'已預覽內容':'已保存回答')+(includeTarget?' · '+ownerName(individuals,d.individual_id):'');
}
