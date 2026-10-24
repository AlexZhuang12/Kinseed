# Current iteration: 1.5.0

See [life authority plan](LIFE_AUTHORITY_ENGINEERING_PLAN.md) and [recovery policy](LIFE_AUTHORITY_AND_RECOVERY.md). The following revision 7 remains the historical first-publication plan.

# Kinseed 開源工程計畫 — 第7版

版本1.3.0-preview.1，Windows預覽版。[Repository](https://github.com/AlexZhuang12/Kinseed)／[Releases](https://github.com/AlexZhuang12/Kinseed/releases)。發行的確切提交、日期與附件SHA以GitHub Release為準；舊版計畫是歷史，不是目前待辦。

## 工程地圖

0–5獨立環境／資料邊界／可替換大腦／受控工具／首次設定 → 6操作導引 → 6A四語及時區 → 7A協作維護 → 8 AI完整驗收 → 9發布收尾 → 私人GitHub及遠端CI → Owner授權公開與預覽發行。

| 階段 | 狀態與證據 |
| --- | --- |
| 0–5 | Windows獨立來源、Codex／Ollama接頭、受控Codex委派及安裝導引完成；[相容性](COMPATIBILITY.md)界定模型能力 |
| 6／U01–U08 | 保存接續、生活時間／額度／權限／身份／出生逐步導引及錯誤恢復完成；合成操作旅程驗證 |
| 6A／I01–I07 | 繁中／簡中／英文／日文及新安裝IANA時區完成；舊資料保留原時區，使用者內容不翻譯 |
| 7A／C01–C07 | 協作、授權、安全政策、範本與唯讀最小權限CI完成；安全入口依SECURITY核對 |
| 8／V01–V08 | AI執行測試、診斷、修正及重驗；[公開歷史](VALIDATION_INDEX.md)保留初始失敗，真實模型與合成機制分開 |
| 9／L01–L03 | 發布說明、私人資料排除、第三方聲明、當次漏洞查詢與來源逐檔SHA |
| GitHub Windows CI | 562 Node與146四語UI、安裝、來源邊界、建置及匯出實跑成功；[私人階段首個成功紀錄](ci/1.3.0-preview.1/run-39799307751/REPORT.md)，文件收尾後再跑最終提交 |
| 發行 | Owner已明確授權公開及1.3.0-preview.1預覽Release；[發布說明](RELEASE_NOTES_1_3_0_PREVIEW_1.md)與[發布清單](RELEASE_CHECKLIST.md)定義執行順序 |

## 已決策

Windows優先、Apache-2.0；新安裝可選時區／既有資料原時區；GitHub私人漏洞通報；優先最新版、不承諾固定回覆期限；AI全程自行驗收並公開方法與結果。目的庫AlexZhuang12/Kinseed，私人推送及公開預覽發行均已由Owner授權，不等於可操作任何個體資料或權限。

AI自驗不是獨立認證。沒有第三方人類、新手、母語或第二台實體Windows驗收就標示未執行，不作假PASS，也不要求未完成的人類簽核。GitHub託管Windows是遠端CI，不能冒充另一台實體電腦的人類操作研究。

## 發布閉環與後續迭代

發布前核對完整Git歷史與將公開的Actions日誌／附件、來源秘密形狀、依賴、授權、版本及檔案雜湊；最終來源CI通過後，公開並啟用私人漏洞通報，核對匿名clone及發布入口，才發行預覽Release。未知結果與失敗如實記錄，不用假成功取代。

後續依實測與問題回報改善觀察、權限、互動及可用性；任何新增工具、模型資格或資料遷移另有明確範圍與驗收。日誌、模型、個體內容及登入資料不作公開素材。

首版不包含雲端部署、其他OS、任意第三方MCP、一般shell、私人帳號、付款、對外發布、自動換模；clone每日LLM報告排程與個體封存管理停用。Qwen3 1.7B完整生活相容性未通過。原生條件與治理不改、不Freeze；批准／出生／生活授權分開，停止或重啟不自動恢復。

歷史：[第6版](ENGINEERING_PLAN_HISTORY_REVISION_6.md)、[第5版及更早](ENGINEERING_PLAN_HISTORY_REVISION_5.md)。
