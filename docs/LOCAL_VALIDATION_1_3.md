# 1.3.0-preview.1 目前本機驗收

最新為[AI完整驗收索引](VALIDATION_INDEX.md)的第三次執行：10組PASS，562項Node、146項介面、11項乾淨安裝／啟停／備份、真實Codex／MCP記憶承接與作品委派，以及本機取消收尾。故障與隱私測試與Node重疊，不加總。之前318項四語／時區階段紀錄在[歷史文件](LOCAL_VALIDATION_HISTORY_1_3.md)，不作為目前測試總數。

執行來源digest與原始三次報告不因文件收尾改寫；本次只修改文件，執行程式／設定／測試與依賴版本保持不變。文件、來源秘密形狀、第三方聲明及最終包另做收尾核對，見[候選安全紀錄](RELEASE_CANDIDATE_SECURITY.md)。沒有重新呼叫模型。

## 可重現入口

安裝Node24.19.0，於Windows x64、可用Chrome的乾淨副本執行：

~~~powershell
npm ci --ignore-scripts --no-audit --no-fund
npm run acceptance:local -- --allow-install-network
# 使用自己的Codex帳號，明確同意模型呼叫後才執行：
npm run acceptance:full
~~~

細部方法、合成／真實區分及取消限制見[驗收範圍](ACCEPTANCE_SCOPE.md)。模型記憶由模型自己提出，沒有工程補寫。委派父端為合成驅動、子端Codex／MCP／WASM真實；本機退出不等於遠端取消確認。

## NOT_RUN與範圍

沒有獨立人類、新手、母語、第二台實體Windows或GitHub遠端CI驗收，不宣稱已完成。人類檢查不再是預覽版必須取得的簽核。未呼叫共用本地模型；Qwen3歷史完整生活資格未通過。每日LLM報告排程、個體封存管理停用；其他OS、任意MCP、一般shell、帳號、付款、發布不在範圍。
