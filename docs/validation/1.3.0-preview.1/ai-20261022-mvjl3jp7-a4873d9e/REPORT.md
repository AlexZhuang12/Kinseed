# 1.3.0-preview.1 — AI-executed acceptance / AI執行驗收

Run: ai-20261022-mvjl3jp7-a4873d9e

**Project self-acceptance performed by AI. No independent human, novice or native-language review was performed.**

本次為AI全程執行的專案自行驗收；沒有獨立人類、新手或母語驗收，不冒稱第三方認證。

System-under-test SHA256: `2015b219ab9a52f18afd93c2d277c412ffd95b3a36987fa4b915aa504ba794c0`

Environment: win32/x64, Node 24.19.0; one physical machine.

| Case | Method | Result | Passed / assertions | Reason |
| --- | --- | --- | --- | --- |
| V01 Node regression / Node回歸 | synthetic-mechanism | PASS | 330/330 | NONE |
| V02 Shared UI and language build / 四語來源一致性 | static | PASS | 3/3 | NONE |
| V03 Four-language complete journeys / 四語完整操作 | synthetic-ui | PASS | 146/146 | NONE |
| V04 Source and disclosure boundaries / 來源與公開資料邊界 | static | PASS | 4/4 | NONE |
| V05 Clean install, stop/reopen and backup / 乾淨安裝啟停備份 | real-local-synthetic-data | PASS | 11/11 | NONE |
| V06 Real Codex brain, MCP and memory continuity / 真實模型與記憶承接 | real-provider-synthetic-data | PASS | 13/13 | NONE |
| V07 Real Codex work delegation / 真實作品委派 | real-provider-synthetic-data | PASS | 11/11 | NONE |
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

Started: 2026-10-22T13:35:57.371Z; finished: 2026-10-22T13:37:00.398Z (UTC).

Evidence SHA256: 74ece5f936798a6a3f7b666013e061cbbfc8b9f7b1a3c2d0ac49d4ab42b47150

Aggregate automated assertions; exact test procedures are in the published source and reproduction command.

### V02 Shared UI and language build / 四語來源一致性

Started: 2026-10-22T13:37:00.400Z; finished: 2026-10-22T13:37:01.367Z (UTC).

Evidence SHA256: 7e4179513cf6bd5e82c55c202dc0729e1c481af492bfb8639abc97135ab886ea

Aggregate automated assertions; exact test procedures are in the published source and reproduction command.

### V03 Four-language complete journeys / 四語完整操作

Started: 2026-10-22T13:37:01.368Z; finished: 2026-10-22T13:37:58.480Z (UTC).

Evidence SHA256: 2f26213c7fda0c2b22ac6433577872e47a0ec89c5bc19e9bedc3872e0adec119

Aggregate automated assertions; exact test procedures are in the published source and reproduction command.

### V04 Source and disclosure boundaries / 來源與公開資料邊界

Started: 2026-10-22T13:37:58.481Z; finished: 2026-10-22T13:37:58.715Z (UTC).

Evidence SHA256: 20f1aee66718a518417576b9dfa78769720556e04bf7510abbdc31f2aee97ec2

| Check | Expected | Actual |
| --- | --- | --- |
| c0 | true | true |
| c1 | true | true |
| c2 | true | true |
| c3 | true | true |

### V05 Clean install, stop/reopen and backup / 乾淨安裝啟停備份

Started: 2026-10-22T13:37:58.716Z; finished: 2026-10-22T13:38:16.465Z (UTC).

Evidence SHA256: 5e66c10e845e908875edaf1e3450bc667d6cb947b4d3035e2cf26382e4d46df4

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

Started: 2026-10-22T13:38:25.265Z; finished: 2026-10-22T13:39:40.386Z (UTC).

Evidence SHA256: 7fe19717e2126de9159afb8b07acfe13507bff7518c7b05bfbcd235a660d3a29

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

Started: 2026-10-22T13:39:40.387Z; finished: 2026-10-22T13:40:05.701Z (UTC).

Evidence SHA256: 73a020e3caeec3076710b2aa029cf7ff3cf5c13b3921375f638e9add661de4c2

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
| delegate_completed | true | true |
| exit_confirmed | true | true |
| own_services_closed | true | true |

### V08 Failure, stop and isolation / 故障停止隔離

Started: 2026-10-22T13:38:16.468Z; finished: 2026-10-22T13:38:25.141Z (UTC).

Evidence SHA256: 285c9d08ddbe73cfed9c48bdf28425f001355eda8803f1266f026f2cf47e438c

Aggregate automated assertions; exact test procedures are in the published source and reproduction command.

### V09 Real CLI cancellation and local settlement / 真實CLI取消與本機收尾

Started: 2026-10-22T13:40:05.702Z; finished: 2026-10-22T13:40:08.789Z (UTC).

Evidence SHA256: a85bb6db42790012c7396d78e282ac3f81df38de38d5d73509af11963cf02422

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

Started: 2026-10-22T13:38:25.142Z; finished: 2026-10-22T13:38:25.264Z (UTC).

Evidence SHA256: 3cda6c707c0a6c6ccdfe02acf2caf5f6f8b6e756f9bc2615ebeb3e915988f55e

Aggregate automated assertions; exact test procedures are in the published source and reproduction command.
