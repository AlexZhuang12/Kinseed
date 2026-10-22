# 1.3.0-preview.1 — AI-executed acceptance / AI執行驗收

Run: ai-20261022-mvjlfxda-c30fe4e5

**Project self-acceptance performed by AI. No independent human, novice or native-language review was performed.**

本次為AI全程執行的專案自行驗收；沒有獨立人類、新手或母語驗收，不冒稱第三方認證。

System-under-test SHA256: `eac1057f428d65693d9f44857a2b5a6de5f657dd108d1f79ab4e7901e008ee4d`

Environment: win32/x64, Node 24.19.0; one physical machine.

| Case | Method | Result | Passed / assertions | Reason |
| --- | --- | --- | --- | --- |
| V01 Node regression / Node回歸 | synthetic-mechanism | PASS | 562/562 | NONE |
| V02 Shared UI and language build / 四語來源一致性 | static | PASS | 3/3 | NONE |
| V03 Four-language complete journeys / 四語完整操作 | synthetic-ui | PASS | 146/146 | NONE |
| V04 Source and disclosure boundaries / 來源與公開資料邊界 | static | PASS | 4/4 | NONE |
| V05 Clean install, stop/reopen and backup / 乾淨安裝啟停備份 | real-local-synthetic-data | PASS | 11/11 | NONE |
| V06 Real Codex brain, MCP and memory continuity / 真實模型與記憶承接 | real-provider-synthetic-data | PASS | 13/13 | NONE |
| V07 Real Codex work delegation / 真實作品委派 | real-provider-synthetic-data | PASS | 12/12 | NONE |
| V08 Failure, stop and isolation / 故障停止隔離 | injected-fault-real-mcp | PASS | 64/64 | NONE |
| V09 Real CLI cancellation and local settlement / 真實CLI取消與本機收尾 | real-provider-synthetic-data | PASS | 10/10 | NONE |
| V10 Public report privacy negative cases / 公開資料隱私負例 | synthetic-mechanism | PASS | 12/12 | NONE |

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

## Step results / 逐步實際結果

### V01 Node regression / Node回歸

Started: 2026-10-22T13:45:34.970Z; finished: 2026-10-22T13:47:01.509Z (UTC).

Evidence SHA256: be7b98df5b51a84a45a7b0bb7e971cff55e38dc504286e21335976363b5ea6e7

Aggregate automated assertions; exact test procedures are in the published source and reproduction command.

### V02 Shared UI and language build / 四語來源一致性

Started: 2026-10-22T13:47:01.510Z; finished: 2026-10-22T13:47:02.502Z (UTC).

Evidence SHA256: 7e4179513cf6bd5e82c55c202dc0729e1c481af492bfb8639abc97135ab886ea

Aggregate automated assertions; exact test procedures are in the published source and reproduction command.

### V03 Four-language complete journeys / 四語完整操作

Started: 2026-10-22T13:47:02.504Z; finished: 2026-10-22T13:47:59.039Z (UTC).

Evidence SHA256: 2f26213c7fda0c2b22ac6433577872e47a0ec89c5bc19e9bedc3872e0adec119

Aggregate automated assertions; exact test procedures are in the published source and reproduction command.

### V04 Source and disclosure boundaries / 來源與公開資料邊界

Started: 2026-10-22T13:47:59.040Z; finished: 2026-10-22T13:47:59.287Z (UTC).

Evidence SHA256: 178ea121380d99649cc080d11a7c390aafcbbd6a43da9a4e5edebfa6df303047

| Check | Expected | Actual |
| --- | --- | --- |
| c0 | true | true |
| c1 | true | true |
| c2 | true | true |
| c3 | true | true |

### V05 Clean install, stop/reopen and backup / 乾淨安裝啟停備份

Started: 2026-10-22T13:47:59.288Z; finished: 2026-10-22T13:48:19.020Z (UTC).

Evidence SHA256: 9dc23512a24cd5c2e699279f99123e134ccb512546bd659bde67d7772fce9ca7

| Check | Expected | Actual |
| --- | --- | --- |
| locked_install | true | true |
| no_inherited_private_config | true | true |
| empty_runtime | true | true |
| stopped_empty_platform | true | true |
| requested_timezone | true | true |
| unborn_and_no_delegate | true | true |
| backup | true | true |
| backup_verified | true | true |
| restart_preserves_data | true | true |
| restart_does_not_resume | true | true |
| session_closed | true | true |

### V06 Real Codex brain, MCP and memory continuity / 真實模型與記憶承接

Started: 2026-10-22T13:48:27.544Z; finished: 2026-10-22T13:49:47.522Z (UTC).

Evidence SHA256: fee947072ae8ecb152ed81fd62d65108112684b0e4e7586b458a42be95d7350f

| Check | Expected | Actual |
| --- | --- | --- |
| first_model_completed | true | true |
| first_model_exit_confirmed | true | true |
| first_memory | true | true |
| real_note | true | true |
| second_model_completed | true | true |
| second_model_exit_confirmed | true | true |
| second_memory_continuity | true | true |
| real_consult | true | true |
| one_birth | true | true |
| neighbor_unchanged | true | true |
| worker_released | true | true |
| real_report_purpose | true | true |
| own_services_closed | true | true |

### V07 Real Codex work delegation / 真實作品委派

Started: 2026-10-22T13:49:47.524Z; finished: 2026-10-22T13:50:34.325Z (UTC).

Evidence SHA256: 7eb43255dbd5e99c72e9b10532dc8bd2a3ed7b1d0e716db998d96827c02c6b38

| Check | Expected | Actual |
| --- | --- | --- |
| parent_mcp_closed | true | true |
| real_cli_spawned | true | true |
| worker_released | true | true |
| neighbor_unchanged | true | true |
| no_parent_memory | true | true |
| one_delegation | true | true |
| real_save | true | true |
| real_execution | true | true |
| real_sum_10 | true | true |
| delegate_completed | true | true |
| exit_confirmed | true | true |
| own_services_closed | true | true |

### V08 Failure, stop and isolation / 故障停止隔離

Started: 2026-10-22T13:48:19.021Z; finished: 2026-10-22T13:48:27.419Z (UTC).

Evidence SHA256: 3a3d0ed5f38b7cc76850a9ae719cc95e6781a616a5180272c36c8fe02c16b72f

Aggregate automated assertions; exact test procedures are in the published source and reproduction command.

### V09 Real CLI cancellation and local settlement / 真實CLI取消與本機收尾

Started: 2026-10-22T13:50:34.326Z; finished: 2026-10-22T13:50:37.385Z (UTC).

Evidence SHA256: fd1027cba477a23d553d39a7e06cf71e8efc00b64b5b6a3ae297b791472b1fe9

| Check | Expected | Actual |
| --- | --- | --- |
| parent_mcp_closed | true | true |
| real_cli_spawned | true | true |
| worker_released | true | true |
| neighbor_unchanged | true | true |
| no_parent_memory | true | true |
| one_delegation | true | true |
| cancelled | true | true |
| local_exit_confirmed | true | true |
| no_late_success | true | true |
| own_services_closed | true | true |

### V10 Public report privacy negative cases / 公開資料隱私負例

Started: 2026-10-22T13:48:27.420Z; finished: 2026-10-22T13:48:27.543Z (UTC).

Evidence SHA256: ab7b63cfca7e56bedcbe34311fa107ef4eb90c49567b30ee477ed5fa86f538ee

Aggregate automated assertions; exact test procedures are in the published source and reproduction command.
