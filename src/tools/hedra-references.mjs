import {imageDimensions} from './ocr.mjs';import {hash} from '../v1_2/store.mjs';
const roles=new Set(['reference_image','start_image','end_image']);
export function referenceSpecs(value,kind){
 if(value===undefined)return [];
 if(!Array.isArray(value)||value.length<1||value.length>4||kind==='audio')throw Error('參考素材限1至4份自己的圖片，音樂目前不接受參考素材。');
 const seen=new Set(),frames=new Set();return value.map(r=>{
  if(!r||Object.keys(r).sort().join(',')!=='role,source_id'||typeof r.source_id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(r.source_id)||!roles.has(r.role)||kind==='image'&&r.role!=='reference_image')throw Error('請只提供自己的作品編號與支援的圖片角色，不接受網址、路徑或外部素材編號。');
  const key=r.source_id+':'+r.role;if(seen.has(key)||r.role!=='reference_image'&&frames.has(r.role))throw Error('參考圖或首尾幀角色重複。');seen.add(key);frames.add(r.role);return {source_id:r.source_id,role:r.role};
 });
}
export function ownReference(hub,entity,source_id){
 const e=hub.entity(entity),x=hub.get(e,source_id);
 if(x.kind!=='hedra-media'||!['image/png','image/jpeg'].includes(x.mime)||!x.source?.job_id||!x.source.asset_id)throw Error('目前只接受自己的Hedra已保存PNG/JPEG成果；Owner材料與其他作品尚未開放上傳。');
 const bytes=Buffer.from(x.data_base64,'base64');if(bytes.length!==x.bytes||hash(bytes)!==x.sha256)throw Error('原圖片保存內容無法核對，沒有使用。');
 return {source_id:x.id,source_version:x.version,sha256:x.sha256,job_id:x.source.job_id,asset_id:x.source.asset_id,mime:x.mime,bytes:x.bytes,...imageDimensions(bytes,x.mime)};
}
export function bindReferences(manager,entity,input){
 if(!input.references?.length)return input;
 if(manager.ledger.settings(entity).reference_images!==true)throw Error('Owner尚未開放自己的Hedra圖片參考續作。');
 if(typeof manager.resolveReference!=='function')throw Error('參考圖接頭尚未設定。');
 const refs=input.references.map(r=>{
  const x=manager.resolveReference(entity,r.source_id),job=manager.ledger.job(x.job_id,entity),connection=manager.ledger.connection();
  if(job.state!=='completed'||!job.remote_job_id||job.workspace_id!==connection.workspace_id||!job.outputs?.some(o=>o.asset_id===x.asset_id&&o.content_type===x.mime&&o.status!=='EXPIRED'))throw Error('原工作、素材或目前工作區不相符，沒有提交。');
  return {...x,role:r.role,remote_job_id:job.remote_job_id,workspace_id:job.workspace_id};
 });
 return {...input,references:refs};
}
export function assertReferenceBindings(manager,entity,input){
 if(!input.references?.length)return;
 const current=bindReferences(manager,entity,{...input,references:input.references.map(({source_id,role})=>({source_id,role}))});
 if(hash(current.references)!==hash(input.references))throw Error('參考圖來源、版本或權限已變更，沒有提交。');
}
export const publicReferences=input=>(input.references??[]).map(({source_id,source_version,role,sha256})=>({source_id,source_version,role,sha256}));
