# Kinseed — Windows預覽版

原創程式與文件採用 [Apache-2.0](LICENSE)，第三方保留各自授權，詳見 [NOTICE](NOTICE) 與 [第三方聲明](docs/THIRD_PARTY_NOTICES.md)。身份、記憶、私人歷史及模型權重不包含於來源包。依 Owner 決定目前僅準備本機來源包，暫不上傳 GitHub。

本版已建立獨立Windows環境、私人資料邊界、統一大腦契約、Codex CLI／Ollama接頭、受控Codex作品工具與首次設定導引；1.2.1-preview.1另完成連續操作導引候選。不附帶本地模型；已用既有小型本地模型完成獨立合成環境的真實接入測試，但尚未通過完整自主生活相容性。首次啟動使用空資料庫，不匯入任何既有個體或身份包；後續啟動保留本環境資料。大腦預設停用，每日報告排程也停用。

版本1.3.0-preview.1已完成本機AI驗收，等待發布授權。[發布說明](docs/RELEASE_NOTES_1_3_0_PREVIEW_1.md)及[安全收尾](docs/RELEASE_CANDIDATE_SECURITY.md)列出實際範圍。

目前各階段、操作導引及發布前驗收，以 [開源工程計畫](docs/OPEN_SOURCE_ENGINEERING_PLAN.md) 為彙整入口；已完成的候選功能不等於已套用其他執行中副本或已公開發布。

可選逐步工具流程與產品／模型驗收分界見 [模型接入基本標準](docs/MODEL_ADAPTER_STANDARD.md)。本地範例使用明確的 tool_protocol，預設仍停用；舊設定不自動改選流程。

## 第一次使用（不需要編輯JSON）

安裝Node.js 24.19以上的24系列版本後，雙擊「首次設定.cmd」，依五步導引安裝套件、選擇大腦、準備Codex／MCP、保存及啟動。設定頁在依賴尚未安裝時即可開啟。詳見 [Windows初次使用指南](docs/FIRST_RUN_WINDOWS.md)。

乾淨來源包需包含package-lock.json；請使用scripts/export-source.mjs建立，不直接使用npm pack清單作來源包。尚未發布GitHub。

發布準備：[資料與外連說明](docs/PRIVACY.md)、[備份與回退](docs/UPGRADE_ROLLBACK.md)、[第三方聲明](docs/THIRD_PARTY_NOTICES.md)、[發布清單與Owner決策](docs/RELEASE_CHECKLIST.md)。`npm run release:check` 執行離線來源／鎖檔檢查；`npm run backup` 只備份已停止的本副本，不覆寫資料庫。

## 進階：命令列安裝與啟動

1. 安裝Node.js 24.19.0或同系列較新版本，僅支援Windows。
2. 在本目錄執行 `npm ci --ignore-scripts --no-audit --no-fund`，按鎖檔安裝依賴。
3. 執行「檢查開發環境.cmd」。
4. 執行「啟動開發控制台.cmd」，保留該命令視窗。
5. 執行「開啟開發控制台.cmd」，以瀏覽器查看開發控制台。
6. 使用完畢執行「停止開發控制台.cmd」。再次啟動保留本開發環境自己的草稿及測試資料，但不自動恢復生活。

也可在本目錄使用 `npm start`、`npm run open`、`npm run status`、`npm stop`。這些命令只讀取本開發版自己的連線檔，不能操作其他環境。

## 啟用開發版Codex大腦

1. 先停止本開發控制台。
2. 確認自己已登入受支援的Codex CLI；目前只驗證0.163.0-alpha.10.2，不自動下載或接受其他版本。
3. 執行 `npm run brain:enable`，只保存本開發版第2版設定，不出生、不恢復生活。
4. 執行 `npm run check` 查看接頭與登入預檢，再 `npm start` 與 `npm run open`。
5. 控制台「開發版大腦接入狀態」顯示Codex CLI及指定模型。預檢通過只代表版本與登入可用，即時模型容量以實際工作為準。
6. 合成個體仍須經Owner明確批准身份與出生，才能在授權時段活動。停止、到期及重啟不自動恢復。

要停用大腦，先停止開發控制台，再執行 `npm run brain:disable`。設定切換不在執行中進行，已保存的草稿、記憶及歷史不刪除。第1版停用設定繼續相容；第2版範例見 `config/codex.example.json`。本地協定接頭見下節，不自動切換模型。

## 程式與私人資料

| 位置 | 用途 | 可否作為公開來源 |
| --- | --- | --- |
| `src/`、`scripts/` | 候選程式與開發入口 | 經最終審查後可 |
| `config/development.example.json` | 不含憑證的設定範例 | 可 |
| `config/development.local.json` | 使用者自己的設定覆寫 | 不公開 |
| `.private/development/runtime/` | 本環境SQLite、身份、記憶與歷史 | 不公開 |
| `.private/development/session.json` | 本次Owner連線憑證 | 不公開 |
| `.private/development/logs/`、`reports/` | 私人日誌與預留報告資料區 | 不公開 |
| `.private/test-*`、`.private/unit-*` | 合成測試資料 | 不公開 |
| `tests/` | 不含真實身份的測試程式 | 可 |

