# Independent film workflow — 1.9.0-film-preview.1

This is an independent Windows candidate. It does not deploy to an existing controller or grant permissions to existing individuals. Use this copy's own development entry. Formal private data and shared chat/model services are excluded.

## Six delivered engineering stages

1. Own-result reference continuity: integrates the earlier P3 candidate. Only the individual's own saved Hedra PNG/JPEG original assets can be referenced. Owner material upload, whole-account library access, URLs and host paths are excluded. A separate reference permission is required; original job/asset binding is checked before estimate and dispatch.
2. Inspection: typed `media_job` operations inspect actual streams, extract timed frames, extract WAV audio segments, draw waveforms and decode the full bounded media for technical QC. Images can reach a verified vision-capable brain through `media_image_view`; no raw video/audio model input is claimed.
3. Sound: separate `speech` and `sound_effects` permissions alongside existing music. `hedra_voices` requires a query and searches the shared library; private cloned-voice listing and cloning/conversion tools are not exposed. Speech uses named voice/language/speed; effects use bounded duration/loop/prompt influence. Same held/spent budget and unknown-submission safeguards apply. Real generation requires explicit test approval.
4. Editing: `media_timeline_save` stores the individual's own clip decisions and text; `media_job(render)` normalizes/trims clips, retains or mutes original audio, concatenates, mixes additional tracks with gain/fades and limiting, burns in explicit captions with bounded font size, band height and top/bottom placement, and produces H.264/AAC MP4.
5. Versioned project: immutable timelines bind exact source versions and SHA values. Each clip step is saved atomically. Changing captions can reuse unchanged clip recipes. Completed steps and originals are retained; no external generation is replayed. `media_retry` permits at most two explicit local continuations; queued/paused jobs require current life and permission. A restarted running step is interrupted, not silently replayed. Owner can cancel pending jobs.
6. Acceptance: full decode, streams/duration, black segments, silence events and volume are technical evidence. Frame-based review requires actual provided frames from the specified source. Individual review text and memory must be authored by the model; fixed harness assertions are identified separately. A technical pass does not establish artistic quality, lip sync or semantic listening.

## Bounds and permissions

Local `media` permission defaults off and is distinct from Hedra generation permissions. Frame/waveform delivery also requires vision. Speech/effects/reference flags default off; legacy settings preserve existing explicit flags rather than granting new ones. No new permission creates life authority, changes an individual's identity or increases a budget.

First supported workspace: at most 30 seconds, 1280×720, 8 clips, 8 added audio tracks and 40 captions. Each file is at most 8 MB; all historical hub objects retain the existing 20 MB aggregate limit. Total input to one WASM invocation is at most 12 MB. Larger or more complex projects may be rejected. Pending intermediate files count toward storage. No automatic deletion, quota increase or professional-quality guarantee is offered.

The local engine is the pinned, single-thread `@ffmpeg/core@0.12.10` WebAssembly program. Assets are SHA-checked. It runs inside Chromium's existing sandbox and a kill-on-close 768 MiB Windows process-tree Job. Only immutable engine assets can load; external requests, WebSockets and arbitrary host files are unavailable. No host FFmpeg executable, desktop control or model-supplied shell/filter command is exposed. One heavyweight local conversion runs at a time in this controller. A bounded step has a 20-second conversion ceiling; original life authorization is checked again before save. Closing/stop aborts only this controller's jobs and waits for settlement.

Unexpected recording failure blocks only this media subsystem and appears as `last_error`; it does not cancel daily life. Storage cannot be silently reclaimed from immutable history. Never handle an unknown paid submission as a safe local retry.

## Honest interpretation limits

Current Codex vision integration can receive extracted PNG frames. Sampling frames cannot establish every intermediate motion in a video. The current brain adapter has **no verified audio semantic-input path**: it can receive technical measurements and a waveform, while Owner can play actual files and segments. The system must not say it has listened to dialogue or judged musical emotion from those measurements. `media_review.audio_review` is limited to `not_reviewed` / `owner_needed`.

FFmpeg core's bundled ffprobe writes the requested JSON but may return -1. Inspection accepts only a successfully written, parsed, validated stream JSON; ordinary rendering still requires zero exit status and actual output bytes. FFmpeg decode must precede ffprobe in a shared invocation; QC additionally requires the completed decode footer and, where audio exists, real volume statistics. A successful metadata read is not a full decode pass. Missing/invalid probe output is a failure. The returned technical report separates warnings (black/silent segments, missing audio or stream-duration mismatch) from artistic choices; it does not automatically reject an intentional dark or silent scene. This is a documented core behavior, not permission to ignore arbitrary process failures.

## User flow

Owner: tools and materials → select individual → tool permissions → explicitly enable local media if desired. Hedra speech/effects/reference are separately saved in Hedra settings. Film workspace shows projects, local job progress/errors, saved media, isolated playback/download and the individual's review. Viewing never starts life or generation. Unsaved permissions remain drafts. Source media and versions remain visible.

Individual: list own media → inspect → choose sources → save timeline → enqueue render → continue other work or wait → inspect job status → request frames/audio segments/QC → receive frames → author review → save a changed timeline if needed → render and recheck. Job IDs and completed outputs are included compactly in subsequent context. The model chooses creative content; the system supplies operations and evidence.

## Dependencies and release boundary

`npm ci --ignore-scripts` obtains the pinned engine through the npm lockfile. New dependency has GPL-2.0-or-later terms, separate from original Kinseed Apache-2.0 sources. See THIRD_PARTY_NOTICES.md and third-party/ffmpeg-GPLv2.txt. No engine binary is embedded in the clean source ZIP. GPL terms and nested codec/source obligations must be reviewed before a future public/binary release; no legal certification or reproducible upstream-build proof is claimed.

No voice cloning, speech conversion, arbitrary Owner upload, desktop editor automation, new paid service, automatic publishing, formal deployment or new formal permission is part of this candidate. Real paid media generation, formal rollout and future public release are separate approval points.
