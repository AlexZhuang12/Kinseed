# General installation: 1.14 preview

Start with [published version downloads and checksums](DOWNLOADS.md). Use one release tag consistently; main is development source.


This preview source supplies the general installation flow, daily life, reports and archive visibility using each installation's own data and accounts.

## First use

1. Obtain the complete source with its lockfile. Install Node.js 24.19 or a newer supported Node 24 release on Windows, then run `首次設定.cmd`.
2. Install the pinned dependencies. Select your own Codex login, an already running local Ollama model, or leave the brain disconnected. Choose the installation time zone before creating data.
3. Optionally select daily automatic reports. The summary explains that they consume the selected brain's capacity. Saving or starting the console does not approve an identity, give birth to an individual, grant new tool permissions or create new life consent. Existing daily consent is checked and followed; an Owner stop is not reversed.
4. Start the console and create your own individual. General installation accepts ordinary identities; synthetic verification mode is separate. Complete approval, life settings, first birth and daily-life consent explicitly.
5. Use `開啟控制台.cmd` to reopen this installation, `啟動控制台.cmd` to start it, and `關閉控制台.cmd` to close it. The older development-named launchers remain aliases for compatibility. Do not copy a console URL from another installation.

## Reports

The console's daily reports button opens reports on the same authenticated installation. Choose a date to read saved versions. Reading, refreshing and expanding source evidence do not generate anything. Requesting a new report saves a new version, leaving previous versions intact.

The report settings show the actual selected brain, installation time zone, current readiness, model calls used today, and automatic scheduling state. You can choose the daily time and the language for new reports. Display language and the language of an already saved report are separate: changing the interface does not rewrite reports or original quotations.

Automatic reports are an explicit choice, not a hidden charge. First setup offers that choice; later, adjust it in the console. Existing installations keep their previous automatic-report choice. Model-unavailable installations still let you read reports and manage visibility; generation waits until their own brain is ready. No other account or provider is substituted.

Reports use at most 60 model calls per installation day and 24 per report job. These are separate from individual life-round budgets, but a cloud brain still shares the account's provider capacity. Reports wait for a life-model idle slot and do not revoke daily-life consent. The computer and controller must remain running. On service recovery, the scheduler considers the most recently missed day, not every missed day, and never replays missed life. Failed automatic jobs are not repeatedly regenerated without limit; manual retry is explicit.

Quotes must match a single original source exactly; paraphrases must pass an independent model review. A valid negative review may produce one bounded model revision. Unsupported output remains unpublished. No small local model is promised to satisfy that contract. Empty-day statements are deterministic record counts, not invented model narration. English/Japanese translations are AI-authored and have not received independent native-language review.

## Archive visibility

Manage visibility from the console or the report help section. Archiving requires no active work, an explicitly stopped individual, and daily scheduling off. It changes menus, journals and newly collected reports; it does not erase identity, birth, memories, work or historical reports. Restoring visibility never starts life. A currently active individual remains visible even if old archive metadata exists.

## What each user configures

Codex login, Gmail OAuth, Hedra authorization/billing consent, local Ollama and Whisper services, and each individual's tool permissions and budgets belong to that installation. Source distribution contains none of the developer's credentials, individuals, model weights or service sessions. A tool appearing in the interface does not mean its connection or permission is enabled. See [the capability matrix](PUBLIC_CAPABILITY_MATRIX.md).

## Upgrade and recovery

First let your own model/tool/report work settle, then close this installation normally. Back up and verify using `npm run backup` and `npm run backup:verify -- "backup-directory"`. Never copy a live SQLite file or replace new history with an old database.

Place a trusted, reviewed clean source package under this installation's `.private/update-source`. The new version's maintenance tool supports:

```text
node scripts/upgrade.mjs inspect ".private/update-source"
node scripts/upgrade.mjs apply ".private/update-source"
node scripts/upgrade.mjs rollback ".private/upgrades/receipt-id"
```

When upgrading an older release that does not yet have this tool, run the reviewed new package's `scripts/upgrade.mjs` through a recovery driver calling `applyUpgrade(existingRoot, stagedSource)`; see `docs/UPGRADE_RECOVERY.md`. The CLI itself always targets its own installation, so running a staged CLI must not be mistaken for upgrading its parent.

Source updates take and verify a cold backup before writing. They reject changed dependencies and require a separate reviewed dependency installation in that case. Receipts record partial progress. Rollback restores source files only; it never restores runtime databases or old life permissions. A local manifest detects changed bytes but does not authenticate a publisher. Preserve your verified backup and inspect the result before authorizing further life.

Supported here: independent new installations and source-only updates with unchanged pinned dependencies. Not supplied: cross-computer individual synchronization, a shared multi-installation account-budget coordinator, automatic cloud storage integration, or a guarantee that every local model works. No second physical Windows computer or independent human acceptance is claimed.
