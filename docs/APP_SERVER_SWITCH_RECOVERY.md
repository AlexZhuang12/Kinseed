# Candidate switching and source recovery

Stop this installation after its work settles. Selection and maintenance inspect all bound development sessions, active leases, model worker state, persisted unknown invocations and still-live services. They do not kill other processes, erase unknown work or authorize life.

## Adapter switch

`exec → app-server → exec` can use the same isolated database. New threads receive the current Kinseed memory, not prior model-thread history. Original identity/birth, append-only history, permissions, daily consent and used quota remain in the current database. Background receipts remain independent of adapter choice; the new runtime retains their reader even when exec is selected.

Owner-stopped daily life stays stopped after restart. Environment or provider errors do not revoke future consent. An unknown model invocation blocks an automatic switch; reconcile its existing result instead of dispatching it again through another adapter.

## Source update and rollback

Use the existing cold `scripts/upgrade.mjs inspect|apply|rollback` flow with reviewed source under this copy's `.private`. Snapshots include current private runtime journals and database hashes. Rollback restores source only, never an old database over newly appended history.

A source without app-server support cannot read configuration version 4: select exec first. A source downgrade is blocked while background results, B delivery or accounting remain pending. Forward upgrade or reconcile them with a compatible reader first. It is safer to report a blocked downgrade than to strand an accepted paid job. Do not force-delete journals or use an old data snapshot to bypass the gate.

The source-cycle acceptance starts each source version in a fresh child process. It upgrades, appends a synthetic history event, boots the actual older source, then upgrades again. This avoids module caching disguising a rollback. It verifies the original history prefixes and new records throughout, plus no data restoration.

## Unconfirmed shutdown

The console refuses closure while report work or background operations remain unsettled. An unsuccessful attempt keeps diagnostics available and allows retry. It never reports process exit from a terminal model turn alone. A lost provider response remains unknown until lookup or manual reconciliation; lack of a response is not a refund or permission to submit again.

These instructions concern the isolated candidate. They do not authorize production interruption, changes to any formal individual's schedule, or public release.

結果不明包含「程序已收尾、結果仍 unknown」；這種狀況同樣禁止改用另一接頭重做。本候選沒有提供一鍵清除未知紀錄，須另行核對工作與授權後設計處置。設定選擇與首次設定共用保存鎖，避免互相覆蓋；關閉一旦開始，即使失敗也不再接受新提交，只能核對並重試關閉。
