# Isolated app-server integration candidate

This source is a candidate based on 1.15.0-local.1, identified as `app-server-integration-20261028.1`. It is not a production deployment or a GitHub release. Keep exec as the default. No real inference, paid generation, production identity, or production service is authorized by this guide.

## Entry and adapter selection

The candidate-specific `.private/candidate-scope.json` is created by the engineering workspace, not copied into public source exports. The candidate entry refuses external workspaces. Its private runtime uses the existing isolated development layout and a dynamic localhost port.

1. Use `node scripts/candidate-brain.mjs status` to inspect the selection. Wait for work to settle and stop this copy before switching.
2. `node scripts/candidate-brain.mjs app-server` selects app-server for the next start; `exec` selects the original path. Configuration version 4 describes app-server; versions 1–3 remain compatible. The current identity, memory, quotas and daily consent are not rewritten.
3. `node scripts/candidate-control.mjs start --synthetic` starts the explicitly labeled synthetic lab. It uses local protocol fixtures and no real model. `status`, `open`, and `stop` use only this copy's bound session. A prior or unknown session is not taken over.
4. First-run settings show the candidate choice only in the candidate workspace. Saving an unapproved choice is allowed, but connection readiness remains false; the review states that real submissions require separate authorization. Opening setup must not turn a saved app-server selection into exec.

The ordinary candidate development entry blocks real inference by default, including independent Codex delegation. The synthetic entry is scripted acceptance, not an AI quality demonstration. Reports may reject scripted content that does not satisfy their normal verification; no successful report is fabricated.

## Shared inference paths

`createBrain`, the normal unified life runner, asynchronous consultations, and report text inference all understand `codex-app-server`. The full existing life prompt is retained. Each life call is scoped to the original controller, endpoint, live lease and token hash; dynamic calls use the original schema validator and broker, rechecking authority. Offering a tool is not granting its permission.

One bounded controller pool owns at most four service slots. Slots are separated by individual/purpose; every round creates a fresh ephemeral thread. The existing adapter caps retained threads, idle time, wire size and tools. Reports and consultations receive no life tools. Active/acquiring/unknown slots cannot be evicted into another owner. There is no automatic fallback to exec.

A completed turn can settle while the process remains alive. Kinseed verifies the private settlement proof, revoked tools, no in-flight callbacks and a terminal turn or confirmed process exit. An unknown result is not a successful turn or permission to resubmit. Shutdown waits for accepted local work or remains blocked and observable; a failed shutdown can be retried.

## Real-call boundary

No new real-call grant is created by this integration. A future, separately approved host can provide an explicit fixed-model/low, maximum-count, expiring authorization. The runtime records durable model dispatch intents before turn/start; restarting cannot reset the cap. It uses its own `account-home` under the isolated runtime, never copied production OAuth. Its preflight reads account state without starting a model turn. Missing login, expired authorization or exhausted cap blocks readiness.

Do not reuse or reset the earlier six-call or four-call qualification grants. Those experiments remain separate evidence. Their measured two-round comparison does not qualify this newly integrated UI/runtime against a real provider; this iteration is synthetic acceptance.

## Background work and spending

Only trusted host registrations can attach a background provider. Registrations must supply explicit authorization, reservation and idempotent settlement targets; no new model tool or permission is added. No provider is registered by default. Existing Hedra/Gmail implementations are not silently rerouted into the generic bridge.

The bridge persists dispatch intent, accepted job ID, results, central B delivery and accounting delivery separately. Central B and its receipt share one SQLite transaction. Host reservation/settlement receive stable keys; the host target must enforce idempotency when the process fails after a target effect but before acknowledgement.

Before paid dispatch, authority is checked again after reservation. A revoked permission cannot reach the provider. Background status queries and pending receipts use bounded batches and the original life window, daily consent, Owner stop and resource holds. A missing provider pauses that job with backoff, not the individual's daily life consent. Unknown results are never resubmitted automatically. No lookup means manual reconciliation.

## Acceptance and limits

`node scripts/acceptance-app-server-integrated.mjs` takes no arguments and runs local synthetic integration/fault checks. Full product regression and browser checks are separate. `verify-app-server-integrated-ui.mjs` requires this copy's running synthetic session and checks four languages; it never logs in or sends inference.

The inherited real normal-work comparison and real revocation/cancellation tests are recorded separately. This iteration does not test real paid providers, OS escape, independent humans, another physical computer, or production deployment. There is no general exactly-once promise without a provider lookup/idempotency contract and a functioning durable store.

繁中：本候選把生活、諮詢、報告與背景補記接進共同流程；先用合成個體完整驗收，不替四位正式個體切接頭或開權限。選擇接頭不等於授權生活或費用。真正切換正式系統、發布或新增模型呼叫，仍需另行Owner決策。
