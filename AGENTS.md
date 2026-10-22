## Current acceptance method: AI-executed, no invented human sign-off

Owner explicitly selected AI execution of acceptance, diagnosis, repairs and reruns with synthetic individuals. Use docs/AI_ACCEPTANCE_POLICY.md and engineering plan revision 6. Prior human acceptance gates are superseded by honest disclosure of unperformed human/native/physical-machine checks. Do not claim independent third-party certification. Publish only strict-schema reports; raw logs, paths, account data and real individual data stay private. No GitHub upload, existing-individual changes or shared-model/chat calls. Real-provider tests are explicit opt-in. Failed/blocked historical reports must remain unchanged.

## Historical stage notes (not current release gates)

Current results: 562 Node assertions and 146 UI checks plus real Codex/MCP cases; see docs/VALIDATION_INDEX.md. Runtime source is unchanged by final document consolidation. Version 1.3.0-preview.1 is awaiting publication authorization. All following stage notes retain their original context; old human publication gates and old counts are historical.

## Historical: 1.3.0-preview.1 local candidate

Four-language shared UI builds, safe continuation, new-install IANA timezone and community/release preparation are implemented. Existing data retains its original timezone (legacy Asia/Taipei). Node regression 318 PASS; exportable synthetic Chrome suite 146 checks PASS. No new real-provider inference in this release. Independent native-language review, another physical Windows and unassisted novice acceptance remain publication gates. Owner selected local candidate delivery first. GitHub upload and activating private reporting are not authorized. Default brain remains disabled; no automatic birth/resume/new permission. Original private identities and histories are excluded. Run npm run ui:check, npm test and npm run test:ui for local synthetic verification. Read docs/LOCAL_VALIDATION_1_3.md and engineering plan revision 4.

## 2026-10-22 Owner操作導引 1.2.1-preview.1

本候選新增常駐操作導引、首頁流程、個體下一步與保存返回流程。設定進度只投影已保存資料，不代批准、出生、恢復或開權限；沒有改生活排程規則或資料schema。首次出生等待時間的健康狀態、登入預檢分類修正，仍保留授權與隔離。操作見docs/OWNER_QUICK_GUIDE.md；原生條件與治理不變，不Freeze。新來源尚未套用任何執行中的其他副本；不得將來源或舊資料庫直接覆蓋活躍環境。

## 2026-10-22 Owner已選Apache-2.0，暫不上傳

Owner明確選擇原創程式及文件採Apache-2.0，只完成本機來源包與檢查，暫不上傳GitHub。根LICENSE取自Apache官方完整原文（含附錄），新增NOTICE、package.json／package-lock根套件license一致，匯出允許清單包含LICENSE／NOTICE。第三方聲明及私人資料邊界保留。private:true繼續防誤發npm，並不表示未授權；不建立GitHub儲存庫或推送，不操作其他環境服務與個體。下方授權未決為此前歷史，以本節為準。
## 2026-10-22 發布前盤點與停機備份

新增 scripts/release-check.mjs 的離線來源秘密形狀／個人路徑／鎖檔來源檢查，export-source 在匯出前必須通過，不能以忽略規則代替匯出邊界。新增 maintenance.mjs snapshot／verify 與 npm run backup，只處理本副本已停止且無租約／worker的資料，校驗SHA、SQLite、歷史鏈與記憶投影，未知資料格式拒絕。備份是私人明文，未提供覆蓋DB還原，不能復活舊生活授權。

264回歸及最後13項維護測試通過；同schema來源回退保留較新合成記憶／歷史，非跨版本遷移或第二台Windows驗證。官方npm已知漏洞查詢0不等於無未知漏洞或全部內嵌分析。docs/PRIVACY.md、UPGRADE_ROLLBACK.md、THIRD_PARTY_NOTICES.md及RELEASE_CHECKLIST.md描述資料外傳、第三方聲明、限制及Owner決策。內附14份固定套件聲明與PDF.js對應標籤授權／版權標頭；不宣稱可重現建置或法律認證。

原創授權與GitHub方式待Owner明確選擇；不建立生效LICENSE、不上傳、不以本次檢查宣稱已正式開源發布。只在獨立環境工作，不更新其他服務、身份／記憶／出生／權限或生活。維護工具不是自動更新器，下方為此前歷史。
## 2026-10-22 Windows初次設定與乾淨來源流程

