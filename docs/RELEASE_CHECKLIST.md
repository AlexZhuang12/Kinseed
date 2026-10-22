# 發布檢查與授權

適用1.3.0-preview.1 Windows預覽發行。目的庫已建立且私人階段CI成功，Owner已授權公開及預覽Release；確切狀態以GitHub Release為準。依[第7版計畫](OPEN_SOURCE_ENGINEERING_PLAN.md)執行。

## 已完成的本機工程

- 獨立環境、首次設定、四語核心指南、逐步身份／生活／權限／出生操作。
- 可替換大腦、受控Codex／MCP、停止／到期／隔離與未知收尾。
- [AI完整驗收](VALIDATION_INDEX.md)：公開程序、來源雜湊、失敗／修正及最終結果；raw log不發布。
- Apache-2.0、NOTICE、第三方聲明、Issues／PR範本、維護與安全政策、唯讀CI來源。
- 本機安全及檔案核對以[當次安全紀錄](RELEASE_CANDIDATE_SECURITY.md)為準；來源匯出與ZIP另有完整manifest。

## 每次候選／發布都必須核對

1. 使用允許清單匯出全新來源，包含鎖檔；不得以原私人專案作Git根目錄。保持private:true防誤發npm。
2. 執行release:check及boundary:check，檢查秘密形狀、個人路徑、私人資料、版本與來源。PASS不等於不存在未知秘密。
3. 查詢固定依賴的當次已知漏洞：npm audit --package-lock-only --omit=dev --ignore-scripts；另核對vendor元件與第三方聲明。沒有結果要列BLOCKED，不捏造0漏洞；不自動audit fix。
4. 更新發行說明及相容性、四語／時區／停用能力、資料與回退說明，核對文件連結。程式有變則重驗，不將歷史模型PASS當新一輪推理。
5. AI檢視散布內容，不夾帶身份、記憶、作品、治理原文、登入檔、raw log或未審查截圖。校驗ZIP每一項與manifest一致。
6. 新安裝用空資料；升級保留.private與最新資料，停妥工作才更新相容來源。不以舊DB覆蓋新歷史、不復活舊授權。

## 發行執行順序（Owner已授權）

- D04帳號／組織、庫名、公開方式及操作授權。
- 從乾淨來源建立獨立儲存庫，補正式網址；不匯入私人Git歷史。
- 啟用並核對GitHub私人漏洞通報、一般Issues及最小權限CI；實跑成功前不宣稱遠端CI通過。
- 最終來源／版本標籤／附件SHA／驗收紀錄一致，再依授權發布Release。

## 已決定與誠實披露

Windows優先、原創Apache-2.0、D01新安裝可選時區、D02私人漏洞通報、D03優先最新版無固定回覆時限皆已決。第三方與模型仍各自授權。AI自行驗收不是獨立認證。獨立人類／新手／母語與另一台實體Windows未執行，公開列NOT_RUN，不當作PASS或強制人類簽核。Qwen3完整生活未通過；本次不呼叫共用本地模型。私人GitHub遠端CI已成功；最終發行提交須再通過對應檢查。

公開前審查所有Git提交、Actions歷史與附件；轉公開後它們可能供任何人閱讀。私人漏洞通報在公開後立即啟用並核對；無可用私人入口時不宣稱可收件。
