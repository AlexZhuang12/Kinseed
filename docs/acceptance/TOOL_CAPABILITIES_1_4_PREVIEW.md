# 工具能力1.4獨立候選驗收

版本1.4.0-tool-preview.1。由AI完整執行本輪可執行驗收；沒有第三方真實人類、母語或第二台實體Windows驗收，不聲稱有人類背書。尚未公開發布或更新其他安裝。

本機候選已交付。K07已完成真實寄送限定驗收；收件、正文及PDF開啟由Owner在本對話確認，不是第三方獨立人類全面驗收。

| 位置 | 狀態 | 範圍 |
| --- | --- | --- |
| K00 | PASS | 獨立Windows環境、私人資料邊界、正式與共用服務只讀核對 |
| K01 | PASS | 13項受控MCP工具、預設關權、個體隔離、冪等、失敗與未知結果收尾 |
| K02 | PASS | 文字／網址／手選檔案真實匯入、內容與大腦目的地同意綁定、原檔保留 |
| K03 | PASS | 真實Python與多檔JS，WASM隔離、Windows Job資源限制與停止／逾時收尾 |
| K04 | PASS_WITH_LIMITS | 受控DOM互動預覽與PDF／DOCX／XLSX；未做原生Office版面驗收 |
| K05 | PASS_WITH_LIMITS | 本地OCR、目前Codex原圖與圖表理解；其他大腦視覺未驗證不啟用 |
| K06 | PASS | 三個真實公開API、流量、來源快照、分頁與錯誤 |
| K07 | PASS_REAL_SCOPED | 真實send-only OAuth、逐封批准、單次寄送及PDF附件，Gmail回執及Owner收件確認；不讀信箱 |
| K08 | PASS_SCOPED | 申請與提醒已實作；雲端僅設定未連線，不含付費或跨個體合作 |
| K09 | LOCAL_CANDIDATE_DELIVERED | 獨立操作版、四語、安裝啟停、操作指南與去識別驗收；未正式部署或發布 |

## 實際驗證

600項Node測試通過；新工具四語68項及既有四語146項瀏覽器檢查通過，定向測試與全套有重疊，不相加充作獨立案例。1885條介面字串已產生四語版本，AI翻譯、沒有母語審閱。

真實固定GPT／Codex／MCP完成兩個合成情境共三輪：自行讀材料、寫JS、真實計算31、製作Excel；下一輪保留模型自己寫的記憶並看原圖；另一個合成個體辨識圖表、查真實USGS、製作附件與未寄送草稿。未由系統替模型補寫答案或記憶。

真實維基百科、Crossref、USGS、公開網址材料匯入、固定SHA的packaging安裝及Python使用通過。故障／429／格式變更／錯誤範圍／未知寄送與停止測試是明示合成，不冒充供應商實際事故。

PDF實際產生並渲染，DOCX瀏覽器渲染與python-docx解析，XLSX以openpyxl解析，OCR真實讀固定圖片。LibreOffice／Microsoft Office未安裝，沒有原生Office渲染驗收。乾淨鎖檔安裝、停止、備份與重啟11項通過，仍是同一台電腦。

## 重現

使用Node24及Windows／Chrome，在乾淨來源執行npm ci --ignore-scripts --no-audit --no-fund、npm run tools:prepare、npm test及npm run test:ui。新工具UI為node scripts/verify-hub-ui.mjs後接zh-Hant／zh-Hans／en／ja。文件OCR為node scripts/verify-hub-documents.mjs。公開API驗收node scripts/verify-hub-real-services.mjs會使用真實網路；不要在沒有授權時執行。真實模型測試scripts/verify-hub-model.mjs需--allow-provider，圖表／研究測試scripts/verify-hub-research.mjs另需--allow-network；這些不是預設安裝步驟，會使用帳號額度。

模型圖像驗收先執行文件腳本產生固定合成圖，結果與模型本身可能隨供應商變更，失敗需如實保留。來源套件不含私人原始模型輸出、正式資料、token、OAuth憑證或實際收件人。現有Gmail工具沒有自動真實寄信測試。

## 限制與回退

詳見[操作指南](../OWNER_TOOL_CAPABILITIES.md)及[架構](../TOOL_CAPABILITY_ARCHITECTURE.md)。互動預覽是受控DOM子集，圖片原圖輸入限目前已驗證接頭；網路與記憶體有明示限制。未知外部結果不保證剛好一次寄送，必須人工核對。停止本候選即回退，不把候選來源或舊DB覆蓋其他安裝。

本文件只提供可公開的合成驗收摘要，完整本機證據含私人路徑與正式保留稽核，不應直接公開。下一次GitHub發行另行決策。

## Gmail後續真實驗收

專用Google桌面用戶端僅gmail.send，Owner完成授權並批准唯一合成測試信及PDF附件。受控Owner接口核對內容與附件版本後真實寄送一次；Gmail接受，Owner另確認已收到、正文正常及PDF能開啟。Gmail定向8項回歸PASS。沒有使用正式個體，沒有新LLM生成、沒有信箱讀取或自動重寄。

測試應用程式仍為Google測試模式；不是已完成Google公開應用程式驗證。此補驗不改先前600項全套的歷史結果；本次額外Python回歸在受限環境停滯並收尾，未宣稱重驗通過。原來源ZIP是補驗前的歷史包，不代表目前來源。私人帳號、收件人、token及原始回執不納入本公開摘要。

最新最終收尾見[最終本機驗收](FINAL_LOCAL_GATE_1_4.md)：606 Node、215四語UI、13文件／OCR、11乾淨安裝檢查通過。此前額外Python停滯已完成環境對照及完整回歸；原失敗證據仍保留。