本候選新增「首次設定.cmd」與五步本機導引：無依賴啟動、鎖檔安裝、先不接／Codex／Ollama大腦、受控Codex工具接頭、白話確認保存及自己的控制台啟停。只保存本副本設定；個體權限、批准、出生與生活授權仍獨立，沒有自動啟用。工具接頭可在設定以tools.codex.enabled關閉；缺欄位保留舊相容性，新導引預設關閉。讀本機模型清單與預檢不推理、不下載模型。Codex安裝只進自己的.private/codex-cli，固定版本、官方HTTPS分段續傳、SHA512完整校驗後離線npm安裝，核對執行檔版本，沒有全域安裝或寫使用者MCP設定。登入由使用者明確點擊自行處理，本次未登入或換帳號。

來源包用scripts/export-source.mjs，必須帶package-lock.json／.gitattributes與標記，不使用npm pack清單代替來源包。Windows批次檔保留CRLF，Git設定亦要求eol=crlf。操作docs/FIRST_RUN_WINDOWS.md；證據在根私人evidence/clone-setup-20261022。測試腳本會安裝程式與啟動自己的合成控制台，不可當唯讀狀態重跑；已有結果不覆寫。

實際同機乾淨來源、Chrome、既有CLI及官方下載私有CLI路徑已驗證，合成本機服務只提供metadata，零GPT／Qwen推理及新模型下載。無正式部署、增權、恢復、搬資料或上傳。來源授權未定，仍為Windows獨立預覽，不宣稱第二台實體機或任意第三方MCP通過。初始缺鎖檔、npm大包逾時、官方bin目錄與UTF8批次檔LF問題留證後修正，沒有跳過完整性校驗或使用其他版本。

下方為先前階段歷史；不由本次設定流程推定可操作其他環境的個體、權限或生活。回退先停本副本，保留.private與設定備份，不能以舊DB覆蓋生活史或恢復過期授權。
## 2026-10-22 受控Codex工具委派候選

Owner授權只在本獨立環境使用合成個體，已新增delegate_codex與自己的短效MCP代理；子Codex只處理選入及本次新增作品，沒有身份／記憶提交／Owner控制／一般檔案／shell／網路或再委派。codex可選權限預設false；編輯執行仍需原權限。一次另計模型用量、每輪最多一次、原120秒／16工具／停止／隔離／未知保留worker不變。沒有模型特例、新模型下載或其他環境部署與增權。操作見docs/CODEX_TOOL_INTERFACE.md；真實與故障注入證據在根專案私人evidence/codex-delegation-20261022。測試腳本會真的呼叫模型，不得作唯讀狀態重跑。下方未接委派限制為此前階段歷史，不能把本次授權延伸到正式資料或服務。

## 2026-10-22 模型接入基本標準與stepwise候選已交付

已依Owner授權定義S01–S12產品責任與模型相容性分界，在獨立候選新增可選stepwise：來源逐行可逆、目前記憶／身份索引分區、每次一個模型選擇工具、真實回覆後再決定、最多兩個未執行問題提示。原MCP Schema／授權／隔離／120秒／16工具／17模型回覆／未知收尾保留。只有請求編號及記憶expected_version由系統綁定；不代寫答案或記憶。系統獨立保存實際收據，不要求模型重抄execution_claims；receipts_verified不等於narrative_verified，提交不等於任務完成。最終來源補明自動get_context已完成、身份完整性依旗標與續讀入口，身份未齊且無閱讀入口拒絕。可選tool_protocol進入嚴格設定與Schema；舊設定仍native，範例仍停用，沒有私人啟用設定。

195候選回歸PASS，含20新增標準單元及12新增真實MCP／SQLite＋合成HTTP整合，非195個模型能力案例。真實同Qwen3五案：舊guided因重複寫入失敗；前三個stepwise中兩個提交、一個完整目錄逾時；最終來源獨立案亦A0→1。新候選共三個實際提交，但四個均未完整通過指定任務：漏版本、種子標點／字形改寫且缺新事實、或逾時。DB與模型提交逐字一致；未代補、不採用為正式大腦。前四案來源source-at-real-start與最終案source-after分開，不冒稱全部在最終版重跑。逐行資料亦增加token成本，完整目錄第一prompt6624tokens、處理約47秒，原資源組合仍未通過；晚回覆沒有派送。

