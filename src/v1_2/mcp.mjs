import {hubTools} from '../tools/hub-contract.mjs';
// MCP stdio JSON-RPC transport. This fixed proxy has no Owner capability or filesystem API.
import path from 'node:path';import readline from 'node:readline';import {argumentError} from './tool-guidance.mjs';import {workbenchTools} from './workbench-tools.mjs';
import {delegationTool} from '../tools/delegation.mjs';
let workbenchAvailable=false;let hubAvailable=false;
let delegationAvailable=true;
const string={type:'string'},integer={type:'integer'};
const schema=(properties={},required=[])=>({type:'object',properties,required,additionalProperties:false});
let extraCapabilities=false;
export const tools=[...hubTools,delegationTool,...workbenchTools,
 {name:'search_web',description:'在既有公開外網權限與下載額度內使用Bing公開HTTPS搜尋，只送公開問題，不登入、不付費。失敗或無可用結果會明示，不假造來源。',inputSchema:schema({query:{type:'string',maxLength:300}},['query'])},
 {name:'read_document',description:'依document_id分頁閱讀自己的網頁快照、已下載純文字、CSV、PDF，以及自己工具製作的PDF、Word與Excel，不讀本機路徑、不接外網、不執行文件。每次最多6000字元；使用next_offset續讀。',inputSchema:schema({document_id:string,offset:{type:'integer',minimum:0},max_chars:{type:'integer',minimum:1,maximum:6000}},['document_id'])},
 {name:'read_identity_bundle',description:'分頁讀取伺服器核對的自身完整批准身份，必須帶目前package_hash；未讀完不得宣稱全文已讀。',inputSchema:schema({package_hash:string,offset:{type:'integer',minimum:0},max_chars:{type:'integer',minimum:1,maximum:12000}},['package_hash'])},
 {name:'search_memory',description:'以關鍵字搜尋自己的筆記、記憶提交或Owner對話，回傳原始event_id。省略query可列最近紀錄。',inputSchema:schema({query:{type:'string',maxLength:200},kind:{type:'string',enum:['notes','cycles','owner_messages']},cursor:string,max_results:{type:'integer',minimum:1,maximum:5}})},
 {name:'read_record',description:'以search_memory回傳的event_id讀取自己完整原始紀錄，支援分頁；不讀任意路徑或他人資料。',inputSchema:schema({event_id:string,offset:{type:'integer',minimum:0},max_chars:{type:'integer',minimum:1,maximum:6000}},['event_id'])},
 {name:'send_owner',description:'主動向Owner傳送訊息、提問或分享，不必先有Owner留言。只送到本平台自己的對話與Owner收件匣，不代表Owner已讀、不會喚醒或延長生活。沿用chat權限。',inputSchema:schema({request_id:{type:'string',maxLength:100},text:{type:'string',maxLength:4000}},['request_id','text'])},
 {name:'download_web',description:'下載公開HTTPS的PDF、文字或圖片到自己的隔離資料庫，不執行；計入下載額度。',inputSchema:schema({url:{type:'string',maxLength:2000}},['url'])},
 {name:'request_upload',description:'提出上傳自己已保存筆記的申請，由Owner逐次批准目的URL與內容，不接受本機路徑。',inputSchema:schema({request_id:string,url:{type:'string',maxLength:2000},note_id:string,reason:{type:'string',maxLength:500}},['request_id','url','note_id','reason'])},
 {name:'browse_web',description:'依Owner權限瀏覽公開HTTPS網站，公開模式使用隔離動態瀏覽器；不得在網址夾帶私人資料。回傳連結可繼續閱讀，額度不足仍可思考及保存進度。',inputSchema:schema({url:{type:'string',maxLength:2000},max_chars:{type:'integer',minimum:1,maximum:6000}},['url'])},
 {name:'consult_llm',description:'向本環境設定的大腦模型另開獨立對話諮詢一次；每輪最多一次，計入個體與平台模型額度。回答不代表已查證。',inputSchema:schema({request_id:string,question:{type:'string',maxLength:3000}},['request_id','question'])},
 {name:'reply_owner',description:'回覆自己的Owner留言，不傳送給外部收件者；須使用get_context提供的message_id。',inputSchema:schema({request_id:string,reply_to:string,text:{type:'string',maxLength:4000}},['request_id','reply_to','text'])},
 {name:'read_identity_domain',description:'分頁讀取自身已批准八領域的完整條目及來源關聯；每頁最多 12000 字元。',inputSchema:schema({domain_id:string,offset:{type:'integer',minimum:0},max_chars:{type:'integer',minimum:1,maximum:12000}},['domain_id'])},
 {name:'read_identity_source',description:'讀取自身已批准身份來源原文；offset 為字元位置，每頁最多 6000 字元。只可讀 get_context 列出的 source_id。',inputSchema:schema({source_id:string,offset:{type:'integer',minimum:0},max_chars:{type:'integer',minimum:1,maximum:6000}},['source_id'])},
 {name:'get_context',description:'取得測試身份、版本化記憶／計畫、有效授權、剩餘窗口與輪次。每輪首先呼叫。',inputSchema:schema()},
 {name:'query_history',description:'分頁查詢不可覆寫事件來源。cursor 為此個體上一頁回傳的不透明識別碼。',inputSchema:schema({cursor:{type:'string'}})},
 {name:'read_workspace',description:'從最近的自己的筆記開始分頁讀取全文，每頁最多4篇。用回傳的next_cursor讀更早筆記；不是只讀最早100筆事件。cursor只對本個體有效。',inputSchema:schema({cursor:{type:'string'}})},
 {name:'write_note',description:'受控新增本地筆記產物；不能覆寫檔案、控制或歷史。reason 是可公開簡短選擇理由。',inputSchema:schema({request_id:{type:'string',maxLength:100},name:{type:'string',pattern:'^[-a-zA-Z0-9_]{1,60}\\.md$'},text:{type:'string',maxLength:8000},reason:{type:'string',maxLength:500}},['request_id','name','text','reason'])},
 {name:'commit_cycle',description:'以 expected_version 原子提交更新後的整份記憶與計畫快照、結果及 continue/wait。memory與plan不是新增差額；空清單代表將目前清單設為空。不可修改授權或窗口。記憶最多60條、每條1000字元；計畫最多20條、每條500字元；結果2000字元，整體參數最多20000字元。條數是可用空間，不是要填滿；所有欄位及格式共同計入總量，不自動刪除或濃縮內容。每輪最後成功提交一次；continue或wait由個體依當前可行工作及休息需要選擇，個別工作待外部回覆不會強制整體等待。保留真實缺口，不把局部限制當新增治理。未執行的參數拒絕可依錯誤修正，不自動截斷記憶。',inputSchema:schema({request_id:{type:'string',maxLength:100},expected_version:integer,memory:{type:'array',items:{type:'string',maxLength:1000},maxItems:60},plan:{type:'array',items:{type:'string',maxLength:500},maxItems:20},result:{type:'string',maxLength:2000},decision:{type:'string',enum:['continue','wait']},wait_ms:{type:'integer',minimum:10000,maximum:3600000}},['request_id','expected_version','memory','plan','result','decision'])}
].map(t=>({...t,annotations:{readOnlyHint:['document_view','read_document','search_web','read_identity_bundle','search_memory','read_record','get_context','query_history','read_workspace','read_identity_domain','read_identity_source','browse_web'].includes(t.name),destructiveHint:false,openWorldHint:t.name==='browse_web'}}));
export function validateArguments(name,args){
 const definition=tools.find(t=>t.name===name);if(!definition)throw Error('UNKNOWN_TOOL');
 const fail=(field,reason,expected)=>{throw argumentError(name,args,field,reason,expected);};
 const validate=(s,v,field='')=>{if(s.type==='object'){if(!v||typeof v!=='object'||Array.isArray(v))fail(field,'必須是欄位物件',{type:'object'});for(const k of Object.keys(v))if(!Object.hasOwn(s.properties,k))fail(field?field+'.'+k:k,'不是此工具接受的欄位',{allowed_fields:Object.keys(s.properties)});for(const k of s.required??[])if(!Object.hasOwn(v,k))fail(field?field+'.'+k:k,'尚未填寫',{required:true,type:s.properties[k].type});for(const [k,value]of Object.entries(v))validate(s.properties[k],value,field?field+'.'+k:k);}
 else if(s.type==='array'){if(!Array.isArray(v)||v.length>(s.maxItems??100))fail(field,`必須是最多${s.maxItems??100}項的清單`,{type:'array',maximum_items:s.maxItems??100});for(const [i,value]of v.entries())validate(s.items,value,field+'['+i+']');}
 else if(s.type==='integer'){if(!Number.isSafeInteger(v)||v<(s.minimum??Number.MIN_SAFE_INTEGER)||v>(s.maximum??Number.MAX_SAFE_INTEGER))fail(field,`必須是${s.minimum??'有效範圍'}至${s.maximum??'有效範圍'}的整數`,{type:'integer',minimum:s.minimum??null,maximum:s.maximum??null});}
 else if(s.type==='string'){if(typeof v!=='string')fail(field,'必須是文字',{type:'string'});if(v.length>(s.maxLength??10000))fail(field,`最多${s.maxLength??10000}字元`,{maximum_chars:s.maxLength??10000});if(s.pattern&&!new RegExp(s.pattern).test(v))fail(field,'格式不符合工具要求',{pattern:s.pattern});if(s.enum&&!s.enum.includes(v))fail(field,'請選擇工具提供的項目',{allowed_values:s.enum});}};
 validate(definition.inputSchema,args);if(['get_context','query_history','write_note','commit_cycle'].includes(name)&&JSON.stringify(args).length>20000)throw argumentError(name,args,'輸入內容','整體最多20000字元',{maximum_chars:20000});
 if(name==='search_web'&&!args.query.trim())throw Error('請提供不含私人資料的公開搜尋問題。');
 if(name==='send_owner'&&(!args.request_id.trim()||!args.text.trim()))throw Error('TOOL_SCHEMA');
}
export async function handle(message){
 const {method,id}=message;if(id===undefined)return null;
 if(method==='initialize'){
  const r=await fetch(process.env.KINSEED_ENDPOINT+'/cycle/protocol',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.KINSEED_CYCLE_TOKEN},body:JSON.stringify({requested_version:String(message.params?.protocolVersion??'unknown').slice(0,40),negotiated_version:'2024-11-05'}),signal:AbortSignal.timeout(5000)});
  if(!r.ok)throw Error('MCP_AUDIT_UNAVAILABLE');
  const protocol=await r.json();hubAvailable=protocol.capabilities?.tool_hub===true;extraCapabilities=protocol.capabilities?.version===1;workbenchAvailable=protocol.capabilities?.workbench===true;delegationAvailable=protocol.capabilities?.codex_delegation!==false;
  return {protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'kinseed-controlled-local',version:'0.1.0'}};
 }
 if(method==='ping')return {};
 if(method==='tools/list')return {tools:tools.filter(t=>(hubAvailable||!hubTools.some(h=>h.name===t.name))&&(t.name!=='delegate_codex'||delegationAvailable)&&(!workbenchTools.some(w=>w.name===t.name)||workbenchAvailable)&&(extraCapabilities||!['search_web','read_document','browse_web','download_web','request_upload','consult_llm','reply_owner','send_owner'].includes(t.name)))};
 if(method==='resources/list')return {resources:[]};
 if(method==='resources/templates/list')return {resourceTemplates:[]};
 if(method==='tools/call'){
   const {name,arguments:args={}}=message.params??{};const definition=tools.find(t=>t.name===name);
   if(!definition||!hubAvailable&&hubTools.some(h=>h.name===name)||workbenchTools.some(w=>w.name===name)&&!workbenchAvailable||!extraCapabilities&&['browse_web','download_web','request_upload','consult_llm','reply_owner','send_owner'].includes(name))throw Error('UNKNOWN_TOOL');
   // Schema validation is authoritative in the broker, so refused calls are also audited.
   const response=await fetch(process.env.KINSEED_ENDPOINT+'/cycle/tool',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.KINSEED_CYCLE_TOKEN},body:JSON.stringify({name,args}),signal:AbortSignal.timeout(hubTools.some(h=>h.name===name)?60000:name==='delegate_codex'?75000:name==='run_javascript'?15000:name==='consult_llm'?60000:name==='read_document'?15000:['search_web','browse_web','download_web'].includes(name)?35000:5000)});
   const result=await response.json();if(response.ok&&result._mcp_image){const {_mcp_image,...meta}=result;return {content:[{type:'text',text:JSON.stringify(meta)},_mcp_image],isError:false};}return {content:[{type:'text',text:JSON.stringify(result)}],isError:!response.ok};
 }
 throw Error('METHOD_NOT_FOUND');
}
if(process.argv[1]&&path.resolve(import.meta.filename).toLowerCase()===path.resolve(process.argv[1]).toLowerCase()) {
 readline.createInterface({input:process.stdin,crlfDelay:Infinity}).on('line',async line=>{
  let m;try{if(line.length>(workbenchAvailable?400000:30000))throw Error('MESSAGE_LIMIT');m=JSON.parse(line);const result=await handle(m);if(result!==null)process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');}
  catch(e){if(m?.id!==undefined)process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,error:{code:-32602,message:e.message}})+'\n');}
 });
}
