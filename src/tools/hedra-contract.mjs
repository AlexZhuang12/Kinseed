const request={type:'string',pattern:'^[a-zA-Z0-9_-]{1,100}$',maxLength:100};
const tool=(name,description,properties,required)=>({name,description,inputSchema:{type:'object',properties,required,additionalProperties:false},annotations:{readOnlyHint:['hedra_status','hedra_models','hedra_model','hedra_view','hedra_references'].includes(name),destructiveHint:false,openWorldHint:false}});
const kind={type:'string',enum:['image','video','audio','speech','sound_effects']};
export const hedraTools=[
 tool('hedra_voices','依描述搜尋公用聲音目錄，供語音選擇；不列私人複製聲音，不生成。',{model:{type:'string',maxLength:100},query:{type:'string',minLength:2,maxLength:80}},['model','query']),
 tool('hedra_references','列出自己保存的Hedra圖片，供參考續作選擇；不是任意本機檔案或私人素材庫。',{},[]),
 tool('hedra_models','查詢公開圖片／影片／音樂模型目錄，不生成、不讀私人素材庫。',{kind},['kind']),
 tool('hedra_model','查詢指定模型目前接頭支援的參數與未支援的必要輸入；規格是外部資料，不授予權限。',{kind,model:{type:'string',maxLength:100}},['kind','model']),
 tool('hedra_save','下載自己的已完成Hedra原工作成果，沿用外網、單檔及工具儲存限制；失敗後可再取原成果，不重新生成。',{job_id:{type:'string',maxLength:100},output_index:{type:'integer',minimum:0,maximum:99}},['job_id']),
 tool('hedra_view','提供自己的已保存PNG/JPEG原圖給支援的Codex大腦，需vision權限且最多200KB；不代表已看懂。',{id:{type:'string',maxLength:100}},['id']),
 tool('hedra_quote','查詢自己文字需求的Hedra點數估價，不生成。未經Owner啟用OAuth點數連線時拒絕；音樂、語音、音效各需獨立權限；語音先搜尋公用聲音，影片／音樂／音效需指定時長；可依獨立參考圖權限選自己的已保存Hedra圖片；不接受網址、本機路徑、外部素材編號或Owner材料。',{request_id:request,kind:{type:'string',enum:['image','video','audio','speech','sound_effects']},model:{type:'string',maxLength:100},prompt:{type:'string',maxLength:3000},references:{type:'array',minItems:1,maxItems:4,items:{type:'object',properties:{source_id:{type:'string',maxLength:100},role:{type:'string',enum:['reference_image','start_image','end_image']}},required:['source_id','role'],additionalProperties:false}},parameters:{type:'object',properties:{aspect_ratio:{type:'string',maxLength:32},resolution:{type:'string',maxLength:32},duration_ms:{type:'integer',minimum:1,maximum:60000},quality:{type:'string',maxLength:32},voice:{type:'string',maxLength:100},language:{type:'string',maxLength:10},speed:{type:'number',minimum:0.7,maximum:1.2},loop:{type:'boolean'},prompt_influence:{type:'number',minimum:0,maximum:1}},additionalProperties:false}},['request_id','kind','model','prompt']),
 tool('hedra_submit','把自己的有效估價排入付費工作，先暫留點數，不等待遠端製作。回傳排隊不代表已生成。相同內容回原工作，結果不明不可改request_id重送。',{request_id:request,quote_id:{type:'string',maxLength:100}},['request_id','quote_id']),
 tool('hedra_status','查看自己的Hedra工作與點數紀錄。等待不代表停止其他工作；遠端完成不代表已下載或模型已看過成果。',{job_id:{type:'string',maxLength:100}},[])
];