交付evidence/adapter-standard-20261022/DELIVERY_REPORT.md、SUMMARY.json；候選docs/MODEL_ADAPTER_STANDARD.md與README有設定／回退。全部五個自己服務退出PASS，合成個體停止、worker／lease釋放、相鄰個體未變；共用連線與last_metrics不變，41檔串流SHA核對。正式來源、六DB全state／事件數及原歷史鏈、身份出生記憶權限時間額度及治理保留；沒有正式Owner寫入、部署、重啟、恢復、換模、下載、上傳或Freeze。來源邊界最初抓到候選協作文件中的正式名字，已匿名化；原文在私有證據保留，未放寬檢查。預設仍停用；測試腳本會啟模型，不可當狀態查詢重跑，已有結果保護。下方保留歷史。

## 2026-10-22 Qwen3分層對照完成，完整生活仍未採用

Owner授權同Qwen3固定合成材料，依理解／格式／接續／完整流程單因素比較，不影響正式兩人或共用聊天。52份可比較診斷回覆及4次真實MCP／SQLite生活嘗試；同資料從巢狀JSON改逐行完整列點後，身份／記憶版本問答2/2改善，不刪來源。Schema筆記參數2/2合法但事實僅1/2完整；收據工具／結果8/8正確，但身份來源混用，快照／助手對話無整體改善證據；僅改identity_code欄位名仍錯選系統ID。記憶仍過度抄背景或輸出截斷，不能宣稱來源管理通過。完整生活0/4提交：三工具兩案各1則真筆記後重複寫入被拒；完整目錄兩案原120秒到期，先確認自己引擎及MCP退出才結算，不假清未知租約、不延長或接受晚提交。

主18＋補充9項實驗控制／保留核對PASS，非27個模型任務成功。正式21684／報告16016及六DB全state／事件數／雜湊完全相同，兩個正式個體A82／A69原停止、身份出生記憶歷史權限時間額度及來源不改；候選src／package／lock未改、預設仍停用。共用31552／34248、session及last_metrics不變，41檔SHA／大小核對；私人六blob亦一致。五個自己測試服務退出PASS，最後僅原共用Ollama、候選MCP0。初始受限CIM未推理即失敗，已精確收尾；另一次工程稽核整塊讀大檔與RAM保護重疊，保留為干擾非模型能力失敗，只重做一次無寫入請求，改推理全結束後1MiB串流SHA，原RAM門檻不降低。

交付evidence/qwen-layered-20261022/DELIVERY_REPORT.md、FINAL_METRICS.json、SUPPLEMENT_SUMMARY.json；候選docs/LOCAL_BRAIN_LAYERED_RESULTS.md。測試腳本會啟模型，不能當狀態查詢重跑；已有結果保護。下一步是資料來源清楚、完整保真及一次一個行動的候選設計，本次尚未實作；不唯一歸因權重、不換模型、不部署、不恢復、不下載、不改原生條件或治理、不Freeze。下方保留歷史。

## 2026-10-22 Qwen3四項流程修正完成，仍未達可靠生活標準

Owner授權依序統一指令、分開現在與歷史、有限失敗重新判斷、操作敘述與真實收據核對。只在獨立候選新增toolProtocol=guided，原native/schema/staged及預設停用保留。原任務維持system原文，明確要求優先於自由選擇；當前版本與舊記憶分欄；本地唯讀明確錯誤最多兩次重新選行動，不自動重送寫入、外部或未知操作。execution_claims須對上實際收據；continue＋wait_ms等矛盾草稿拒絕，全部問題一併回饋，最多由模型自修一次。沒有自填答案、回填記憶或放寬120秒／16工具／17模型回覆。自然語言仍narrative_verified=false，不冒稱全部事實查證。

最終163候選回歸（原143加20）、5程序歸屬PASS。真實同Qwen3 Q4_K_M／Ollama0.40.7 CPU／8192context／512output：短題等待12/12、版本4/4，但舊新提示均正確，不能證明選項排列或標示是唯一根因。六個guided整合嘗試均未達有效完整提交：重複寫入、重複失敗參數、矛盾排程、收據缺漏及原期限皆有具體證據。舊staged對照A0→1也違反等待要求，不算完整任務成功。安全拒絕變多不等於模型能力退步，但可靠成功率沒有改善證據。

