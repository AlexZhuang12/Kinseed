# Contributing to Kinseed

Use a clean Windows development copy with Node.js 24.19 or a later 24.x release. Do not use a directory containing real individuals as your test or publishing root.

1. Install locked dependencies with `npm ci --ignore-scripts --no-audit --no-fund`.
2. Run `npm test`, `npm run boundary:check` and `npm run release:check`.
3. If editing Owner UI source, rebuild with `node scripts/build-owner-controls-ui.mjs` and check with `--check`.
4. Add meaningful regression coverage for changed behavior. Default tests use synthetic individuals/processes/HTTP services and must not require account login, model downloads or real inference.
5. Export a clean copy with `npm run source:export`; never publish `.private`, installed dependencies, model weights or personal evidence. Read `docs/PRIVACY.md` first.

Use one focused change per pull request and describe the problem, resulting behavior, validation, data compatibility and rollback. Keep identity/governance content separate from product code. Do not alter a personality, fabricate memory, increase permissions, remove quotas, weaken isolation, auto-birth an individual or silently retry unknown writes to make a test pass. Real-provider checks are separate, explicitly authorized exercises and must state failures and limits honestly.

Translations share one source implementation. Preserve interpolation variables, identifiers and confirmation semantics. Translate UI and teaching examples, not stored identities, messages or evidence. Label AI-produced drafts and record human language review separately; do not call an automated language test a native-speaker review.

Read [the engineering plan](docs/OPEN_SOURCE_ENGINEERING_PLAN.md), [architecture](docs/ARCHITECTURE.md), [model contract](docs/MODEL_ADAPTER_STANDARD.md) and [community rules](CODE_OF_CONDUCT.md). Original contributions follow Apache-2.0; preserve third-party notices. Do not submit private materials without the right to publish them.

Run `npm run test:ui` on Windows with Chrome installed at its standard Program Files path. It creates only synthetic individuals and local services in `.private/ui-acceptance`, never calls a model, and closes its own services. Its fake ready-state is UI-only evidence, not a provider integration result. Four language journeys, setup and unsaved continuation checks are included in the exported source.

## Current acceptance policy / 目前驗收方式

Owner selected AI-executed project self-acceptance. Independent human, novice and native-language tests were not performed and are disclosed, not mandatory human sign-off for this preview. This supersedes earlier human-gate wording; it does not convert unperformed tests into passes. See [AI acceptance policy](docs/AI_ACCEPTANCE_POLICY.md) and [version records](docs/VALIDATION_INDEX.md).
