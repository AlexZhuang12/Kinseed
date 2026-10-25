# Local 1.6.0 Hedra acceptance update

Owner-authorized local deployment completed. The updated application source was tested through the actual controlled MCP transport using an isolated synthetic individual: quote, scoped permission, durable reservation, one real Hedra submit, same-job lookup, exact settlement and B event mirroring. One image cost 1 credit; the second local submit request returned the same local job without another remote generation. The synthetic runtime was stopped afterward. Production identities and media permissions were not used for this test.

695 Node and 395 UI checks passed on the local-release payload. Live production UI was checked read-only in four languages; original data and daily authority were preserved. Original historical statements below describe the earlier independent candidate and are superseded by this update. This local version has not been published to GitHub. Vendor outages/refunds/idempotency retention and independent human acceptance remain unverified.

# Hedra foundation: AI-executed acceptance

Candidate 1.6.0-hedra-preview.1. Independent local candidate; not a production release.

| Scope | Result |
|---|---|
| Node regression | 695 passed, including 48 Hedra tests (32 foundation and 16 OAuth integration cases; subsets overlap the full total) |
| UI | 395 unique checks: 295 existing and 100 Hedra checks across Traditional Chinese, Simplified Chinese, English and Japanese |
| Localization | 1946 static messages; English/Japanese missing entries: 0. AI-authored; native-language human review not performed |
| Fault injection | Local synthetic HTTP disconnect after acceptance; actual child-process exit before receipt persistence; restart does not resubmit |
| Budget | Integer accounting, atomic holds, per-individual limits, protected reserve, no reallocation of consumed credits |
| Isolation | Only own jobs; permission defaults off; no lifecycle or memory changes from configuration or settlement |
| Real Hedra | New provider read-only balance, schema, quote and existing-job readback passed. No new generation or charge in this integration run. One separately Owner-approved earlier smoke image completed for 1 credit; not a second integrated paid test |
| OAuth credit policy | Owner accepts the mutable shared billing setting. Explicit installation consent, workspace/version binding, credits checks and final cost reconciliation implemented; fixed=false. No immutable billing guarantee |

The fault-injection provider is synthetic, not Hedra. These results do not prove actual vendor refund behavior, idempotency retention, media quality, or immutable billing mode. Known-job status checks and local durable intent were tested; exactly-once execution at an external provider is not claimed.

An initial localization failure detected stale generated assets and was corrected without weakening the check. Initial abrupt Windows Node exit from a fetch microtask triggered a native assertion; the deliberate exit was scheduled after the fetch cleanup while still preceding receipt persistence. Idempotent cleanup and server-finally cleanup were repaired; failures remain in private evidence.

The installation connection and all media permissions remain disabled in the delivered synthetic preview. Audio routes to music only; video/music duration must be explicit. Uploads, downloads and playback are outside this integration. Complete vendor-paid dispatch through this new adapter plus ledger has not been repeated; its paid branch uses an injected synthetic provider matching the official response contract. No real provider outage, refund or insufficient-credit fallback was provoked.

No independent human, native-language, second-physical-Windows or multi-day provider acceptance was performed. Account credentials, operational identities, work, memory, raw logs and private evidence are excluded from source exports. Production deployment and new individual permissions require separate authorization.

See HEDRA_FOUNDATION.md and HEDRA_CONFLICT_REVIEW.md for operation, scope, recovery and limitations.