四組工具內容格式對照：文字欄位定義加Schema能提取身份／版本，仍多編未支持時間；JSON模式物件形狀不符。已補文字欄位定義並用最終來源重驗；兩種真實失敗草稿回饋對照均未修對。草稿與失敗筆記原樣保留，不偽造成功；傳輸／保存與模型內容錯誤分開判讀。早期來源與修正版本分開留證，初次fixture權限設定／診斷索引筆誤亦保留，不冒稱模型事故。

正式21684／報告16016不重啟，六DB全部state與事件數／雜湊完全相同，A82／A69原停止保持；正式身份／出生／記憶／歷史／權限／時間／額度與治理不變。共用31552／34248連線與上次metrics不變、41檔SHA再校驗PASS；四批自己服務退出收據PASS，最終候選MCP0、只有原共用引擎。最低可用RAM約2.09GiB、自己工作集峰值2.37GiB／private2.47GiB為採樣。不換正式模型、不恢復、不下載、不Freeze、不上傳。

交付evidence/qwen-flow-repair-20261022/DELIVERY_REPORT.md、SUMMARY.json，候選docs/LOCAL_BRAIN_GUIDED_FLOW.md。尚未排除所有提示／格式／任務負擔因素，不判模型絕對上限，也不採用正式生活。取消guided回原接頭，不覆蓋DB／刪失敗史／操作共用服務。根目錄qwen-flow-*真實腳本會啟模型，不可當唯讀狀態查詢重跑；已有結果拒絕重跑。下方歷史保留。

## 2026-10-21 Qwen3 三段式生活候選已驗證，僅局部改善

Owner授權分離行動選擇、工具內容與記憶更新，僅在獨立候選。新增可選toolProtocol=staged：模型先選行動清單（可空），逐項只填該工具內容，之後獨立提交完整記憶／計畫與收尾；系統只綁請求編號與原版本，不填筆記／記憶／答案。原MCP、120秒、16工具、17模型回覆、停止／權限／隔離與未知收尾保留；重複失敗或成功寫入停止，不盲重送。原native與預設模型停用不變，無development.local.json，沒有正式部署或恢復。

143候選回歸（原128加15）、5程序歸屬PASS。真實同Qwen3 Q4_K_M／Ollama0.40.7 CPU最終8192context、512output、seed42：分步首輪67.6秒正確筆記與新事實A0→1；續輪73.1秒A1→2確實承接，但誤用記憶舊版本0、未新增事實。筆記拒絕案69.4秒0筆記，拒絕有效。舊schema同配置94.7秒只抄工程種子、未新增身份事實。完整23工具案85秒選錯read_record，把身份條件ID當事件ID遭拒，0筆記，且模型自行在記憶聲稱未執行工具成功。五案都提交，不代表任務品質五案通過；全選continue而非要求wait。原始模型內容原樣存，不由工程補寫。完整本地生活仍不採用，非LoRA或模型能力絕對上限證明。

初次反覆選動作及14336context失敗／低RAM安全停止均留證，自己程序退出後才改8192，兩組對照同配置、完整資料不裁切、RAM保留不降低。最終最低可用1.81GiB，自己工作集峰值2.34GiB／private2.44GiB為採樣。四批自己服務退出收據PASS；最後只有原共用引擎、候選MCP0。正式21684／報告16016不重啟，六DB全部state及事件數／內容雜湊完全相同，A82／A69維持停止；正式來源／治理及共用31552／34248連線／上次metrics不變，41檔SHA再核對PASS。不改正式身份出生記憶歷史時間額度權限、不換模、不恢復、不下載、不Freeze、不上傳。

交付evidence/qwen-staged-life-20261021/DELIVERY_REPORT.md、SUMMARY.json，候選docs/LOCAL_BRAIN_STAGED_LIFE.md。只可選候選；取消staged回native／schema，不覆蓋DB或抹去失敗史。下一步剩新舊狀態判讀、完整工具選擇、真實收據敘述與wait遵循，沒有自動繼續調整或正式採用授權。下方歷史保留。

## 2026-10-21 同一Qwen3接頭／提示／記憶流程對照完成，未採用正式生活

