# Source-only upgrade recovery

This procedure never copies old databases over new history. It is intended for a reviewed source package with the same pinned dependencies.

1. Finish or safely settle the old installation's work, then close its controller normally. Retain the original configuration and data.
2. Copy the clean new source into the old installation's `.private/update-source` directory. Do not include node_modules, runtime, credentials or another installation's private files.
3. For a pre-1.14 installation, the new staged package contains the upgrade implementation. A recovery driver must import that staged module and explicitly select the old installation root:

```javascript
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const installation = process.cwd(); // Run from the existing installation root.
const source = path.join(installation, '.private/update-source');
const {inspectUpgrade,applyUpgrade} = await import(
  pathToFileURL(path.join(source, 'scripts/upgrade.mjs'))
);
console.log(inspectUpgrade(installation, source));
// After reviewing the plan, run in the same closed installation:
console.log(applyUpgrade(installation, source));
```

Save the driver inside `.private` and run `node .private/upgrade-driver.mjs` from the existing installation root, or use an explicit Node module command from that root; do not publish local paths or receipts. The snapshot/receipt functions refuse sources outside the target installation's private staging area and refuse live sessions. No life is started by applying source.

4. Start the updated installation, verify its version, reports, identity/history, permissions, budgets and daily intent. Do not grant new permissions as an implicit upgrade side effect.
5. If validation fails, close the installation and call `rollbackUpgrade(installation, receiptDirectory)` from the reviewed recovery module. For an installation already running 1.14, `node scripts/upgrade.mjs rollback ".private/upgrades/receipt-id"` is the direct equivalent. Only source is restored, including removal of newly added source files; the private data and configuration remain current.

If work cannot be confirmed finished, backup verification fails, dependencies differ, the staged source changes, or receipt/source integrity is uncertain, stop the upgrade procedure and retain the evidence. Do not kill other processes, replace databases, or blindly restore life consent.
