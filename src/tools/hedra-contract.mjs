const request={type:'string',pattern:'^[a-zA-Z0-9_-]{1,100}$',maxLength:100};
const tool=(name,description,properties,required)=>({name,description,inputSchema:{type:'object',properties,required,additionalProperties:false},annotations:{readOnlyHint:name==='hedra_status',destructiveHint:false,openWorldHint:false}});
export const hedraTools=[
 tool('hedra_quote','查詢自己文字需求的Hedra點數估價，不生成。未經Owner啟用OAuth點數連線時拒絕；音訊目前限音樂，影片／音樂必須指定時長；不接受參考檔案、網址或本機路徑。',{request_id:request,kind:{type:'string',enum:['image','video','audio']},model:{type:'string',maxLength:100},prompt:{type:'string',maxLength:3000},parameters:{type:'object',properties:{aspect_ratio:{type:'string',maxLength:32},resolution:{type:'string',maxLength:32},duration_ms:{type:'integer',minimum:1,maximum:60000},quality:{type:'string',maxLength:32}},additionalProperties:false}},['request_id','kind','model','prompt']),
 tool('hedra_submit','把自己的有效估價排入付費工作，先暫留點數，不等待遠端製作。回傳排隊不代表已生成。相同內容回原工作，結果不明不可改request_id重送。',{request_id:request,quote_id:{type:'string',maxLength:100}},['request_id','quote_id']),
 tool('hedra_status','查看自己的Hedra工作與點數紀錄。等待不代表停止其他工作；遠端完成不代表已下載或模型已看過成果。',{job_id:{type:'string',maxLength:100}},[])
];
