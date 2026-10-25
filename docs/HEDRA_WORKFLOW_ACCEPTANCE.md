# AI acceptance: Hedra P0–P2

Candidate **1.7.0-hedra-preview.1**, 2026-10-24. Independent implementation only; not deployed or uploaded as a release.

| Verification | Result |
|---|---|
| Complete Node regression | 728 passed, 0 failed. Includes 19 new workflow tests and four adapter cancellation-cause cases. Subsets/repeated runs are not additional unique tests. |
| Complete browser regression | 23 runs, 544 checks passed across Traditional Chinese, Simplified Chinese, English and Japanese. Existing 452 checks plus 92 workflow checks. |
| Translation/build consistency | 1,977 messages, no missing English/Japanese entries; Simplified Chinese generated from the Traditional Chinese source. AI translations, not independently reviewed. |
| Source boundary and release-pattern checks | Passed; no private runtime, credentials or signed output URLs included in source export. This is not a guarantee against unknown vulnerabilities. |
| Candidate entry | Started on its own dynamic loopback port with zero individuals, global stop, inference disabled; closed normally. |
| Real read-only MCP | Candidate provider queried 43 image, 55 video and 12 audio catalog entries and representative input schemas. Before/after balance both 1,998 credits. Audio catalog includes unsupported speech/effects models; catalog presence is not a permission or compatibility guarantee. |
| Real original-result download | Re-resolved one previously approved paid synthetic image job, retrieved its existing JPEG (136,801 bytes), matched the previous SHA-256 and returned the same local artifact on repeat. No new generation call. |
| Synthetic playback | Valid PNG plus a fixed original solid-color WebM and synthetic WAV decoded in the sandbox; video/audio playback clocks advanced. These are not newly generated Hedra audiovisual outputs. |
| Fault/restart/isolation | Disconnect, expired URL, redirected/private destination refusal, exhausted quota, missing web permission, MIME mismatch, cross-individual access, parallel save, active-download shutdown and actual controller reopen verified. Only complete transactions expose saved artifacts. |

## Diagnostics and fixes retained

1. **Cancellation attribution:** the controller's deadline reason was discarded by adapters. Forward the original cause; missing causes stay unspecified. Synthetic Owner stop/pause/shutdown and deadline cases are distinct. The actual two-minute limit remains; frequent long model turns can still time out.
2. **Read-location plus download deadline:** an early real read-only attempt aborted because both operations shared a 25-second timeout. The candidate now bounds the whole operation to 55 seconds, with a separate download cap of 25 seconds and the existing provider cap. Individual calls require at least 60 seconds remaining in the original turn before starting. The turn deadline is not extended. The original image succeeded after this fix.
3. **Opaque sandbox media:** a child sandbox could not load the parent's blob resource. Embed the already-validated local bytes in the sandbox document instead; keep scripts, forms, same-origin access and external resources disabled. Scroll the preview into view and provide a close action.
4. **Acceptance harness failures:** an invalid tiny PNG fixture; an offscreen canvas recorder that sometimes emitted only a WebM header; missing JSON-RPC request IDs; a capability getter lost by object spreading; duplicate fixture cleanup; and an early SQL seed column-count error. Fixed the fixtures/protocol/cleanup, not product security rules. Use a fixed, originally produced synthetic video for deterministic cross-language playback. Initial failures and retries remain in private engineering evidence.

## Limits and exclusions

- No new paid generation, external writes, reference uploads, voice cloning or P3–P6 work. No formal deployment, permission changes, identity/memory modifications or GitHub upload.
- Real video/music generation and codecs from every provider/model have not been verified. Container/MIME checks do not certify codec validity or media quality. Synthetic playback and an existing real image are the actual evidence.
- Asset bytes that the provider has permanently expired cannot be recovered by refreshing a signed URL. Fail clearly and preserve the original cost/history; never regenerate automatically.
- No independent human/native-language review, second physical Windows test, multi-day observation, provider refund/fault injection or exactly-once delivery guarantee.
- Formal data/session/configuration/history-prefix checks are private. Only sanitized summaries may accompany a future public release; raw logs, private paths, account IDs and signed URLs are excluded.

Use `npm test` and `npm run test:ui` on an isolated Windows installation with the documented dependencies. `npm run test:hedra-workflow` is a subset, not an additional total. Any future real paid verification needs a separate, specific Owner budget approval.
