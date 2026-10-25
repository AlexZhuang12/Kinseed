# 1.13.0-preview.1

Public-source alignment with the 1.13 local baseline and the 2026-10-26 report reliability fixes. This updates repository source; it does not create a GitHub Release or tag. Existing Releases remain unchanged.

## Changes

- Independent consultations return a durable job ID immediately. Scoped status queries retrieve the original answer in later rounds. A settled failure does not permanently block new questions or cancel future daily consent. Existing account and cycle limits, cancellation, isolation and uncertain-operation protections remain.
- Report quotation checks accept an exact contiguous decoded string from the specified source, including newlines, quotation marks and backslashes, and retain legacy JSON count citations. They do not join fields, normalize or fabricate quotations.
- Report writing distinguishes each paragraph's self-reported notes or saved plans from independently confirmed results. Unsupported rankings and overstatements are not treated as established facts.
- A valid unsupported-content review can request one model revision of that narrative using the same facts, followed by complete quotation and independent grounding checks. The system does not edit model prose. Daily and per-job call limits remain unchanged; exhausted or malformed reviews still fail visibly.
- The report page uses the pink visual system, separates generation from read-only refresh, displays phases and failure explanations, preserves older successful versions, and keeps expandable original evidence.
- Added [second-computer installation guidance](SECOND_COMPUTER.zh-Hant.md) covering separate accounts and one Owner using the same account on independent computers.

## Distribution scope

New clones start with their own empty private data, logins, permissions and configuration. They do not include the developer's operational runtime, existing individuals, model weights, private account settings or OAuth tokens. The generic first-setup entry remains separate from the developer's local unified entry.

The original operational daily LLM report scheduler and archived-individual manager are not enabled by the generic clone entry. Their report source and synthetic verification are included, but publishing those source changes does not enable the private operational service for new users. See [compatibility](COMPATIBILITY.md).

## Acceptance

See [public acceptance record](acceptance/PUBLIC_1_13_0.md) for current source and hosted results. Earlier local evidence includes 121 consultation-related Node checks, 30 consultation browser checks, 10 synthetic upgrade/rollback checks, and later 31 report mechanism/browser checks, 21 quotation/daily-schedule Node checks and 8 operational read-only browser checks. These overlap and are historical local evidence, not additional fresh public tests to sum together.

Acceptance is AI-executed project self-acceptance. Owner interface feedback exists, but independent third-party human, native-language and second physical Windows machine acceptance have not been performed. No particular second-computer model has been physically qualified. No paid media, new email, Whisper model loading or real model consultation is required by default hosted CI.
