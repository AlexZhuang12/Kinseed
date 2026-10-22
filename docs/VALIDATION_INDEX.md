# Version acceptance records

## 1.3.0-preview.1 — AI acceptance, 2026-10-22

| Run | Result | Record |
| --- | --- | --- |
| Initial | Cancellation incorrectly classified BLOCKED; retained unchanged | [Report](validation/1.3.0-preview.1/ai-20261022-mvjkua0n-da7a6c49/REPORT.md) |
| Classification recheck | All ten groups PASS; before additional legacy coverage | [Report](validation/1.3.0-preview.1/ai-20261022-mvjl3jp7-a4873d9e/REPORT.md) |
| Current full acceptance | All ten groups PASS; 562 Node assertions and 146 browser checks | [Report](validation/1.3.0-preview.1/ai-20261022-mvjlfxda-c30fe4e5/REPORT.md), [machine-readable results](validation/1.3.0-preview.1/ai-20261022-mvjlfxda-c30fe4e5/results.json) |

Read the [scope and reproduction procedure](ACCEPTANCE_SCOPE.md) and [diagnosis / corrections](validation/1.3.0-preview.1/CORRECTIONS.md). Failure and privacy subsets overlap the Node suite; counts must not be summed as unique tests. Current executed-system SHA256: `eac1057f428d65693d9f44857a2b5a6de5f657dd108d1f79ab4e7901e008ee4d`. Documentation added after execution is covered by the distribution manifest separately.

Independent human / novice / native-language review, a second physical Windows machine, and remote GitHub CI were **not performed**. This run did not evaluate a shared local model. These disclosures remain visible despite passing the requested automated scope.

Kinseed uses **AI-executed project self-acceptance**. No independent human validation is claimed. See [policy](AI_ACCEPTANCE_POLICY.md) for methods, statuses, privacy and unperformed tests.

Per-version results are generated under `validation/<version>/<run-id>/REPORT.md` and `results.json`. Reports contain structured, allowlisted facts; raw evidence remains private. A later pass does not remove an earlier failure or block. Source hashes identify the actual code under test.

Local regression and four-language browser journeys are available through `npm test` and `npm run test:ui`. `npm run acceptance:local -- --allow-install-network` additionally performs a clean install. `npm run acceptance:full` explicitly opts into real Codex account calls using synthetic data; it does not call shared local models or change existing individuals.

No remote CI, human trial or second physical Windows test is implied by a local report. GitHub publication remains a separate Owner decision.