Owner授權先做前四項排除與合成對照，不下載、不換正式模型、不影響正式個體或共用聊天。只改development/windows-foundation：用途及實際綁定模型標示、完整記憶快照／空清單語意、中性工具回饋，可選可逆重複物件引用（預設original）及控制實驗seed。內容仍由模型產生；原MCP驗證、租約、冪等、120秒與資源保持，不替模型補回記憶。128回歸、5程序歸屬單元PASS。

真實同Qwen3 1.7B Q4_K_M／Ollama0.40.7：單筆記成功但模型提交空memory；單記憶A0→1及同個體真實續輪A1→2保留工程明示seed，未新增事實。三個完成輪次的DB→模型輸入→模型提交→DB及下輪讀回逐段一致，沒有傳輸／保存遺失。兩個完整流程各寫1篇但只是重抄舊記憶，重複request_id配不同內容遭IDEMPOTENCY_CONFLICT，原120秒截止未提交，A0不變。不是人格或正式個體測試。

固定同輸入2×2（legacy／neutral×original／referenced）各重播2次，八次格式合法且選write_note，但指定身份事實0/8；展開引用後背景值及其餘請求雜湊一致。去重省530token約12.5%未改善此例內容。重播不執行工具、不寫A/B。短文字記憶4/4成功；同一單一記憶任務，完整身份／A聚焦背景及完整背景各2/2成功。這些獨立回覆沒有存入個體，不當生活／學習通過。證據更指向多工具／多欄位任務的適配負擔，不能判為Qwen完全不會記憶或單純容量用滿；唯一根因尚不能定案。

自己監督器初次CIM與handle時間精度／退出競態錯誤保留，核對自己精確路徑與建立時間ticks後收尾；後續只核對目前相同實例、取得handle才停止，不用/T。重驗／續輪／文字及背景對照退出收據PASS，最終只有原共用引擎，候選MCP0。原失敗fixture離線保留，不偽造完成或刪未知租約。正式21684／報告16016與src/package/lock/治理保持，六DB所有state及事件數／內容雜湊完全相同；共用31552／34248與連線及last_metrics相同、41檔SHA再核對PASS。不改身份出生記憶歷史權限時間，不恢復、不延長、不Freeze、不上傳。

交付evidence/qwen-controlled-comparison-20261021/DELIVERY_REPORT.md及SUMMARY.json，候選docs/LOCAL_BRAIN_CONTROLLED_COMPARISON.md。預設停用無development.local.json；完整本地生活仍未通過。下一步是清楚分離行動、參數及記憶更新的受控契約，非換模型或自動代寫；改記憶操作語意須另行設計驗收。本節不授權正式部署或生活。下方歷史保留。

## 2026-10-21 本地接頭預算與通用工具格式改善，仍未達生活採用標準

Owner同意下一步改善，只在development/windows-foundation實作。Ollama0.40.7明示truncate:false／shift:false，真實回應後以prompt_eval_count加回答預留核對才執行工具；不是推理前精確tokenizerAPI，不裁切身份記憶。未知版本保留保守閘門，模型摘要或服務版本變更停止。可選schema單工具傳輸由原MCP Schema產生，模型自己選工具／填內容，保留原MCP權限、租約、120秒、16工具及交易；native仍預設，設定仍停用，無development.local.json。

118開發回歸及5程序歸屬單元測試PASS。真實Qwen3超量18016/2048明確拒絕；重驗兩輪get_context→commit成功A0→2，各約49／57秒，但略過指定筆記、memory皆空，0筆記，非空記憶承接未通過。note=false案未實際提出寫入，拒絕未觸發，不能冒稱真實拒絕通過。完整23工具正常生活未驗收。首次嘗試重讀情境後逾時證據保留，不延長或手補內容。

取消保留worker／lease，原測試腳本僅看父PID造成舊程序誤歸屬，沒有自動結算成功。後續按建立時間／執行檔核對，自己的模型埠及MCP已退出，只剩原共用服務；四個較舊程序沒有被停止。只停本次腳本Node22016，離線合成fixture仍保守隔離，不手刪租約。兩支本次真實腳本入口已封存拒絕重跑，原碼保存在證據；後續須使用新的實例身分監督器，不能只以PID或/T認領程序樹。RAM原peak_owned含歸屬誤差，不作精確模型用量，系統最低可用約1.98GiB。

