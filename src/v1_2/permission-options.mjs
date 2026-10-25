// Owner-facing inventory of the current executor. Availability does not grant authority.
export const permissionRows = [
 {id:'workbench',group:'optional',title:'建立與修改自己的作品',description:'只能建立自己隔離工作區的文字、CSV、HTML與程式作品。每次保存為新版本，舊版保留；不開放Owner檔案或其他個體。',tools:['work_save','work_import']},
 {id:'execute',group:'optional',title:'執行自己的隔離JavaScript工作',description:'需同時開放作品編輯。只處理明確選入自己的作品，使用return回傳同步JSON。每次最多5秒、引擎16MB、結果32000字元；無一般檔案、網路、shell、套件安裝與背景服務。',tools:['run_javascript']},
 {id:'work_reading',group:'required',title:'查看自己的作品與版本',description:'唯讀查閱自己的作品及執行結果，不能修改或讀取別人的工作區。',tools:['work_list','work_read']},
 {id:'note',group:'optional',title:'新增自己的生活筆記',description:'只能在自己的受控工作區新增筆記，不能覆寫舊筆記或任意存取電腦檔案。取消勾選不會刪除既有筆記。',tools:['write_note']},
 {id:'identity',group:'required',title:'讀取自己的身份與原生條件來源',description:'確認自己是誰及必須遵守的條件，屬於生活必備能力。',tools:['read_identity_bundle','read_identity_domain','read_identity_source']},
 {id:'memory',group:'required',title:'讀取自己的記憶、計畫與原始歷史',description:'只能讀取這個個體自己的紀錄，不能讀取其他個體的資料。',tools:['get_context','query_history','search_memory','read_record','read_document']},
 {id:'workspace',group:'required',title:'查看自己的既有生活筆記',description:'只讀取受控工作區中已保存的筆記，不等於開放一般檔案存取。',tools:['read_workspace']},
 {id:'commit',group:'required',title:'保存每輪記憶、進度與生活紀錄',description:'每輪必須留下可追溯的結果；原始歷史只能追加，不提供覆寫或刪除開關。',tools:['commit_cycle']},
 {id:'brain',group:'required',title:'使用本環境指定模型進行日常思考',description:'每個活動輪次把身份與記憶交給同一個模型，再保存進度；等待期間沒有持續思考。受生活時間與模型額度限制。',tools:[]},
 {id:'consult',group:'optional',title:'主動請教獨立LLM',description:'向本環境指定模型另開獨立對話請教；每輪最多一次，每次另占一個模型輪數；可稍後領取回答，等待不影響其他活動，答案不當成已查證事實。',tools:['consult_llm']},
 {id:'chat',group:'required',title:'與Owner雙向對話及主動傳訊（基本能力）',description:'適用所有個體，不需勾選開放。在有效生活授權內可主動提問、分享或回覆；Owner可隨時留言。停止或時段外不自行喚醒。',tools:['reply_owner','send_owner']},
 {id:'web',group:'optional',title:'瀏覽公開外網（隔離瀏覽器）',description:'可搜尋及閱讀公開HTTPS網站、續讀網頁與自己的文字／CSV／PDF附件，不帶入Owner登入資料，不連本機及私人網路。下載計入額度，上傳自己筆記須逐次批准，不因此登入、發布或付款。',tools:['search_web','browse_web','download_web','request_upload']}
];