設定格式第1至3版見 `config/development.schema.json`，程式執行時仍會自行嚴格驗證。需要覆寫時將範例另存為 `config/development.local.json`；資料位置只能是本目錄下 `.private/名稱`，不能指定舊runtime、絕對路徑或連結。埠號0由系統分配，不使用既有產品服務埠。無效設定不會退回預設值偷偷啟動，設定內不放登入憑證。

## 可操作的範圍

可查看控制台、建立獨立合成個體、保存身份草稿與閱讀紀錄。大腦啟用且預檢通過後，可驗證本環境合成個體的生活、受控MCP及記憶承接。全域停止、出生檢查與Owner驗證仍保留；報告用途執行接口與報告排程是不同功能，本入口沒有自動啟用每日報告服務。

原生條件與治理原文不隨本版匯入，沒有複製使用者原本的個體、作品、對話、包版本或生活史。舊主程式入口已停用，避免自動遷移或啟動另一個報告服務。

## 驗證與後續

執行 `npm test`、`npm run boundary:check`。邊界檢查會找出已知私人檔案類型、原環境識別與舊入口問題，不能取代完整秘密掃描或作業系統隔離。Windows同一管理者仍可讀取本機資料。

統一接口已以Codex驗證生活、請教、報告用途及取消收尾；本地接頭有合成機制驗證及真實模型紀錄；機制通過不等於所選模型能完成完整生活任務。此目錄採 Apache-2.0、尚未公開發布；`private: true`保留以防誤發npm，與開源授權是不同設定。不能將目前整個私人專案當成發布來源。實際執行依據保存在本環境.private，不能當作公開測試素材直接發布。

完整邊界與升級原則見 [開發架構](docs/ARCHITECTURE.md)，接頭契約與驗收範圍見 [大腦接口](docs/BRAIN_INTERFACE.md)。

## 本地模型準備

執行 `npm run brain:resources`唯讀查看CPU、RAM與磁碟餘裕，不會載入模型。第3版停用範例為 `config/local-model.example.json`，模型名稱只是待填佔位。請先閱讀[本地接頭與限制](docs/LOCAL_BRAIN_PHASE_03.md)，待模型選定與實測安排後再設定；不會自動下載、安裝或改用雲端。早期階段只有合成HTTP協定驗證；後續已保留真實本地模型對照紀錄，但所測小模型尚未通過完整生活相容性。請依模型接入標準及目前工程計畫判讀，不能把接頭通過當作模型能力合格。

## 受控 Codex 工具委派候選

已新增 delegate_codex：與大腦接頭分離，透過自己的短效 MCP 代理，只處理明確選入及本次新增作品。Owner 的工具權限新增「委派Codex處理作品工作」，預設關閉；編輯、隔離執行仍需原權限。沒有一般主機工具或任意第三方MCP安裝。操作、額度、收尾及回退見 [接口指南](docs/CODEX_TOOL_INTERFACE.md)。本地小模型完整生活資格仍未通過；本次沒有為它新增特例或改為合格。



## 首次操作與接續

版本1.2.1-preview.1提供首頁流程圖、管理個體下一步、生活設定返回入口與常駐「操作導引」。請參閱 [繁體中文操作指南](docs/OWNER_QUICK_GUIDE.md)。這份候選不會自動更新正在執行的其他副本。

## Language / 語言 / 言語

[繁體中文](docs/USER_GUIDE.zh-Hant.md) · [简体中文](docs/USER_GUIDE.zh-Hans.md) · [English](docs/USER_GUIDE.en.md) · [日本語](docs/USER_GUIDE.ja.md)

1.3.0-preview.1 adds four-language UI drafts, safe local continuation and selectable life timezone for new installations. Existing data retains its original timezone. Independent human/native-language review and a separate physical Windows check were not performed and are disclosed; they are not mandatory human sign-off for this preview. Security reporting is prepared for GitHub private reporting but is not active before publication. No repository upload is performed by setup.

## Current acceptance policy / 目前驗收方式

Owner selected AI-executed project self-acceptance. Independent human, novice and native-language tests were not performed and are disclosed, not mandatory human sign-off for this preview. This supersedes earlier human-gate wording; it does not convert unperformed tests into passes. See [AI acceptance policy](docs/AI_ACCEPTANCE_POLICY.md) and [version records](docs/VALIDATION_INDEX.md).
## AI acceptance / AI驗收

This candidate includes [per-version public acceptance records](docs/VALIDATION_INDEX.md), [reproduction scope](docs/ACCEPTANCE_SCOPE.md), and the [AI self-acceptance policy](docs/AI_ACCEPTANCE_POLICY.md). The latest run passed all ten automated groups. Independent human validation was not performed; passing AI self-acceptance is not a third-party certification. Raw logs and existing individuals are excluded from the source distribution.
