# Interface languages and life timezone

Version 1.3.0-preview.1 is a four-language engineering candidate, not a claim of independent native-language review. Read the language-specific [user guides](USER_GUIDE.en.md) for operation.

## One source, four builds

UI source remains shared. `scripts/ui-localization.mjs` uses the vendored Acorn parser to identify static JavaScript strings and HTML display text. Stable content hashes key the message inventory. `src/i18n/translations-*.json` holds source, English and Japanese triples; OpenCC builds Simplified Chinese offline from Traditional source. `npm run ui:build` rebuilds both shared bundles and all four locale variants. `npm run ui:check` rejects stale output or missing translations. Do not edit generated files by hand.

Language switching stores a local preference. A read-only state bridge carries the selected individual, current page, editable draft and supported unsaved forms across the same browser's language navigation. Current draft identity and revision are checked before restoring. Final birth confirmation is never restored. Busy operations prevent switching. This does not grant permissions, save forms to the backend, call a model or alter life authorization. Concurrently changed or unknown drafts are not blindly applied. Save progress before changing browsers; sessionStorage is not a backup.

Only display text is localized. Stored identities, original answers, memories, model messages, evidence, work contents, tool IDs, API keys and protocol confirmation text remain original. Raw diagnostics and provider messages can retain their original language; do not claim that arbitrary third-party output is translated. Default questionnaire labels and examples are display translations, not replacements for its saved source snapshot.

## Terminology

| zh-Hant | zh-Hans | English | 日本語 |
| --- | --- | --- | --- |
| 草稿 | 草稿 | Draft | 下書き |
| 身份 | 身份 | Identity | アイデンティティ |
| 提交審核 | 提交审核 | Submit for review | 審査に提出 |
| 批准採用 | 批准采用 | Approve adoption | 採用を承認 |
| 首次出生 | 首次出生 | First birth | 初回誕生 |
| 恢復生活 | 恢复生活 | Resume life | 生活を再開 |
| 生活時區 | 生活时区 | Life timezone | 生活のタイムゾーン |

Review important distinctions rather than merely counting translated strings. Approval never means birth; birth never means continuous activity; stop clearing never resumes other individuals. Independent native-language review was not performed and is disclosed. Under the current AI-executed acceptance policy it is not mandatory human sign-off.

## Timezone semantics

Language never chooses timezone. New installations may explicitly choose an IANA timezone in First setup. Existing data retains its saved timezone; legacy data without one stays Asia/Taipei. Reopening a registry under a different timezone is rejected. No migration or change to original UTC history is performed.

Daily windows follow local calendar dates. A missing clock time during spring daylight saving starts at the first valid minute; a repeated clock time in autumn selects the first occurrence once. Window duration is elapsed minutes. Individual rounds belong to the window's start date; platform and network daily budgets use local calendar days. Temporary life retains its exact authorized start, end and budget day. Journal date grouping follows life timezone without rewriting events. The disabled daily report scheduler is not automatically enabled by internationalization.

## Translation contributions

Change shared source or translation triples, build, then run tests and four-language journeys. Do not translate arbitrary user content, alter governance or shorten safety confirmation to fit. Mark independent reviewer language, source version, screens reviewed, findings and resolution. AI-generated drafts are not human review. Include desktop and narrow-screen screenshots using synthetic identities only. Public reports must not contain complete Owner links, local usernames, real individuals or private logs.

The non-sensitive `kinseed-ui-language` browser cookie also carries the language across loopback port changes. It stores only an allowlisted locale, never authentication or individual data. Unsaved forms remain tab-scoped, not a cross-browser or cross-port backup.

## Current acceptance policy / 目前驗收方式

Owner selected AI-executed project self-acceptance. Independent human, novice and native-language tests were not performed and are disclosed, not mandatory human sign-off for this preview. This supersedes earlier human-gate wording; it does not convert unperformed tests into passes. See [AI acceptance policy](AI_ACCEPTANCE_POLICY.md) and [version records](VALIDATION_INDEX.md).
