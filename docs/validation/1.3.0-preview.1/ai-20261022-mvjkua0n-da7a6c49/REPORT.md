# 1.3.0-preview.1 — AI-executed acceptance / AI執行驗收

Run: ai-20261022-mvjkua0n-da7a6c49

**Project self-acceptance performed by AI. No independent human, novice or native-language review was performed.**

本次為AI全程執行的專案自行驗收；沒有獨立人類、新手或母語驗收，不冒稱第三方認證。

System-under-test SHA256: `a1c0df202dab01e7c6e0df184d7c1dd624dfe39956e9a05a70601b0e84f28f0e`

Environment: win32/x64, Node 24.19.0; one physical machine.

| Case | Method | Result | Passed / assertions | Reason |
| --- | --- | --- | --- | --- |
| V01 Node regression / Node回歸 | synthetic-mechanism | PASS | 326/326 | NONE |
| V02 Shared UI and language build / 四語來源一致性 | static | PASS | 3/3 | NONE |
| V03 Four-language complete journeys / 四語完整操作 | synthetic-ui | PASS | 146/146 | NONE |
| V04 Source and disclosure boundaries / 來源與公開資料邊界 | static | PASS | 4/4 | NONE |
| V05 Clean install, stop/reopen and backup / 乾淨安裝啟停備份 | real-local-synthetic-data | PASS | 11/11 | NONE |
| V06 Real Codex brain, MCP and memory continuity / 真實模型與記憶承接 | real-provider-synthetic-data | PASS | 13/13 | NONE |
| V07 Real Codex work delegation / 真實作品委派 | real-provider-synthetic-data | PASS | 11/11 | NONE |
| V08 Failure, stop and isolation / 故障停止隔離 | injected-fault-real-mcp | PASS | 64/64 | NONE |
| V09 Real provider cancellation / 真實模型程序取消 | real-provider-synthetic-data | BLOCKED | 10/10 | PROVIDER_UNAVAILABLE |
| V10 Public report privacy negative cases / 公開資料隱私負例 | synthetic-mechanism | PASS | 8/8 | NONE |

## Reproduce / 重現

- V01: `npm test`
- V02: `npm run ui:check`
- V03: `npm run test:ui`
- V04: `npm run release:check`
- V05: `npm run acceptance:install`
- V06: `npm run acceptance:provider -- memory`
- V07: `npm run acceptance:provider -- delegation`
- V08: `npm run acceptance:failure`
- V09: `npm run acceptance:provider -- cancel`
- V10: `node --test tests/acceptance-report.test.mjs`

Provider tests require explicit `--allow-provider` and use only synthetic individuals. They use account capacity; no silent model switch or shared local-model load. Real completion and injected failures are different evidence. No results are filled in by the reporting layer.

## Not performed / 未執行

Independent human acceptance, native-language human review, another physical machine, remote GitHub CI, shared local-model inference and GitHub upload were not performed. These are disclosed limitations, not hidden passes or mandatory human sign-off. Qwen full-life qualification is not established by this run.

Raw logs stay private. This report publishes only fixed case identifiers, counts, statuses, times and evidence hashes. No real identities, memories, transcripts, account files, control links or absolute private paths are included. A hash identifies retained evidence; it is not a third-party certification or proof that a test was correctly designed.
