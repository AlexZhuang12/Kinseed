// Owner display preference only. Active entities remain visible. Source and history are unchanged.
(()=>{let hidden=new Set();const previous=api;
 api=async function(route,b){const value=await previous(route,b);if(route==='status'){manage.disabled=!value.local_unification?.reports_enabled;hidden=new Set(value.archived_ids??[]);return {...value,individuals:value.individuals.filter(e=>!hidden.has(e.profile.individual_id))};}if(route==='builder'&&value.reviews)return {...value,reviews:value.reviews.filter(r=>!hidden.has(r.individual_id))};return value;};
 const manage=el('button','管理個體選項');manage.disabled=true;manage.id='manageIndividuals';manage.onclick=()=>location.assign('/reports-view?manage=1&lang='+encodeURIComponent(document.documentElement.lang)+'#'+encodeURIComponent(token));nav.append(manage);
})();
