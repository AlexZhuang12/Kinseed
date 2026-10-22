# 歷史：四語／時區工程階段驗收

這是AI完整驗收之前的階段紀錄，數字與未執行項目保留當時語境；不是目前發布閘門。最新結果見[驗收索引](VALIDATION_INDEX.md)。

---

# 1.3.0-preview.1 本機驗收範圍

這是可供本機驗收的Windows候選，不是已公開發布或已通過母語審閱的正式版。先前大腦與受控Codex/MCP的真實整合證據保留；本次四語、時區與協作維護工作沒有新增模型推理，不把合成ready狀態當作模型成功。

## 可重現入口

```powershell
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run ui:check
npm run test:ui
npm run boundary:check
npm run release:check
npm run source:export
```

使用Windows x64、Node24.19.0及標準安裝路徑Chrome。本機完整Node回歸318項通過。`test:ui`使用新合成個體與固定時鐘：四語各21項完整旅程、32項首次設定／窄視窗及30項語言切換／資料保留檢查；不需要真實模型或個體。每次結果寫自己的`.private/ui-acceptance`，不可當公開附件直接上傳。

本機另完成24項個體管理回歸、13項全新副本鎖檔安裝／啟停／時區／備份核對，以及跨本機埠語言保留檢查。首次乾淨離線安裝因專用快取缺件而失敗，正常依鎖檔下載後通過；這不是離線首次安裝保證。最終來源包逐項SHA校驗，仍不等於完整安全或法律認證。

## 重要行為

- 四語顯示同一份功能，1,771則來源訊息有英文／日文對應；簡中由離線轉換建立，原使用者內容不翻譯。
- 語言偏好僅使用瀏覽器儲存及非敏感的`kinseed-ui-language`本機cookie，跨loopback埠保留。不存身份、對話或控制憑證於此cookie。
- 重要出生協定文字、身份與記憶原文、API工具識別碼不翻譯。原始診斷與外部模型錯誤可保留原語言。
- 已有資料時區不改；新安裝可選時區。DST缺失時刻取當日第一個有效分鐘，重複時刻取第一次，實際活動長度仍按經過分鐘計算。
- 切語言不是保存或授權；最終出生確認不接續。已被另一頁修改的草稿不得盲目覆蓋，原始證據保留。
- 冷備份只接受已知資料布局及已收尾狀態；網路audit鏈、未知欄位及未完成上傳亦檢查。

## 尚未完成的外部閘門

Owner已選擇先交付本機候選，以下保留為發布前待辦：

1. 另一台實體Windows及不同使用者環境的乾淨安裝、停止、重開與資料核對。
2. 無助手陪同的新使用者完成建立、草稿、審核、生活設定、出生及成果閱讀。
3. 簡中、英文、日文母語審閱，特別核對批准／出生／恢復／停止及權限範圍。
4. Owner授權並選定GitHub目的庫後，實際驗證遠端CI與私人漏洞通報入口。現在沒有上傳，也沒有啟用通報。

每日LLM生活報告在獨立clone版仍停用；任意第三方MCP、一般shell、帳號、付款、發布及其他OS不在本次範圍。詳細開發及法律／第三方原文不要求全部四譯。發布不得將上述待驗項目寫成已通過。

## Current acceptance policy / 目前驗收方式

Owner selected AI-executed project self-acceptance. Independent human, novice and native-language tests were not performed and are disclosed, not mandatory human sign-off for this preview. This supersedes earlier human-gate wording; it does not convert unperformed tests into passes. See [AI acceptance policy](AI_ACCEPTANCE_POLICY.md) and [version records](VALIDATION_INDEX.md).
