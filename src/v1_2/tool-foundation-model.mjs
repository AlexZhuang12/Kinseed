// Read-only projections. This catalog grants no authority and executes no tool.
export const toolCatalog=Object.freeze([
 {id:'workbench',name:'自己的作品與版本',place:'本地隔離資料庫',cost:'不增加模型請求；歷代正文共10MB',permission:'workbench',action:'建立或修改文字、CSV、HTML與程式，每次另存新版本',data:'自己的作品，不接受本機路徑',result:'可追溯的作品版本'},
 {id:'execute',name:'隔離JavaScript實作',place:'本地WebAssembly解譯器',cost:'在原活動內執行；最多5秒、引擎16MB、輸出32000字元',permission:'execute',action:'執行自己的指定版本，回傳同步JSON。需另開作品編輯；不是一般Node、shell或桌面工具',data:'只含明確選入自己的作品；沒有Owner檔案、帳號、憑證或網路',result:'成功成果或明確失敗及收尾紀錄'},
 {id:'read-own',name:'自己的記憶與文件閱讀',place:'本地',cost:'不新增模型請求或外部下載',permission:null,action:'搜尋自己的筆記與記憶，分頁讀取紀錄、網頁快照、文字、CSV與PDF；不執行文件',data:'自己的紀錄event_id或文件document_id，不接受本機路徑',result:'原文、分頁位置與來源雜湊'},
 {id:'search',name:'公開網路搜尋',place:'線上',cost:'計入既有下載額度，不登入或付費',permission:'web',publicOnly:true,action:'以Bing公開HTTPS搜尋公開問題；外站結果尚需逐頁核對',data:'不含私人資料的公開問題',result:'公開搜尋結果或明確的服務限制'},
 {id:'think',name:'模型思考',place:'線上',cost:'共用模型用量；費用未完整量測',permission:null,action:'讀取自身身份與記憶，完成本輪活動',data:'自己的身份、記憶與允許的工作資料',result:'本輪結果與記憶紀錄'},
 {id:'note',name:'受控筆記',place:'本地',cost:'無額外服務呼叫',permission:'note',action:'建立自己的筆記；不開放任意檔案操作',data:'個體產生並允許保存的內容',result:'自己的筆記成品'},
 {id:'consult',name:'獨立模型請教',place:'線上',cost:'計入個體與平台模型輪數',permission:'consult',action:'向獨立模型提出問題',data:'允許送出的問題內容',result:'建議回答；不是已查證事實'},
 {id:'chat',name:'與 Owner 雙向對話（基本能力）',place:'平台內',cost:'傳訊在原活動內進行，不另外呼叫模型',permission:null,action:'所有個體皆可主動傳訊、提問、分享及回覆，不需Owner另開對話權限',data:'本個體的對話',result:'對話紀錄與Owner收件匣'},
 {id:'browse',name:'公開網頁瀏覽',place:'線上',cost:'計入下載額度',permission:'web',action:'閱讀已允許範圍的公開 HTTPS 網頁',data:'允許公開的網址與查詢；不帶 Owner 本機資料',result:'網頁閱讀紀錄'},
 {id:'download',name:'公開附件下載',place:'線上',cost:'計入下載額度',permission:'web',publicOnly:true,action:'保存支援格式的公開附件，不執行附件',data:'公開附件網址',result:'自己的附件成品'},
 {id:'upload',name:'筆記上傳申請',place:'線上',cost:'計入共用上傳額度',permission:'web',publicOnly:true,action:'提出自己的筆記上傳申請，每次仍須 Owner 核准',data:'自己的指定筆記全文與目的網址',result:'申請及外站回覆紀錄'}
]);
export function toolAvailability(tool,e){if(!e)return '請先選擇個體';const p=e.control.permissions;if(tool.permission&&!p[tool.permission])return '未授權';if(tool.publicOnly&&p.web_mode!=='public')return '需公開外網模式';return tool.permission?'已授權；執行仍受生活與額度限制':'既有基本能力；執行仍受生活與額度限制';}
export function projectToolWork(events,individual,network={}){
 const own=events.filter(e=>e.individual_id===individual),work=[],outputs=[];
 const labels={'work.saved':['作品版本保存','完成'],'work.completed':['隔離JavaScript實作','完成'],'work.failed':['隔離JavaScript實作','未完成'],'work.cancelled':['隔離JavaScript實作','已取消'],'work.timed_out':['隔離JavaScript實作','已停止'],'work.interrupted':['隔離JavaScript實作','重啟中斷'],'document.read':['文件閱讀','完成'],'memory.searched':['自己的記憶搜尋','完成'],'record.read':['原始紀錄閱讀','完成'],'tool.note.result':['受控筆記','完成'],'consult.result':['獨立模型請教','完成'],'consult.failed':['獨立模型請教','未完成'],'tool.owner_reply':['回覆 Owner','完成'],'tool.owner_message':['主動傳訊給 Owner','已保存；不代表已讀'],'tool.web.result':['外網工作','已回報結果'],'tool.web.failed':['外網工作','未完成'],'tool.denied':['工具使用','遭拒絕'],'cycle.committed':['模型活動','完成'],'cycle.incomplete':['模型活動','未確認完成']};
 for(const e of own){const label=labels[e.type];if(label)work.push({title:label[0],state:label[1],at:e.utc,evidence:e});if(e.type==='tool.note.result')outputs.push({kind:'note',title:e.result.name,text:e.result.text,at:e.utc,evidence:e});}
 for(const r of network.pending??[])if(r.individual===individual)work.push({title:'筆記上傳：'+r.name,state:'等待 Owner 確認；尚未上傳',at:new Date(r.created_at).toISOString(),evidence:r,pending:true});
 for(const r of network.documents??[])if(r.individual===individual)outputs.push({kind:'attachment',title:r.source,at:r.at,document:r,evidence:r});
 return {work:work.sort((a,b)=>String(b.at).localeCompare(String(a.at))),outputs:outputs.sort((a,b)=>String(b.at).localeCompare(String(a.at)))};
}
