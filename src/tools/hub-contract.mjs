const str={type:'string',maxLength:10000},key={type:'string',maxLength:100},obj=(properties,required=[])=>({type:'object',properties,required,additionalProperties:false}),list=(items,maxItems=100)=>({type:'array',items,maxItems});
export const HUB_PERMISSIONS=['materials','projects','documents','vision','data','mail'];
export const HUB_TITLES={materials:'閱讀已同意分析的材料',projects:'編輯與執行隔離專案',documents:'製作PDF、Word與Excel',vision:'辨識圖片文字與內容',data:'查詢公開資料服務',mail:'提出郵件草稿，等待Owner批准'};
const tool=(name,description,properties,required)=>({name,description,inputSchema:obj(properties,required),annotations:{readOnlyHint:/list|read|query/.test(name),destructiveHint:false,openWorldHint:name==='data_query'}});
export const hubTools=[
 tool('material_list','列出自己的已同意交給目前大腦分析的材料；不列未同意內容。',{},[]),
 tool('material_read','讀自己的已同意材料，每次最多6000字元；圖片另用image_read。',{material_id:key,offset:{type:'integer',minimum:0}},['material_id']),
 tool('project_save','保存自己隔離專案的新版本。不可使用本機路徑、依賴安裝或外網；先核對目前權限。',{request_id:key,project_id:key,expected_version:{type:'integer',minimum:0},name:key,language:{type:'string',enum:['python','javascript','html']},entry:key,files:list(obj({name:key,content:{type:'string',maxLength:64000}},['name','content']),20)},['request_id','expected_version','name','language','entry','files']),
 tool('project_run','執行自己專案的明確版本。Python在瀏覽器WebAssembly執行；JS在隔離WASM執行。無Owner檔案、任意網路或安裝。',{request_id:key,project_id:key,version:{type:'integer',minimum:1}},['request_id','project_id','version']),
 tool('document_create','製作PDF、Word或Excel。文字及表格均由你提供，不補寫內容；下載成果需查真實結果。',{request_id:key,format:{type:'string',enum:['pdf','docx','xlsx']},title:key,paragraphs:list(str,100),rows:list(list({type:'string',maxLength:2000},30),500)},['request_id','format','title']),
 tool('data_query','查詢已開放的維基百科、Crossref書目或USGS地震公開資料。query只可公開、不含Owner資料；地震採最近資料，不是預警。',{service:{type:'string',enum:['wikipedia','crossref','usgs']},query:{type:'string',maxLength:200},offset:{type:'integer',minimum:0,maximum:1000}},['service']),
 tool('image_view','取得自己已同意交給目前大腦的原始圖片，透過MCP影像輸入供目前模型理解，不另傳外部服務。',{material_id:key},['material_id']),
 tool('image_read','對已同意的自己的圖片執行OCR。取得文字不代表已理解整張圖；視覺模型另有可用狀態。',{request_id:key,material_id:key},['request_id','material_id']),
 tool('tool_request','提出新工具／套件或費用申請。申請成功不代表批准或安裝。',{request_id:key,name:key,purpose:{type:'string',maxLength:2000},source:{type:'string',maxLength:2000},cost:{type:'string',maxLength:500}},['request_id','name','purpose']),
 tool('reminder_save','保存自己的工作期限或提醒，不創造生活授權。到期只在既有授權內安排，否則留待下次生活。',{request_id:key,title:key,due_at:{type:'integer',minimum:1}},['request_id','title','due_at']),
 tool('reminder_ack','將自己的期限或事件標記為已處理，不改變生活授權。',{request_id:key,reminder_id:key},['request_id','reminder_id']),
 tool('mail_draft','建立自己的Gmail寄送草稿，尚未送出。Owner逐封核對對象、正文與附件並批准。不得冒稱已寄送。',{request_id:key,to:{type:'string',maxLength:254},subject:{type:'string',maxLength:200},text:{type:'string',maxLength:12000},attachments:list(key,5)},['request_id','to','subject','text']),
 tool('hub_list','列出自己的專案、文件、申請、提醒及郵件狀態，不讀他人資料。',{},[])
];
