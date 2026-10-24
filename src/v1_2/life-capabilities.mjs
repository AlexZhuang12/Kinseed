import {zonedDay,dayStart} from '../timezone.mjs';
import {saveWebReading,searchURL,searchResults} from './reading.mjs';
import {browsePublic,cleanURL} from './public-browser.mjs';
import {networkProtected,downloadPublic,requestUpload} from './network-transfers.mjs';
import path from 'node:path';import {browseWeb} from './web-access.mjs';import {id,hash} from './store.mjs';import {runReportModel} from './report-runner.mjs';import {windowAt} from '../controller.mjs';
export const CAPABILITIES={version:1,public_browser:2,tool_guidance:1,web:true,consult:true,chat:true,owner_communication:'system_basic',temporary_life:true,proactive_owner:true,identity_material:true,memory_search:true,document_reading:true,public_search:true,workbench:true,model:'gpt-6.1-sol'};
export const capabilitiesFor=e=>({...CAPABILITIES,tool_hub:!!e.platform?.toolHub,codex_delegation:e.platform?.delegationEnabled??true,model:e.brainBinding?.model??e.platform?.brainBinding?.model??CAPABILITIES.model});
export const consultModelName=e=>e.platform?.consultBrainBinding?.model??CAPABILITIES.model;
export function conversation(e){return e.store.db.prepare("SELECT seq,body FROM events WHERE json_extract(body,'$.type') IN ('owner.message','tool.owner_reply','tool.owner_message') ORDER BY seq DESC LIMIT 60").all().reverse().map(r=>{const row=JSON.parse(r.body);return {message_id:row.event_id,seq:r.seq,utc:row.utc,role:row.type==='owner.message'?'owner':'individual',proactive:row.type==='tool.owner_message',text:row.result.text,reply_to:row.result.reply_to??null};});}
export function ownerInbox(p){return {individuals:[...p.individuals.values()].map(e=>{const read=p.get('owner-read:'+e.info.individual_id)??0,rows=e.store.db.prepare("SELECT seq,body FROM events WHERE json_extract(body,'$.type') IN ('tool.owner_message','tool.owner_reply') ORDER BY seq DESC").all(),latest=rows[0];return {individual_id:e.info.individual_id,name:e.info.name,unread:rows.filter(r=>r.seq>read).length,latest:latest?{seq:latest.seq,...JSON.parse(latest.body)}:null};})};}
export function markOwnerRead(p,b){
 if(Object.keys(b).some(k=>!['individual_id','message_id'].includes(k))||typeof b.message_id!=='string')throw Error('MESSAGE_SCHEMA');const e=p.entity(b.individual_id),r=e.store.db.prepare("SELECT seq FROM events WHERE event_id=? AND json_extract(body,'$.type') IN ('tool.owner_message','tool.owner_reply')").get(b.message_id);if(!r)throw Error('MESSAGE_SCOPE');
 return p.tx(()=>{const key='owner-read:'+e.info.individual_id,value=Math.max(p.get(key)??0,r.seq);p.set(key,value);return {individual_id:e.info.individual_id,read_through:value};});
}
export function ownerMessage(p,b){
 if(Object.keys(b).some(k=>!['individual_id','text','request_id'].includes(k))||typeof b.request_id!=='string'||!b.request_id||b.request_id.length>100||typeof b.text!=='string'||!b.text.trim()||b.text.length>4000)throw Error('MESSAGE_SCHEMA');
 const e=p.entity(b.individual_id),c=e.store.get('control');const key='owner-message:'+b.request_id,input_hash=hash(b),prior=e.store.receipt(key);if(prior){if(prior.input_hash!==input_hash)throw Error('IDEMPOTENCY_CONFLICT');return prior;}
 const day=zonedDay(p.now(),p.timezone);const count=e.store.db.prepare("SELECT count(*) n FROM events WHERE json_extract(body,'$.type')='owner.message' AND json_extract(body,'$.utc')>=?").get(new Date(dayStart(day,'00:00',p.timezone)).toISOString()).n;if(count>=100)throw Error('CHAT_DAILY_LIMIT');
 const receipt=e.store.tx(()=>{const event=e.store.event('owner.message',{text:b.text.trim()},'owner',{request_id:b.request_id});const result={message_id:event.event_id,input_hash,queued:true};e.store.putReceipt(key,result);return result;});
 if(e.store.get('life').state!=='unborn'&&!p.global().stopped&&!c.stop_lock&&c.mode==='running'&&windowAt(c,p.now()).open&&p.now()<c.authorization_until)e.enqueue('owner-message',p.now(),'message:'+receipt.message_id);
 return receipt;
}
export async function extraTool(e,name,args,l){
 const c=e.store.get('control');e.assertAllowed(l);const required={search_web:'web',browse_web:'web',download_web:'web',request_upload:'web',consult_llm:'consult',reply_owner:'chat',send_owner:'chat'}[name];if(!['reply_owner','send_owner'].includes(name)&&!c.permissions[required])throw Error('PERMISSION_DENIED');
 const effectiveURL=name==='search_web'?searchURL(args.query):args.url;
 const key='extra:'+l.cycle_id+':'+name+':'+(args.request_id??hash(args)),prior=e.store.receipt(key),input_hash=hash(args);if(prior){if(prior.input_hash!==input_hash)throw Error('IDEMPOTENCY_CONFLICT');return prior.result;}
 e.store.tx(()=>e.bumpTool());
 if(name==='send_owner')return e.store.tx(()=>{e.assertAllowed(l);const live=e.store.get('lease');live.mutation_attempted=true;e.store.set('lease',live);const event=e.store.event('tool.owner_message',{text:args.text.trim()},'mcp',l),result={message_id:event.event_id,saved:true,message:'訊息已保存於Owner收件匣，不代表Owner已讀或已回覆。'};e.store.putReceipt(key,{input_hash,result});return result;});
 if(name==='reply_owner'){
  const original=e.store.db.prepare("SELECT body FROM events WHERE json_extract(body,'$.event_id')=? AND json_extract(body,'$.type')='owner.message'").get(args.reply_to);if(!original)throw Error('MESSAGE_SCOPE');
  const already=e.store.db.prepare("SELECT body FROM events WHERE json_extract(body,'$.type')='tool.owner_reply' AND json_extract(body,'$.result.reply_to')=?").get(args.reply_to);if(already)throw Error('MESSAGE_ALREADY_REPLIED');
  return e.store.tx(()=>{e.assertAllowed(l);const live=e.store.get('lease');live.mutation_attempted=true;e.store.set('lease',live);const event=e.store.event('tool.owner_reply',{text:args.text,reply_to:args.reply_to},'mcp',l),result={message_id:event.event_id};e.store.putReceipt(key,{input_hash,result});return result;});
 }
 if(e.store.receipt('extra-intent:'+key))throw Error('REQUEST_RESULT_UNKNOWN');
 const abort=new AbortController();e.externalRequests??=new Set();e.externalRequests.add(abort);
 try{
  let result;
  if(['search_web','browse_web','download_web','request_upload'].includes(name)){
   if(!['browse_web'].includes(name)&&c.permissions.web_mode!=='public')throw Error('請先啟用公開外網工具。');
   e.store.tx(()=>{const live=e.store.get('lease');live.web_calls=(live.web_calls??0)+1;if(!['browse_web','search_web'].includes(name))live.mutation_attempted=true;e.store.set('lease',live);e.store.putReceipt('extra-intent:'+key,{at:e.now()});e.store.event('tool.web.request',{url:cleanURL(effectiveURL)},'mcp',l);});
   const signal=AbortSignal.any([abort.signal,AbortSignal.timeout(Math.max(1,Math.min(30000,l.deadline-e.now()-500)))]);
   if(name==='request_upload')result=requestUpload(e,args,l);
   else if(name==='download_web')result=await downloadPublic(e,args,l,signal);
   else if(c.permissions.web_mode==='public')result=await (e.platform.publicReader??browsePublic)(effectiveURL,{signal,assert:()=>e.assertAllowed(l),budget:e.platform.network,individual:e.info.individual_id,max_chars:args.max_chars??6000,protectedTexts:networkProtected(e)});
   else result=await (e.platform.webReader??browseWeb)(args.url,{domains:c.permissions.web_domains??[],signal,max_chars:args.max_chars??6000});
  }else{
   if(e.store.get('lease').consult_used)throw Error('CONSULT_CYCLE_LIMIT');
   if(l.deadline-e.now()<15000)throw Error('CONSULT_TIME_LIMIT');
   const g=e.platform.global(),w=windowAt(c,e.now());if(g.day!==zonedDay(e.now(),e.platform.timezone)||g.used>=g.limit||c.cycles_day!==w.day||c.cycles_used>=c.max_cycles)throw Error('MODEL_BUDGET_LIMIT');
   // Reserve before dispatch. A failed/unknown request still consumes one attempt and is never silently replayed.
   e.store.tx(()=>{c.cycles_used++;e.store.set('control',c);const live=e.store.get('lease');live.consult_used=true;live.mutation_attempted=true;e.store.set('lease',live);e.store.putReceipt('extra-intent:'+key,{at:e.now()});e.store.event('consult.intent',{question:args.question,model:consultModelName(e),control:c},'mcp',l);});g.used++;e.platform.set('global',g);e.platform.audit('consult.reserved',{individual_id:e.info.individual_id,cycle_id:l.cycle_id,used:g.used});
   result=await (e.platform.consultModel??runReportModel)('你是獨立諮詢用的LLM，並非此個體本人。只回答下方問題，不使用工具，不改任何身份、權限或紀錄。回答不代表已查證，沒有網路或外部資料存取。只回傳JSON：{"answer":"繁體中文回答，最多2000字"}。問題資料：\n'+JSON.stringify(args.question),{dir:path.join(e.store.dir,'consultations'),call_id:id(),timeout:Math.min(45000,l.deadline-e.now()-2000),signal:abort.signal});
   if(!result||typeof result.answer!=='string'||result.answer.length>4000)throw Error('CONSULT_FORMAT');result={answer:result.answer,model:consultModelName(e),trust:'LLM建議，並非已查證事實。'};
  }
  e.assertAllowed(l);if(['browse_web','search_web'].includes(name)){if(name==='search_web')result={...result,search:searchResults(result)};result=saveWebReading(e,result);}
  e.assertAllowed(l);return e.store.tx(()=>{e.assertAllowed(l);e.store.event(['search_web','browse_web','download_web','request_upload'].includes(name)?'tool.web.result':'consult.result',result,'mcp',l);e.store.putReceipt(key,{input_hash,result});return result;});
 }catch(err){e.store.tx(()=>e.store.event(['search_web','browse_web','download_web','request_upload'].includes(name)?'tool.web.failed':'consult.failed',{error:String(err.message).slice(0,500)},'mcp',l));throw err;}finally{e.externalRequests.delete(abort);}
}

