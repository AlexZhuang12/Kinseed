# AI-executed project acceptance / AI全程驗收政策

Owner has selected AI-executed acceptance as this project's disclosed testing method. This supersedes earlier plans that required independent human sign-off before a preview. It does not claim that human tests occurred or that AI testing proves every user's experience.

本專案採AI執行規劃、操作、診斷、修正與重驗，再公開版本紀錄。這是專案自行驗收，不是獨立第三方認證。沒有執行的人類、新手、母語或另一台實體機驗收，均明示未執行；不虛構，也不作為本次必須取得的人類簽核。

## Results and scope

- `PASS`: this named case was executed and all its recorded assertions passed.
- `FAIL`: an executed case contradicted its expectations or its procedure failed. Retain the initial result, diagnose and rerun after repair.
- `BLOCKED`: a real external prerequisite or unresolved settlement prevented completion. Passing safety assertions does not turn an incomplete model task into success.
- `NOT_RUN`: not executed, with an explicit reason. Zero cases or absent output cannot be reported as a pass.

Synthetic fixtures, synthetic clocks, injected provider failures and real providers are labeled separately. A successful save is not task correctness; a local process exit is not a remote cancellation confirmation; a browser journey is not a human usability study. No acceptance layer fills in missing model answers, memories or receipts. No automatic model download, fallback or production permission change is authorized by running tests.

## Per-version public record

Run `npm run acceptance:local -- --allow-install-network` for local tests and clean-install verification. Explicitly authorize real account calls with `npm run acceptance:full`. Both use new synthetic individuals and keep raw output under `.private/acceptance`. Provider subcases require `--allow-provider`. Default `npm test` and CI do not invoke real models or download model weights.

The source digest covers `src`, `scripts`, `tests`, public `config`, `packages`, package and lock files. Private configuration is excluded. Published reports are not included in their own digest. Source changes during a run prevent publication of that run as a single-source result. The complete exported package has a separate file manifest.

Each report under `docs/validation/<version>/<run-id>` contains:

1. A fixed AI-execution disclosure, environment and tested-source digest.
2. The complete expected case inventory, statuses, actual assertion counts and timestamps.
3. Reproduction commands and evidence hashes.
4. Explicit unperformed human, physical-machine, shared-local-model and remote GitHub tests.

Old failed or blocked reports remain alongside subsequent runs. Corrections do not silently replace earlier results. Human approval of publication is a governance decision, not execution of an acceptance test.

## Privacy and publication

Public reports are created from a strict allowlist schema. Arbitrary logs, descriptions, transcripts, Owner links, filesystem paths and unknown fields are rejected. No raw-log folder, database, model conversation or screenshot is copied wholesale into the public source. An evidence hash identifies a retained private artifact; it does not make the artifact public or establish independent certification.

Source export runs its own secret-pattern and boundary checks. This does not prove all possible secrets are absent. Use synthetic content, inspect the exported file list and review selected public artifacts. Real individual identities, memories, birth records, conversations and work remain outside the package. Vulnerability details use the private reporting policy after that channel is activated, not public acceptance logs.

The AI may operate only its own acceptance fixtures and services. Existing individuals, their permissions and life authorizations, shared chat and shared local models are not restarted, resumed or used by these tests. Public reproduction on another user's machine must likewise be performed in a separate copy. A real-provider test can consume account capacity and finite shared machine resources; it cannot promise zero resource use.

## Publication limits

This workflow prepares local public-ready records. It never creates or uploads a GitHub repository. GitHub CI, a second physical computer, arbitrary local models and third-party human review remain untested unless a later report actually documents them. Previous Qwen compatibility failures are not erased by successful Codex tests. Supported scope is determined by actual evidence rather than a single universal “fully certified” badge.
