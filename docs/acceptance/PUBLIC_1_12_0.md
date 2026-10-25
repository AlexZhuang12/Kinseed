# Public-source verification: 1.12.0-preview.1

AI-executed public-source checks on Windows, 2026-10-25:

| Check | Result |
|---|---|
| Locked dependency install, scripts disabled | PASS; 50 packages |
| Node regression | PASS; 874 tests, 0 failures, 0 skipped |
| Four-language deterministic build | PASS; 2199 messages, English/Japanese missing: 0 |
| Source boundary and known private-value review | PASS; no private runtime, credentials or individual data included |
| Package security advisory query | 0 known advisories at check time; not a guarantee against unknown vulnerabilities |
| Public-version Hedra synthetic UI | PASS; 23 checks, no generation or paid submission |
| Full hosted Windows regression and 35-script browser suite | Pending this push; actual run link and result will be recorded after completion |

The first public-version UI check found the template header still used the local suffix. The public header and four generated locale pages were rebuilt; the same UI check then passed. This did not change the local operational source or provider behavior. Source checks and locale checks were repeated after the correction. The complete hosted run verifies the final pushed tree separately.

Earlier local feature-candidate acceptance (874 Node, 848 browser checks and 54 synthetic update/rollback checks) is historical evidence, not additional unique tests to add to this run. First-party Owner interface feedback was received; independent third-party human, native-language and second physical-machine acceptance were not performed. No paid generation, real email or Whisper model loading was repeated for this source alignment. Raw private logs and operational snapshots are excluded.
