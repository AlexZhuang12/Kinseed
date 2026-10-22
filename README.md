# Kinseed

Windows-first platform for persistent AI individuals, replaceable brains and controlled tools. **1.3.0-preview.1 is a preview, not a stable production release.**

[繁體中文](docs/USER_GUIDE.zh-Hant.md) · [简体中文](docs/USER_GUIDE.zh-Hans.md) · [English](docs/USER_GUIDE.en.md) · [日本語](docs/USER_GUIDE.ja.md)

[Source](https://github.com/AlexZhuang12/Kinseed) · [Releases](https://github.com/AlexZhuang12/Kinseed/releases) · [Windows CI](https://github.com/AlexZhuang12/Kinseed/actions/workflows/verify.yml) · [AI acceptance records](docs/VALIDATION_INDEX.md)

## 第一次使用

1. 使用Windows x64，安裝Node.js24.19.0或24系列較新版本（驗收版本24.19.0）。
2. 從Release下載來源ZIP並解壓，或clone本庫。
3. 雙擊「首次設定.cmd」，依五步導引安裝鎖定套件、選大腦、準備工具、確認保存及啟動控制台。
4. 依控制台導引建立個體、保存草稿、預覽審核、設定生活條件，再由Owner親自確認首次出生。

需要網路下載程式依賴。Codex使用自己的帳號；Ollama須另備模型服務。本來源不附帳號、CLI／瀏覽器二進位、模型權重或任何既有個體。設定頁在套件尚未安裝時即可開啟，不需要先編輯JSON。[完整安裝指南](docs/FIRST_RUN_WINDOWS.md)。

## 能做什麼

- 每個個體有自己的身份、記憶、計畫、歷史及作品，Owner能觀察、互動、管理生活時間／活動輪數／網路預算／工具權限。
- Codex CLI與Ollama大腦接頭；與大腦分離、逐個體授權的Codex作品委派及隔離執行。
- 八領域24題引導與虛構填寫示例、草稿接續、唯讀版本預覽、審核及首次出生逐步流程。
- 四語介面與核心指南；語言不翻譯個體內容、不改權限或排程。新安裝可選生活時區，既有資料保留原時區。

保存設定、批准身份、首次出生、恢復生活是不同動作。大腦及新工具預設停用；保存不啟動，停止／重啟不自動恢復。[Owner指南](docs/OWNER_QUICK_GUIDE.md)。

## 已測範圍與限制

Codex已驗組合：CLI0.163.0-alpha.10.2、gpt-6.1-sol／low與使用者自己的登入。容量、帳號與供應者條件仍會影響可用性，不自動換模型。本地接頭連線通過不代表模型能完成生活任務；Qwen3 1.7B Q4_K_M完整生活相容性未通過。[相容性表](docs/COMPATIBILITY.md)。

此版不包含一般主機shell、任意第三方MCP、私人帳號、付款、對外發布或其他OS。clone的每日LLM報告排程及個體封存管理仍停用。翻譯是工程初稿；獨立人類、新手、母語及第二台實體Windows驗收未執行。

## 驗收與協作

採**AI全程執行的專案自行驗收**，不是獨立第三方認證。歷史真實Codex／MCP測試與目前合成CI分開；舊失敗、診斷及重驗保留，不把沒有執行的項目當PASS。[政策](docs/AI_ACCEPTANCE_POLICY.md)／[範圍](docs/ACCEPTANCE_SCOPE.md)／[公開結果](docs/VALIDATION_INDEX.md)。

~~~powershell
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run ui:check
npm run test:ui
npm run release:check
~~~

介面驗收需要Chrome。預設測試與GitHub CI不呼叫真實模型、不下載模型權重；acceptance:full是另外的帳號／容量明確選擇。只用合成個體測試，不操作現有資料。[貢獻](CONTRIBUTING.md)／[支援](SUPPORT.md)／[工程地圖](docs/OPEN_SOURCE_ENGINEERING_PLAN.md)。

## 資料、安全與授權

私人資料在本副本.private，設定覆寫config/development.local.json不提交。首次啟動空資料；更新保留最新資料，不以舊DB覆蓋歷史。模型呼叫與受控委派會向所選供應者傳送所需資料並消耗額度。[外連與隱私](docs/PRIVACY.md)／[備份回退](docs/UPGRADE_ROLLBACK.md)／[安全通報](SECURITY.md)。漏洞不要貼公開Issues，先核對私人通報入口。

原創程式與文件採[Apache-2.0](LICENSE)。第三方各自授權，見[NOTICE](NOTICE)及[第三方聲明](docs/THIRD_PARTY_NOTICES.md)。不包含個體身份、記憶、歷史、作品、治理原文或模型權重。package的private:true只防誤發npm，不表示GitHub必須私人。

[發布說明](docs/RELEASE_NOTES_1_3_0_PREVIEW_1.md)／[安全查核](docs/RELEASE_CANDIDATE_SECURITY.md)／[發布清單](docs/RELEASE_CHECKLIST.md)。
