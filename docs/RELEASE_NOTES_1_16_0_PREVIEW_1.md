# Kinseed v1.16.0-preview.1 — app-server integration preview

This preview adds the Codex app-server integration while retaining exec. It is a Windows source preview, not a stable release or permission to change an existing installation's accounts, data, tools or daily consent.

## Changes since 1.15.0

- On-demand, bounded app-server process reuse with a fresh conversation per turn. Kinseed continues to own identity, memory, history, permissions, quota and daily authorization.
- Separate initialization, account, thread and submit-acknowledgement stages, plus same-working-host readiness before a life worker/quota reservation. Preparation failure preserves future daily consent and does not spend a life cycle.
- Request-stage and late-response diagnostics, strict Owner/tool revocation, unknown-result no-replay protection, durable accepted-job IDs and separate result/history/accounting recovery.
- Production-shaped life, asynchronous consultation and report reservations; explicit adapter selection while stopped, private account-home configuration, source-only update/rollback guards and preservation checks.
- Four-language connection-state guidance and additional synthetic lifecycle, cancellation, isolation, failure and source-recovery acceptance. Source-history fixtures are distributed as source-only deltas so clone-based tests do not need private engineering directories.

## Installation and activation scope

Windows x64, Node 24.19.x, pinned qualified Codex CLI 0.164.0-alpha.11.1 for app-server. No CLI binaries, credentials, models, dependencies or individual data are bundled. Use [downloads](DOWNLOADS.md) and first setup for a new private installation. Existing default exec users are **not automatically switched**.

The generic first-run app-server choice remains restricted to isolated candidates. Native production activation is an advanced, explicitly approved `workspace/app` integration, documented in [app-server integration scope](APP_SERVER_PUBLIC_1_16.md). This release does not claim a new one-click app-server installation/login wizard for every fresh clone. Do not create a synthetic marker to bypass native authorization. Keep your own accounts and data private, settle work, verify a cold backup, and retain a compatible exec path before switching.

## Acceptance and limits

The final exact main SHA, fresh locked installation, Windows synthetic CI and counts are added by the verified release workflow; see [the public acceptance record](acceptance/APP_SERVER_1_16.md). Historical qualification included real model work in separate budgets; the packaging/CI work does not make new real-model or paid-service calls. Three native zero-turn hosts and six empty ephemeral threads passed readiness; an Owner-authorized installation also completed a naturally scheduled life round. These observations are not 57-tool, full real multi-stage report or provider-wide qualification.

The original single process-rotation failure and a later aggregate test-teardown stall were not reproduced sufficiently to establish their root causes. Preserve these limits; passing reruns do not prove them fixed. The generic background bridge does not silently migrate existing Hedra/Gmail jobs or promise universal exactly-once execution. No new performance/RAM guarantee.

AI project self-acceptance. Independent human, native-language, second physical Windows and OS escape verification: **NOT_RUN**. Preview translations remain engineering drafts. Remote results can remain unknown after local cancellation; never resubmit through another adapter automatically or replace newer history with an old database.

繁中：這版新增app-server接頭與準備／收尾／回退防護，保留exec，沒有自動替既有使用者切換。一般首次設定仍沿用原流程；原生app-server啟用屬進階整合，須自行核對帳戶、備份與授權。發行驗收使用合成資料，不包含私人個體、登入或原始工程紀錄。