正式21684／報告16016與src/package/lock/治理保持，六DB全state及事件數完全一致；兩人停止、不換模、不改身份記憶歷史權限或時間、不Freeze。共用聊天31552／34248與last_metrics相同，41程式／模型SHA再校驗PASS。證據evidence/local-brain-reliability-20261021/DELIVERY_REPORT.md與SUMMARY.json，候選docs/LOCAL_BRAIN_RELIABILITY.md。工程修正交付不等於Qwen通過正式大腦採用，後續模型／資源另由Owner決策，不下載新模型、不恢復生活。下方為前階段語境。

## 2026-10-21 第3階段真實模型驗證已執行，尚未通過生活驗收

Owner明確授權將逾時修正合併本開發環境，以合成個體實測Qwen3速度／記憶體／工具與記憶承接，不影響共用聊天、不改正式模型或恢復正式生活。已逐檔合併Controller逾時分類、有限重試與身份世代核對，保留brainBinding，110項開發測試PASS。

真實短文字12次完成，約2.4–3.4秒／17–21token每秒（含載入、CPU短工作）；工具循環真實get_context成功，但未成功保存筆記或提交記憶，故跨輪記憶未達可驗證狀態，不能宣稱第3階段生活整合通過。工具Schema遵循與保守UTF8預算造成阻塞，不等同原生context已滿。開發版新增標準user訊息、可選縮小工具集合、MCP單文字外殼無損展開、相同失敗參數停止與實際用量紀錄；不補寫成功、不截斷身份或記憶、不放寬權限。細節見docs/LOCAL_BRAIN_REAL_RESULTS.md。

模型用獨立私有profile／模型副本／埠；自己測試服務程序樹已逐次確認退出，共用聊天及正式控制器未停止或重啟，正式資料前後一致。HTTP取消仍不當模型退出；worker與lease先保留，只在真實確認自己服務與MCP均退出後結算自己的合成資料。不得將此當成共用服務可被工程任意停止的授權。

預設大腦仍停用，沒有新增development.local.json或正式切換。下一步需補精確token預算及完整工具資料呈現／可靠度驗證，不直接開放正式生活或Codex委派。以下只下載／未推理等為前階段歷史，不推翻本節已完成的真實測試。

## 第3階段授權與驗證邊界

2026-10-21後續更新：Owner已選Qwen3 1.7B Q4_K_M並授權下載必要程式／模型。其後明確選擇先完成下載，待Owner關閉不用程式並於原生活結束後通知再實測。本次不載入、不推理、不更換正式設定。自己的獨立下載服務僅pull／metadata，完成驗證後關閉；不得由下載授權推定可做正式切換或重啟。以下暫不下載為前次語境。

Owner已授權本地接頭與合成測試，明確暫不下載、模型選定待階段完成後再討論。讀docs/LOCAL_BRAIN_PHASE_03.md。只在本候選.private驗證，預設模型仍停用；不能把合成HTTP服務當真實模型，不啟動／修改正式個體。未知模型計算收尾保留worker與租約，不能手動清除或殺掉他人共用服務。第3版設定另有本機接頭，先核對來源、上下文、模型摘要與權限；未選定、下載或部署正式。下方第0至2階段限制保留原有語境。

# Windows 開發環境協作規則

此目錄為開源準備第0至2階段候選。Owner已授權可替換大腦契約及現有Codex接頭，先讀README、docs/ARCHITECTURE.md與docs/BRAIN_INTERFACE.md，所有開發及合成測試使用本目錄自己的私人資料區。

不得尋找、匯入或操作其他環境的runtime、Owner連線、個體身份、記憶、歷史、作品或治理原文。不得由開發入口推定可停止、恢復、出生或改權限的正式授權。

啟動只使用scripts/development.mjs；大腦預設停用，經本開發版設定明確啟用後僅接受已驗證的Codex CLI／指定模型。只允許合成個體驗收，不能導入或操作正式個體。報告排程與歷史入口維持停用；報告用途接口可用合成資料單獨驗證。未知結果不盲目重送，不降低隔離來換取通過。

私人設定、憑證與資料不得進公開來源。尚未決定授權條款，不上傳或發布。本地模型與受控Codex委派工具尚未接入；正式部署、正式模型切換與增權都不屬於本次授權。
