# 1.3.0-preview.1 驗收範圍

[完整AI驗收索引](VALIDATION_INDEX.md)保留三次歷史執行；最後10組PASS，含562 Node、146 UI與真實GPT／Codex／MCP。故障與隱私子集重疊，不加總。早期318項四語階段數字保存在[歷史](LOCAL_VALIDATION_HISTORY_1_3.md)，不是目前總數。

公開前另以GitHub託管Windows跑合成CI，562 Node與146 UI通過；Git換行及Chrome冷啟動問題的失敗與修正保留。[遠端紀錄](ci/1.3.0-preview.1/run-39799307751/REPORT.md)。最終文件及政策測試收尾另跑一次CI，確切提交與工作連結見Release。不同版本的來源hash與實測範圍不混用。

~~~powershell
npm ci --ignore-scripts --no-audit --no-fund
npm run acceptance:local -- --allow-install-network
# 明確選擇自己的模型帳號／容量後才執行：
npm run acceptance:full
~~~

介面驗收使用Chrome，原Chromium沙箱保留。方法見[驗收範圍](ACCEPTANCE_SCOPE.md)。模型記憶由模型提出，不由工程補寫。歷史委派父端為合成驅動、子端Codex／MCP／WASM真實；本機退出不等於遠端取消確認。

獨立人類、新手、母語與第二台實體Windows未驗；託管CI不是人類實機研究。這些是披露，不是強制人類簽核。此輪發布沒有真實模型呼叫，Qwen3完整生活資格仍未通過。每日LLM報告排程、個體封存、其他OS、任意MCP、一般shell、帳號、付款、對外發布不在已提供範圍。
