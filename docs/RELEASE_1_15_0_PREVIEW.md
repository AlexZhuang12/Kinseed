# 1.15.0 preview source update

Desktop updates can remove a CLI path used by another running application. Kinseed now exactly qualifies CLI 0.164.0-alpha.11.1 and can retain its own verified four-file runtime bundle. Installer and runtime share the version policy; preflight reports the actual version. Corrupted private bundles fail closed rather than silently switching executables. Existing model/sandbox/tool/Owner boundaries remain.

See [runtime maintenance](CODEX_RUNTIME.md) and [AI acceptance](acceptance/PUBLIC_1_15_0.md). Fixed CLI files do not guarantee controller survival if the OS or its launching host terminates the process. No automatic watchdog or Desktop-update disabling is introduced. Hosted verification is pending.

Hosted diagnosis found a pre-existing PDF viewer read timeout shorter than its allowed queue/render/cleanup. Only PDF page reads now wait up to 120 seconds; write requests remain 10 seconds and backend resource limits remain unchanged. A synthetic delayed second-page response verifies waiting beyond 10 seconds without resubmitting. The first failed hosted run remains recorded in acceptance.
