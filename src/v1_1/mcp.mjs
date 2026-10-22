// MCP stdio JSON-RPC transport. This fixed proxy has no Owner capability or filesystem API.
import readline from 'node:readline';
const string={type:'string'},integer={type:'integer'};
const schema=(properties={},required=[])=>({type:'object',properties,required,additionalProperties:false});
export const tools=[
 {name:'read_identity_source',description:'讀取自身已批准身份來源原文；offset 為字元位置，每頁最多 6000 字元。只可讀 get_context 列出的 source_id。',inputSchema:schema({source_id:string,offset:{type:'integer',minimum:0},max_chars:{type:'integer',minimum:1,maximum:6000}},['source_id'])},
 {name:'get_context',description:'取得測試身份、版本化記憶／計畫、有效授權、剩餘窗口與輪次。每輪首先呼叫。',inputSchema:schema()},
 {name:'query_history',description:'分頁查詢不可覆寫事件來源。cursor 為此個體上一頁回傳的不透明識別碼。',inputSchema:schema({cursor:{type:'string'}})},
 {name:'read_workspace',description:'讀取已保存的本地觀察筆記。更多資料使用 query_history。',inputSchema:schema()},
 {name:'write_note',description:'受控新增本地筆記產物；不能覆寫檔案、控制或歷史。reason 是可公開簡短選擇理由。',inputSchema:schema({request_id:string,name:{type:'string',pattern:'^[-a-zA-Z0-9_]{1,60}\\.md$'},text:{type:'string',maxLength:8000},reason:{type:'string',maxLength:500}},['request_id','name','text','reason'])},
 {name:'commit_cycle',description:'以 expected_version 原子提交新記憶、計畫、結果及 continue/wait。不可修改授權或窗口。每輪最後呼叫一次。',inputSchema:schema({request_id:string,expected_version:integer,memory:{type:'array',items:string,maxItems:20},plan:{type:'array',items:string,maxItems:10},result:{type:'string',maxLength:2000},decision:{type:'string',enum:['continue','wait']},wait_ms:{type:'integer',minimum:10000,maximum:3600000}},['request_id','expected_version','memory','plan','result','decision'])}
].map(t=>({...t,annotations:{readOnlyHint:['get_context','query_history','read_workspace'].includes(t.name),destructiveHint:false,openWorldHint:false}}));
export function validateArguments(name,args){
 const definition=tools.find(t=>t.name===name);if(!definition)throw Error('UNKNOWN_TOOL');
 const validate=(s,v)=>{if(s.type==='object'){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!Object.hasOwn(s.properties,k))||(s.required??[]).some(k=>!Object.hasOwn(v,k)))throw Error('TOOL_SCHEMA');for(const [k,value]of Object.entries(v))validate(s.properties[k],value);}
 else if(s.type==='array'){if(!Array.isArray(v)||v.length>(s.maxItems??100))throw Error('TOOL_SCHEMA');for(const value of v)validate(s.items,value);}
 else if(s.type==='integer'){if(!Number.isSafeInteger(v)||v<(s.minimum??Number.MIN_SAFE_INTEGER)||v>(s.maximum??Number.MAX_SAFE_INTEGER))throw Error('TOOL_SCHEMA');}
 else if(s.type==='string'){if(typeof v!=='string'||v.length>(s.maxLength??10000)||s.pattern&&!new RegExp(s.pattern).test(v)||s.enum&&!s.enum.includes(v))throw Error('TOOL_SCHEMA');}};
 validate(definition.inputSchema,args);
}
export async function handle(message){
 const {method,id}=message;if(id===undefined)return null;
 if(method==='initialize'){
  const r=await fetch(process.env.KINSEED_ENDPOINT+'/cycle/protocol',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.KINSEED_CYCLE_TOKEN},body:JSON.stringify({requested_version:String(message.params?.protocolVersion??'unknown').slice(0,40),negotiated_version:'2024-11-05'}),signal:AbortSignal.timeout(5000)});
  if(!r.ok)throw Error('MCP_AUDIT_UNAVAILABLE');
  return {protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'kinseed-controlled-local',version:'0.1.0'}};
 }
 if(method==='ping')return {};
 if(method==='tools/list')return {tools};
 if(method==='resources/list')return {resources:[]};
 if(method==='resources/templates/list')return {resourceTemplates:[]};
 if(method==='tools/call'){
   const {name,arguments:args={}}=message.params??{};const definition=tools.find(t=>t.name===name);
   if(!definition)throw Error('UNKNOWN_TOOL');
   // Schema validation is authoritative in the broker, so refused calls are also audited.
   const response=await fetch(process.env.KINSEED_ENDPOINT+'/cycle/tool',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.KINSEED_CYCLE_TOKEN},body:JSON.stringify({name,args}),signal:AbortSignal.timeout(5000)});
   const result=await response.json();return {content:[{type:'text',text:JSON.stringify(result)}],isError:!response.ok};
 }
 throw Error('METHOD_NOT_FOUND');
}
if(process.argv[1]&&new URL(import.meta.url).pathname.toLowerCase().endsWith(process.argv[1].replaceAll('\\','/').toLowerCase().replace(/^[A-Z]:/i,''))) {
 readline.createInterface({input:process.stdin,crlfDelay:Infinity}).on('line',async line=>{
  let m;try{if(line.length>30000)throw Error('MESSAGE_LIMIT');m=JSON.parse(line);const result=await handle(m);if(result!==null)process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');}
  catch(e){if(m?.id!==undefined)process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,error:{code:-32602,message:e.message}})+'\n');}
 });
}
