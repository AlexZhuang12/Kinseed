# Integrated Whisper staging acceptance

Target: 1.11.0-local.1, isolated Windows staging only. Production was not updated. This is AI-executed acceptance using synthetic entities and materials on one physical Windows computer; no third-party human, native-language usability, or second-machine acceptance is claimed.

## Executed checks

| Scope | Result |
|---|---|
| Complete Node regression | 864 passed, zero failures or skipped tests |
| Four-language UI | 35 scripts, 844 checks passed |
| Real dedicated Whisper manager | 17 checks passed, including actual synthetic Chinese transcription, drain-before-stop, fixed-endpoint restart, ownership proof and no replay |
| Manager failure cleanup | 10 checks passed, including deliberate termination of only the proven test daemon, native child cleanup, explicit stale-state recovery and occupied-port refusal |
| Same-data update / source rollback / reupgrade | 43 checks passed |
| Additional audio and document retention | 14 checks passed |
| Isolated CLI entry guards | 8 checks passed |
| Candidate / production feature mapping | 12 checks passed |
| Locale generation, source release boundary and static data boundary | Passed |

These scopes overlap; their counts must not be added as independent coverage. UI manager actions use an explicitly simulated service; the native manager checks above are separate real executions. The retention harness is deterministic and does not represent model-authored memory or new cloud-model acceptance. A test-process-only clock advances across an existing wait; neither the Windows clock nor production schedules were changed.

The first full regression failed because a public translation filename matched an existing private-service filename rule. The translation file was renamed; the boundary rule was retained, and the full 864-test run passed. Early fixture, timing and Windows link-creation failures were retained as engineering evidence rather than counted as successes.

## Preserved boundaries and limitations

The dedicated manager uses the previously approved Whisper base multilingual model and CPU archive. No model download, paid generation, formal permission grant, production deployment, or GitHub upload occurred. Its own controller and model service were closed after acceptance. Starting Whisper does not start an individual's life or grant hearing permission. ASR words are retained unchanged; Whisper is not a music, delivery, emotion, or artistic-quality judge.

Production-source, identity, history, permissions, daily arrangements, consumed usage and session preservation checks passed. A separate shared-model availability check did not pass: the existing chat page responded, but its Ollama engine was not reachable and its recorded engine process was absent. No shared-service start, stop or configuration operation was performed. The initial snapshot did not include an engine reachability probe, so the time and cause of that engine exit cannot be established from this run. This remains an external availability issue requiring clarification; it is not concealed by a blanket environment-PASS claim.

Production switching remains a separate decision, with fresh on-site safety checks, verified cold backup, source-only deployment, unchanged rights and usage, and source-only rollback. See WHISPER_SWITCH_PLAN.md. Private logs, paths, runtime snapshots, credentials and model files are excluded from the public source review package.
