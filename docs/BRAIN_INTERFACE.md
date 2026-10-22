# 大腦執行接口與Codex接頭

第2階段建立第1版大腦契約，先接回既有Codex CLI與指定模型。身份、記憶、出生、時間、額度及權限繼續由Kinseed控制，模型只負責當輪思考與提出工具行動。此接頭沒有部署至其他環境。

## 模組責任

| 模組 | 責任 |
| --- | --- |
| src/brain/contract.mjs | 設定、來源描述、工作格式、完成狀態與用量格式 |
| src/brain/runtime.mjs | 建立接頭，分別提供生活與純文字工作入口 |
| src/brain/codex-adapter.mjs | CLI程序、JSONL、事件、取消、確認退出及私有依據 |
| src/brain/codex-policy.mjs | 保留既有MXC、禁止提權、宿主工具與網路限制 |
| src/brain/preflight.mjs | Windows、支援CLI版本與既有登入檢查，不冒稱模型即時可用 |
| v1_2/codex及report-runner | 保留舊呼叫名稱的相容薄層，不再各自實作程序生命週期 |

目前註冊codex-cli與原指定模型／推理組合，以及完成合成協定驗證的ollama-local。後者尚未選定或驗收真實模型；見LOCAL_BRAIN_PHASE_03.md。未知接頭明確拒絕，不降級或自動換來源。

## 工作與回傳

工作包含purpose、request_id、deadline、prompt與可選AbortSignal。purpose為life、consult或report。life另外取得自己的短效租約、工具能力與控制器連接；接頭先核對本人資料範圍、租約及token雜湊，再啟動CLI，不把Controller或Owner憑證交給模型。

生活工具沿用MCP stdio與受控本機服務，每次操作仍核對停止、期限、權限、世代與範圍。工具事件只是觀察訊號，不是授權。consult與report不能帶生活能力，不配置MCP服務，也不繼承cycle或Owner token；出現工具項目時取消並拒絕該文字結果。

回傳保留既有控制器所需欄位，另有contract、adapter、adapter_version、model、purpose、status與usage。completed同時需要成功退出、turn.completed、未取消及可確認的串流。exit code為0但沒有完成事件仍是unknown。

| 狀態 | 意義 |
| --- | --- |
| completed | 本機程序已結束且模型有完整完成事件；生活還須核對自己的交易提交 |
| failed | 已確認退出並有可識別失敗，例如容量、認證或額度 |
| cancelled | 收到取消／逾時，且已確認本機程序結束；遠端取消不冒稱已確認 |
| unknown | 無法確認完整結果，不憑模型文字或零退出碼猜成功 |

取消先發出請求，再等待close；未確認退出時Promise不提早成功，控制器仍保留原租約／worker收尾防護。接頭不重試工作，容量與安全斷線的有限重試由原控制器決定；有寫入或外部意圖不盲重送。相同依據檔已存在的request_id拒絕另起程序，避免重用編號重跑。

## 記錄與私人資料

生活B歷史新增brain.binding，get_context可取得本輪來源，退出事件包含接頭與模型。既有codex.exit等事件名稱保留相容，不重寫過去紀錄。歷史中個體自己保存的記憶不因接頭更換而改寫。

私有JSONL記錄啟動參數、可公開輸出、工具觀察、用量及退出；不保存reasoning項目，生活能力token會遮蔽。usage缺失為null，不以0代替未知。身份、提示、模型輸出與依據仍可能含私人資料，不能從.private直接發布。

## 已驗證與限制

合成個體經真實指定GPT／Codex／MCP完成兩個獨立Session、自己的筆記、記憶承接與獨立請教；報告用途完成真實純文字JSON呼叫。真實Codex子程序在啟動後取消，確認本機退出、無部分記憶提交並釋放worker；不宣稱已確認遠端推理取消。

容量、斷線、無完成事件、格式錯誤及延遲退出等故障案例使用明示的Node協定fixture，不當成供應商自然事故。本地接頭只完成合成協定驗證，尚未驗證真實本地模型、其他CLI版本、另一台Windows或新版完整每日報告排程。新登入、模型容量與CLI版本仍可能形成可診斷的外部阻塞。

## 回退

先停止本開發環境並確認所有工作收尾，再回復上一版候選程式與停用設定；不覆蓋.private或從舊DB覆蓋生活史。若使用第2版設定，回退前另保存設定，使用明確停用的第1版範例；不能默默忽略未知設定。正式系統未部署，無需操作其控制器或資料。
