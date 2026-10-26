# 受控 Codex／MCP 工具接口（獨立 Windows 候選）

此接口讓任何符合大腦契約的接頭，透過 `delegate_codex` 委派一件作品工作。Codex作為另外的工具執行者，不接替個體身份，也不提交個體記憶。不是官方舊版 Codex MCP server；本版沿用已驗證 CLI 0.164.0-alpha.11.1（亦保留已驗證的0.163.0-alpha.10.2），執行固定的 Kinseed MCP 代理。

## Owner 操作

1. 使用本候選 README 的入口；不要使用其他環境的資料或連線。預設大腦仍停用。
2. 管理合成個體 → 工具權限 → 勾選「委派Codex處理作品工作」→ 保存。未保存不生效，原設定未開放時一律拒絕。
3. 若要編輯或隔離執行，同時開放原本的作品編輯／隔離JavaScript權限。委派權限不能替代它們。
4. 正常設定並明確授權合成個體生活；新增權限不會批准、出生、解除停止或恢復生活。
5. 已產生的作品與執行成果仍在「工具工作與成品 → 作品與執行」查看。完整委派依據為自己的 B：`delegate.intent`／`delegate.result`／`delegate.failed`；私人工作區內 `delegations/<job>/events.jsonl` 保存程序與工具收據。

本次未在其他環境部署或增權；不能因此直接給既有個體打開。

## 工具契約

`delegate_codex({request_id,instruction,operations,inputs})`：instruction最多3000字元；operations可選read／edit／execute，execute須同時選edit；inputs最多5個自己的作品ID。沒有路徑、模型、MCP地址、身份、shell或任意命令欄位。

執行者只取得選入的作品及本次新增作品，讀取分頁仍最多6000字元。工具清單只包含work_read，按選項加入work_save／run_javascript；沒有作品總清單、來源匯入、身份、記憶、Owner傳訊、外網、再次委派或Owner管理接口。即使猜到其他作品ID也拒絕。執行仍為既有QuickJS／WASM，不是Node、主機shell或套件安裝。

父個體有效租約、身份世代、控制版本、時間、停止、權限及16次工具上限仍是最後權威。子工具也消耗該輪工具次數。委派最多60秒且受父輪與生活截止約束；每輪最多一次，另占個體與平台各一次模型額度，失敗不退回、不默默重送。同請求同內容讀回既有收據，不啟動第二次；異內容及另一委派拒絕。寫入請求以本次工作命名空間綁定，避免與其他工作碰撞。

## 隔離、收尾與結果

父大腦的cycle能力不傳入子Codex；子程序只有短效獨立代理能力，沒有Owner能力。CLI沿原MXC、never、禁shell／網路／使用者工具設定，不降低沙箱換取成功。只傳工作指示及明確選入作品，不自動帶身份、記憶或Owner對話。沿原外傳檢查拒絕憑證、本機路徑及已知Owner私人內容；這不是能辨識所有轉述或編碼的完整資料外洩防護。

停止／撤權／到期先撤銷代理，再取消自己的CLI；核對CLI close、已觀察代理PID不再存在及實際工具收尾，才結算。PID只用於保守存活核對，不用PID猜測或停止別人的程序。結果未知、紀錄交易失敗或派送後例外會保留worker／lease並阻擋重送；不提供無證據的「強制清空」恢復按鈕。確認本機程序退出不代表遠端供應商取消或未計費。

`transport_completed`／`status=completed`只代表模型工作完整回覆；`operations_status`另外區分沒有執行、工具失敗或完成。`task_verified=false`、`narrative_verified=false`：文章與任務目標沒有被系統自動認證。請看receipts及原始執行結果；程式拋錯可在模型正常回報的情況下呈現operations_status=failed。作品成功後即保留，後續失敗不刪作品；記憶仍只有父大腦自己的commit_cycle可以原子更新。

## 相容與回退

未增加依賴或DB格式遷移。舊權限缺codex視為false；沒有修改本地模型提示／流程或新增模型特例。已知限制：只驗證此Windows／CLI／固定模型組合；尚無任意第三方MCP安裝或一般主機工具。Qwen完整生活資格仍未通過，不因這個接口而改為通過。

回退先停止本候選並確認工作退出，保存.private與設定。移除delegate_codex註冊、platform分流、可選權限及UI條目即可停用；保留原有作品、收據及B，不用舊資料庫覆蓋歷史，不復活過期授權。既有設定若保留codex欄位，舊permissionSettings會忽略；不要由舊版保存權限後假定此能力仍開放。正式環境未更新，不需要正式回退。

官方參考：[非互動CLI](https://developers.openai.com/codex/noninteractive)、[MCP工具接入](https://developers.openai.com/codex/mcp)。具體旗標以本專案固定CLI與實際證據為準，不假定所有新版相容。

容量不足補充：provider_failure.kind依真實CLI事件分類，顯示繁中提示；模型在部分作品保存後中斷時，operations_status=partial。保留已保存作品與實際用量，不盲目重送整份工作。最後真實重驗曾遇到此情況，原失敗保留，沒有冒稱該案任務成功。

