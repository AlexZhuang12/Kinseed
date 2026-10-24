# v1.5.0-preview.1 AI acceptance

AI-executed acceptance; [machine-readable result](LIFE_AUTHORITY_1_5.json). Final hosted CI status is recorded with the release and its linked run; local checks are not labeled as hosted checks.

- 637 Node tests, 239 four-language Chrome checks and 11 clean-install / backup / restart checks passed. Subsets overlap and must not be added into an inflated test total.
- Two real GPT/Codex/MCP synthetic turns passed: model-authored note persisted, first handoff deliberately omitted, next turn read the exact note and submitted its own memory. No answers or memory were supplied by the test harness. This injected scenario is not a claim of a live 120-second provider outage.
- Same-database source rollback and re-upgrade retained synthetic identity, memory, permissions, usage and old history. No database restore.
- Current lockfile audit reports 0 known advisories across 49 dependency packages; this is not an absence-of-unknown-vulnerabilities guarantee.
- Source boundaries and known-private-value review passed. No private identities, histories, OAuth or operational snapshots are distributed. A sample-only redaction was followed by regenerated UI and 24 targeted checks.

## Failed attempts and limits

Transaction nesting, old stop-policy expectations, dynamic receipt metadata, a stale delegation test and an initial working-directory error were diagnosed before final revalidation. Offline installation failed because its private cache lacked packages; the exact lockfile passed official online installation with install scripts disabled. Failures were retained in private engineering evidence, with this public summary avoiding private paths and account details.

No independent human, native-language, second-physical-Windows or multi-day soak acceptance was performed. No general local-model qualification or guaranteed provider capacity is claimed. Unknown operation results still require reconciliation; consent preservation does not override execution safety, original time, quota or Owner stop.
