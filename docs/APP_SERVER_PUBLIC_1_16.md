# app-server 1.16: public integration scope

Kinseed uses Codex as a brain and retains its own identity, memory, history, tools, quota and Owner consent. App-server is an alternative local transport; it does not transfer governance to a long-running model chat. Each turn receives fresh thread context. Process reuse and bounded preparation are different from model inference success.

## Two entry paths

1. **Ordinary clone / first setup:** continue the documented first-run flow with exec or your supported local-model adapter. Defaults and existing installations do not change. The app-server selector in generic setup is intentionally shown only for isolated candidate environments; production authorization cannot be created by editing a test marker or by inventing a qualification budget.
2. **Advanced native integration:** the production-shaped CLI expects reviewed source at `workspace/app`, existing verified `workspace/runtime_v1_2` and `workspace/runtime_reports`, and a stopped controller. Read `config/formal-brain.example.json`, [production binding](APP_SERVER_PRODUCTION_BINDING.md) and [maintenance checklist](FORMAL_APP_SERVER_CUTOVER.md). These are integration primitives, not an automatic converter of an arbitrary clone's private runtime. Do not copy another installation's OAuth or database into this layout.

The production adapter reads the actual configured selection, checks the pinned managed CLI, and uses its dedicated private `runtime_v1_2/app-server-runtime/account-home`. Accounts and login remain yours. Account preflight is not a working-host readiness proof or an entitlement/credit check. There is no included universal migration wizard, no bundled account and no runtime bootstrap that creates real individuals on behalf of the Owner.

## Safe maintenance

Only after Owner approval: settle model/tool/consult/report work, inspect unknown jobs and original external IDs, normal shutdown, verify the cold backup and reviewed source, select the adapter while stopped and reopen. The maintenance scripts require their bound workspace and refuse active/unknown work. Preserve current private databases and daily intent. Resume only still-valid consent; explicit Owner stops remain stops. Do not add windows, tools or quota as part of a transport update.

Rollback may retain a compatible source with exec selected so newer journals remain readable. A source-only rollback never replaces the database with an old snapshot. Unknown submissions must not be replayed through exec. Keep a reviewed maintenance driver in private storage before downgrading source; never remove accepted external jobs to make the guard pass.

## Readiness, recovery and evidence

- Preparation is bounded per initialize/account/thread stage and by its parent deadline; it happens before reserving a life cycle. Failure waits locally and preserves daily authorization.
- The same owner/purpose host prepares a single-use empty thread. Later turns still create new conversations. A different owner cannot consume that preparation.
- Original tools and Owner consent are checked again at dispatch. An uncertain turn stays uncertain; a late thread reply alone cannot authorize a turn.
- Background accepted IDs, result delivery and accounting remain separately durable. Provider lookup and idempotency contracts are required; this is not a universal exactly-once promise.

See [readiness design](APP_SERVER_READINESS.md), [source recovery](APP_SERVER_SWITCH_RECOVERY.md) and [public acceptance](acceptance/APP_SERVER_1_16.md). The previous private historical-source prerequisite is replaced in public tests by exact source-only delta fixtures with per-file SHA checks. Raw private logs, identities, credentials, screenshots and original individual work are excluded.

繁中：app-server公開的是已實作的接頭、正式形狀整合入口與可重現驗收，不是把一般新安裝默默改成app-server。進階切換需符合工作區格式、專用登入與維護守門。請保留自己的最新資料與Owner授權；不要拿測試標記繞過限制。
