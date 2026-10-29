# app-server 離線補強與獨立預覽

候選標識：`app-server-offline-20261027.1`。基線為第一階段候選，不是正式切換。正式仍使用 exec；本輪不登入、不呼叫模型、不連外部付費服務、不安裝、不推 GitHub。

## 已完成的四項工作

1. **驗收工具自測**：QualificationBudget 將提交意圖先落盤，失敗／取消不退回名額，單管理者鎖防止兩程序同時搶額度；六次上限跨重啟保留。未有 Owner 恢復與專用登入確認時，入口預設拒絕呼叫。獨立合成帳本不會消耗原真實六次額度。
2. **背景補記**：外部完成、B 已記錄、帳務已結算分開保存。B 每一版紀錄有固定識別碼，結算沿用原請求識別碼；目標已接受但本機確認遺失時，重試同一紀錄。原 Kinseed B 事件與收據以同一 SQLite 交易保存，已用真正合成個體驗證不重複追加事件。原始帳務則要求供應商結算端支援相同冪等鍵；本輪用持久合成帳本驗證，不變造正式或供應商額度。
3. **後續查詢**：有界 host tick 讀取原生活授權、時段、Owner 停止、執行 hold；沒有啟動或恢復生活的方法。時段外保存下次查詢，Owner 停止不自行恢復；查詢失敗退避，結果未知不再提交。查回工作 ID 後再撤權，也不能繼續下一個外部讀取。實際合成 Kinseed scope 可提供給候選排程，正式排程未接入。
4. **獨立預覽**：合成甲／乙、處理中／完成／失敗／結果未知、B 與帳務待補記、原工作查詢與核對備註。未知沒有「重新生成」按鈕。Owner 停止與核對備註跨預覽重啟保留。頁面目前只有繁中，未宣稱四語或真人驗收。

## 重現步驟

在本候選 app 目錄執行，僅使用已有 Node／依賴與 Chrome：

```powershell
node scripts/acceptance-app-server-offline.mjs
node --test tests/app-server-offline.test.mjs
node --test tests/app-server-candidate.test.mjs
node scripts/verify-qualification-ram.mjs
node scripts/verify-background-preview.mjs
npm test
npm run ui:check
npm run test:ui
npm run release:check
node scripts/background-work-preview.mjs start
```

最後一行只開這份合成預覽，輸出的私人網址與 PID 另存 `.private/offline-preview-session.json`；不啟動正式控制器。不要將預覽存放區指向正式 runtime。預覽的模擬按鈕只改虛構場景，不連外、不產生工作。

第一行可一次重現新增測試、接頭測試、RAM儀表及預覽互動；結果寫入自己的`.private/offline-acceptance/`。這些測試與整版有重疊，不能相加。RAM程序盤點需正常Windows使用者權限；若環境拒絕盤點，會明示FAIL，不把空白資料當通過。入口沒有登入／真實模型開關。

OF01–OF24 是本輪新增定向驗收；它們包含於完整 Node 計數，不能再次加總。RAM 儀表以自己的父／子程序配置約56MiB合成緩衝，核對程序建立時間、父子鏈與排除取樣器；不是 Whisper 或真實模型負載。既有四語 UI 回歸與這份繁中預覽互動分開計數。

## 儀表診斷與限制

修正 Windows CIM 與 Get-Process 建立時間的精度差異，並納入真正屬於程序樹的主控台輔助程序。以 PID 加建立時間辨識，避免把重用 PID 誤當自己的程序。RAM 是抽樣的程序 WorkingSet／PrivateMemory 總和；共享頁面可能重複計算、間隔內峰值可能漏掉，不是專屬實體 RAM。

未取到樣本時輸出 NOT_MEASURED 與 null，不當作0。每輪綁定原主程序 PID，避免後一輪覆蓋前一輪記憶體值。合成 benchmark 用固定 Node 協定替身端到端完成兩輪，驗證收集／計次／原 MCP／記憶提交與收尾流程；所有合成時間／RAM數字只代表儀表測試，**不能用來比較真實模型速度與RAM**。

## 尚待登入後驗證

- 真實模型登入、實際動態工具與命名 sandbox 的運作。
- 真實取消／事件次序，以及 exec 與 app-server 的速度／RAM／用量差異。
- 真實供應商對工作查詢、冪等提交／結算的支援，及各自權限與原預算接線。沒有通用 exactly-once 保證；遠端無查回或冪等支援時保留未知人工核對。
- 本機帳本永久毀損／磁碟故障、目標服務無冪等收據或永久停止回應的人工處置。補記 hook 的宿主端應提供有界逾時與可取消請求，不能假設任意第三方 hook 都會完成。
- 新預覽的四語、正式 UI／排程接入、部署／回退及真人體感，皆不包含本輪正式發布資格。

本輪真實模型用量仍為0／6，不自動登入或使用這六次。後續需 Owner 表示可以繼續，再完成專用登入與確認，才開啟受限真實驗證。原正式來源與四人資料／生活、共用服務均不操作。

配額計次單位是Kinseed接頭的提交意圖／app-server turn啟動；Codex內部工具往返與供應商HTTP請求數不一定等於這個數字。真實測試前須將此定義與Owner的「最多6次」預算對齊，不能把六個受控回合宣稱為已限制所有底層模型請求恰好不超過六次。此處仍維持停用，不消耗這項授權。
