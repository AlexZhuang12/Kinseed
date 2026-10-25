import {fetchPublic} from '../v1_2/public-browser.mjs';
import {webURL} from '../v1_2/web-access.mjs';
import {imageDimensions} from './ocr.mjs';
import {hash,id} from '../v1_2/store.mjs';

// Persist only validated bytes, never signed URLs. No upload or generation in this module.
export function mediaType(bytes,declared,kind){
 if(['speech','sound_effects'].includes(kind))kind='audio';
 const mime=String(declared??'').split(';')[0].toLowerCase();let detected;
 if(bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a')detected='image/png';
 else if(bytes.subarray(0,3).toString('hex')==='ffd8ff')detected='image/jpeg';
 else if(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP')detected='image/webp';
 else if(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WAVE')detected='audio/wav';
 else if(bytes.subarray(0,4).toString('hex')==='1a45dfa3'&&bytes.subarray(0,128).includes(Buffer.from('webm')))detected=kind==='video'?'video/webm':'audio/webm';
 else if(bytes.subarray(0,3).toString()==='ID3'||bytes[0]===255&&(bytes[1]&0xe0)===0xe0)detected='audio/mpeg';
 else if(bytes.length>=12&&bytes.subarray(4,8).toString()==='ftyp'&&['isom','iso2','mp41','mp42','avc1','M4V ','dash'].includes(bytes.subarray(8,12).toString()))detected='video/mp4';
 if(!detected||detected!==mime||!detected.startsWith(kind==='audio'?'audio/':kind+'/'))throw Error('成果格式不符或尚不支援；未保存，不會重新生成。');
 if(['image/png','image/jpeg'].includes(mime))imageDimensions(bytes,mime);
 return mime;
}
const extension={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','audio/wav':'wav','audio/mpeg':'mp3','video/mp4':'mp4','video/webm':'webm','audio/webm':'webm'};
export class HedraResults{
 constructor(hub,{transport=fetchPublic}={}){this.hub=hub;this.transport=transport;this.active=new Map();this.aborts=new Set();this.closing=false;}
 saved(e,job,index){return this.hub.list(e,'hedra-media').find(x=>x.source.job_id===job&&x.source.output_index===index);}
 metadata(x){return {id:x.id,version:x.version,name:x.name,mime:x.mime,bytes:x.bytes,sha256:x.sha256,source:x.source,downloaded:true,model_viewed:false};}
 async save(e,job,index=0,{assert=()=>{},signal}={}){
  if(this.closing)throw Error('成果下載正在收尾，請重新開啟後查原工作。');
  // Own ledger lookup before returning even a cached result.
  const own=this.hub.hedra.ledger.job(job,e.info.individual_id);if(own.state!=='completed')throw Error('遠端工作尚未確認完成，沒有下載。');
  if(!Number.isInteger(index)||index<0||!own.outputs?.[index])throw Error('請指定原工作的成果序號。');
  const prior=this.saved(e,job,index);if(prior)return this.metadata(prior);
  const key=e.info.individual_id+':'+job+':'+index;
  if(this.active.has(key))return this.active.get(key);
  const abort=new AbortController();this.aborts.add(abort);e.externalRequests??=new Set();e.externalRequests.add(abort);const combined=AbortSignal.any([abort.signal,...(signal?[signal]:[])]);const promise=this.perform(e,own,index,{assert,signal:combined});this.active.set(key,promise);
  try{return await promise;}finally{this.active.delete(key);e.externalRequests.delete(abort);this.aborts.delete(abort);}
 }
 async close(){this.closing=true;for(const a of this.aborts)a.abort();await Promise.allSettled([...this.active.values()]);}
 async perform(e,job,index,{assert,signal}){
  const hub=this.hub,entity=e.info.individual_id,n=hub.p.network;
  const live=()=>{assert();const c=e.store.get('control');if(!c.permissions.web)throw Error('成果下載仍需既有外網權限；遠端成果保留。');};
  live();const c=n.config();const used=e.store.db.prepare('SELECT coalesce(sum(length(CAST(body AS BLOB))),0) n FROM hub_objects').get().n;
  const max=Math.min(c.single,8000000,Math.floor((20000000-used-4096)*3/4));
  if(max<1||n.remaining(entity)<1)throw Error('保存空間或網路額度不足；遠端成果保留，不會重新生成。');
  e.store.tx(()=>hub.record(e,'hedra_download_started',{job_id:job.id,output_index:index}));
  try{
   const combined=AbortSignal.any([...(signal?[signal]:[]),AbortSignal.timeout(55000)]);
   // Resolve a fresh URL from the original job on every explicit attempt (including after expiry).
   const out=await hub.hedra.result(entity,job.id,index,{signal:combined});live();
   const guarded=()=>{live();combined.throwIfAborted();};
   const perms=e.store.get('control').permissions;
   if(perms.web_mode!=='public')webURL(out.url,perms.web_domains??[]);
   const downloadSignal=AbortSignal.any([combined,AbortSignal.timeout(25000)]);
   const r=await this.transport(out.url,{signal:downloadSignal,assert:guarded,maxBytes:max,remaining:()=>n.remaining(entity),charge:bytes=>n.charge(entity,'download',bytes),
    // Redirect destinations are checked as well, rather than trusting a signed URL's first host.
    validateURL:raw=>{const p=e.store.get('control').permissions;if(p.web_mode!=='public')webURL(raw,p.web_domains??[]);}});
   guarded();if(r.status!==200)throw Error('download_http_'+r.status);
   if(!r.body?.length||r.body.length>max)throw Error('download_size');
   const mime=mediaType(r.body,out.content_type,job.input.kind);
   if(String(r.headers['content-type']??'').split(';')[0].toLowerCase()!==mime)throw Error('download_mime');
   return e.store.tx(()=>{
    guarded();const existing=this.saved(e,job.id,index);if(existing)return this.metadata(existing);
    const x=hub.put(e,'hedra-media',{name:'hedra-'+job.id+'-'+index+'.'+extension[mime],mime,bytes:r.body.length,sha256:hash(r.body),data_base64:r.body.toString('base64'),
     source:{provider:'Hedra',job_id:job.id,remote_job_id:job.remote_job_id,asset_id:out.asset_id,output_index:index,model:job.input.model,kind:job.input.kind,remote_completed_at:job.updated_at??null,retrieved_at:e.now()},validation:'MIME/container signature checked; browser playback is a separate check'}, {object_id:id()});
    const meta=this.metadata(x);hub.record(e,'hedra_download_saved',meta);return meta;
   });
  }catch(err){const message=/登入|授權已失效/.test(err.message)?'Hedra登入無法使用':/工作區/.test(err.message)?'工作區不符':/額度|空間|大小|size|上限/.test(err.message)?'下載大小或剩餘額度不足':/格式|mime/.test(err.message)?'成果格式無法核對':/權限|WEB_DOMAIN/.test(err.message)?'外網權限不符':/download_http_40[13]/.test(err.message)?'成果網址過期或拒絕存取':/下載位置/.test(err.message)?'原成果尚無下載位置':'網路中斷、逾時或尚無可核對結果';e.store.tx(()=>hub.record(e,'hedra_download_failed',{job_id:job.id,output_index:index,message}));throw Error(message+'；未保存完整成果，可重取原工作，不會重新生成。',{cause:err});}
 }
}
