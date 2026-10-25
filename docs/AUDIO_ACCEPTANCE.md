# AI-executed local audio interface acceptance

Historical 1.10.0 interface results below remain unchanged. The current 1.10.1 quality revision and real Whisper chain are documented separately in [AUDIO_QUALITY_ACCEPTANCE.md](AUDIO_QUALITY_ACCEPTANCE.md); do not add the two revisions' counts or treat the old model-pending status as current.

Candidate: 1.10.0-hearing-preview.1. This is an independent local candidate, not a production deployment or a public release.

## Verified scope

- 835 Node regression tests passed, including 28 local audio boundary/workflow tests. The earlier film suite is included, not added again.
- Four-language UI matrix: 35 scripts and 784 checks passed. Successful earlier scenarios were retained; affected workflow/version, film playback and new hearing scenarios were rerun and replaced their earlier rows. Repeats are not added. The first combined UI run failed on a fixed playback delay; a subsequent renderer-side wait stalled. The final test uses bounded host-side playback checks. Only its own stalled test process tree was cleaned up; these failures remain in private evidence.
- 13 actual isolated WAV conversion/local HTTP transport checks passed with a synthetic local service. Exact clip bytes were submitted only after approval, once; the reference question/script was not supplied to the Whisper request. This is not speech recognition accuracy evidence.
- Two real Codex rounds, 11 checks: the model created an A/B analysis proposal, read the original synthetic provider report on the next round, and authored its own note and memory. The analysis provider was explicitly synthetic; no real audio model ran. The brain correctly distinguished transport success from listening evidence.
- Sixteen clean-source/offline-cache installation, WASM, snapshot and restart checks passed, including preservation of disabled hearing settings and unresolved service work without replay. Fresh offline installation initially lacked npm cache; verified existing public npm artifacts were copied into the test cache and lockfile integrity was checked again. No model download occurred.
- Eight independent empty-entry start/stop checks and 119 read-only production-preservation checks passed. The initial page header retained the previous candidate version; the header and version-specific UI test were aligned and reverified.

## Corrections retained in evidence

Approval transaction nesting, explicit new-permission fixture fields, per-target confirmation state after refresh, saved connection version forwarding, brain/destination consent binding, report-read evidence, before-send versus unknown submission states, shared-endpoint holds after unknown work, and finite Owner-confirmed unsent retries were diagnosed and verified. Unknown results hold only new audio work for that local endpoint. Owner confirmation of actual service completion clears the hold without certifying or replaying the original result. Approving pending content never grants life.

## Not verified or performed

No trained local audio model was installed, loaded or benchmarked. No actual speech transcription, emotion recognition, music understanding, sound-quality judgment, word-error rate or real inference memory/speed result is claimed. The generic analysis protocol still needs a verified model wrapper. Whole-clip Whisper timing is not word alignment. A compatible response does not prove the service's actual model identity or perception. No cloud audio API, new paid audio call, production permission change, production controller restart or public upload occurred.

No independent human, native-language or second-physical-Windows acceptance was performed. Previous human receipts for unrelated features do not apply here. Subjective artistic judgment remains separate from measurable technical checks. Existing FFmpeg third-party licensing remains unchanged; no new trained model weights or native speech runtime are redistributed in this source package.

## Next gate

Owner chose local model assessment before installation. Complete source/flow verification does not replace that decision. The suggested first recognition experiment is multilingual Whisper base with a separately approved, pinned CPU runtime; it only covers dialogue transcription. A true tone/music/sound understanding model requires a separate capability and resource evaluation. Production deployment, permissions and GitHub publication remain separate decisions.
