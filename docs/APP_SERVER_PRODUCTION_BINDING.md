# Production-shaped app-server binding candidate

This engineering candidate is identified as `app-server-production-20261029.1`. It is not deployed, published or approved for real inference. Its private engineering marker blocks native inference and login checks through the ordinary development entry, and requires isolated staging through the unified entry. The synthetic app-server flag cannot select a real exec adapter.

## Entry and settings

The advanced unified installation layout is `workspace/app` for source, `workspace/runtime_v1_2` for live data, and `workspace/runtime_reports` for reports. These advanced commands are not a replacement for the ordinary flat-source first-run guide.

`config/formal-brain.local.json` lives in the **workspace**, outside source. It has schema 1 and the strict brain shape shown in `config/formal-brain.example.json`. Missing settings retain exec. Invalid settings stop selection; they never silently choose another adapter.

`app/scripts/formal-selection.mjs status|exec|app-server` reads or selects the next adapter. Saving requires a stopped installation, no lease or global worker, no unknown model result and no live owned service. The local setting grants no birth, life, tool permission or spending authority. Saving, source maintenance and startup share a lock. Status from the unified entry reports the actual active brain rather than just a requested setting.

## Per-turn authority and accounting

Production mode does not manufacture a permanent qualification approval. `TurnAuthority` creates opaque process-local proofs bound to the purpose, call ID and exact prompt. Model JSON cannot forge them. Authority is checked again immediately before turn/start, and the persistent dispatch ledger forbids another submission under an already-dispatched key. Cached terminal receipts can be read again; changed inputs conflict.

- Life uses the original bound controller and live lease, exact deadline, active global worker and existing cycle reservation. Original window, Owner stop, permissions and quotas remain authoritative. It neither consumes a second life cycle nor caps normal authorized life at four test calls.
- Consultation requires the original queued/running job, original charged call ID and platform reservation audit, the current life identity and still-valid consultation authority. The consultation gets no life tools.
- Reports require a call already recorded by `Reports.call`, a running report job, the existing daily 60-call limit and job 24-call limit. They get no life tools. A reservation legitimately made before midnight remains valid after midnight; the same call cannot become another dispatch or another charge.

The original full report path still checks source quotations and independent grounding. Failure prevents publication, retains attempts and leaves future daily life consent unchanged. This is tested with explicitly synthetic protocol peers, not a claim about real report quality.

## Login and runtime

The production process factory requires the pinned, verified CLI and uses only its own account-home under the runtime. `app-server-account.mjs status` is readonly: it does not create a home, read credential content, start login, or claim that a credential file proves current validity. Actual initialized/account-read preflight is bounded, uses no turn and refuses tools. Preflight services are tracked until confirmed exited; concurrent checks share one attempt and unconfirmed cleanup blocks maintenance.

This iteration uses local peers for present/missing/expired account cases; it does not log in, check a real account, copy OAuth, install a CLI or call a real model. A future production login must be separately authorized and completed before stopping normal life for maintenance. Existing exec credentials remain untouched.

## Lifecycle and diagnostics

The bounded pool retains fresh threads each turn, original tool validation and no automatic fallback. Rotation records its reason, process and retained-thread count. RPC timeouts record the method and bound, and process cleanup records its time and whether exit was confirmed. These records contain no prompt or bearer token. No timeout was enlarged to hide the historical AS50 failure; its original root cause remains unproven.

Accepted external IDs, B delivery and accounting remain separate. Existing Hedra/Gmail implementations are not migrated by this change. A missing provider pauses the relevant work, not future daily consent. There is no universal exactly-once promise without a functioning store and provider lookup/idempotency contract.

## Reproduction

`node --test --test-concurrency=1 tests/app-server-production.test.mjs tests/app-server-formal-entry.test.mjs` runs the new synthetic binding and formal-shaped entry/source recovery cases. The old-source recovery fixture uses the locally retained, verified integration candidate; provide that historical source fixture when reproducing outside the engineering workspace. Full Node, four-language UI, source and export checks are separate, overlapping acceptance layers.
