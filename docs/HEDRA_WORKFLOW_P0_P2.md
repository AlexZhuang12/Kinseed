# Hedra workflow P0–P2 candidate

Version: 1.7.0-hedra-preview.1. Independent candidate only. This is not a formal deployment or a permission grant.

## Supported tools

| Official MCP capability | Kinseed support in this candidate |
|---|---|
| list_models, get_model | `hedra_models`, `hedra_model`: public catalog and bounded input specifications. A catalog entry is not a promise of adapter compatibility. `unsupported_required`, `input_compatible`, `generation_tool`, and `estimate_required` describe the boundary. |
| estimate | Existing `hedra_quote`. It does not generate; an actual successful quote remains necessary. |
| generate_image, generate_video, generate_music | Existing durable submission/credit ledger. Text inputs only; image/video aspect and resolution, video/music explicit duration, selected quality. Existing permissions and limits still apply. |
| get_generations | Only jobs already bound to this individual's ledger. Remote success, charge settlement and local saving are separate facts. |
| Original output download | `hedra_save`: no arbitrary URL or remote job ID supplied by a model. Re-resolve the original asset URL before each explicit attempt. Never regenerate to repair a failed download. |
| Saved image to model | `hedra_view`: own PNG/JPEG, at most 200 KB, existing vision permission and supported Codex image input. Providing bytes is not proof of understanding. |
| Saved media to Owner | Authenticated local download; image, video and music previews in an opaque sandbox with no scripts, forms, parent access or remote resources. |
| generate_speech, generate_sound_effects, list_voices | Not included. The existing audio permission means music only; a public audio catalog may contain unsupported speech/effects models. |
| prepare_upload, upload_file, show_file_upload_widget | Not included. No references or Owner materials uploaded. |
| clone_voice, convert_speech, isolate_audio, upscale, remove_video_background | Not included. |
| query_assets | Not included: no private account-wide library listing. |
| set_workspace, set_billing_mode | Not exposed. The current workspace is checked, not changed. |
| get_balance, list_workspaces | Existing connection inspection only, not unrestricted account administration. |

The observed official MCP inventory contained 23 tools. Catalog and schema data are external, untrusted information, never identity instructions or additional authority. New providers/models can change availability. Missing or incompatible fields are refused; the system does not invent a model ID or complete a prompt for the individual.

## P0 diagnosis and cancellation

The existing controller supplied a concrete cancellation reason, but both brain adapters discarded task cancellation arguments and wrote `OWNER_OR_CONTROL_STOP`. The watchdog and adapter timer could race, so identical deadlines received different labels. This candidate forwards the original reason. A missing reason becomes `CONTROL_CANCEL_UNSPECIFIED`, never a guessed Owner stop.

This corrects attribution. It does **not** claim to eliminate actual two-minute timeouts. The existing turn deadline, tool/time limits, bounded retries, durable daily consent, Owner stops, identities, prompts and memories are unchanged. Existing recovery receipts remain operation facts, not model-authored memory. Long remote generation continues to be polled by the durable Hedra job manager after a model turn or life window ends; new submissions still require current authority. Unknown paid submissions are not retried.

## Saving and previewing

An explicit `hedra_save` or Owner save action checks the individual's completed ledger job and original output index. The current workspace and original asset metadata must match. The signed URL stays inside the provider/download boundary and is neither placed in model context nor written to work/event metadata.

Position lookup and download have separate bounded waits (55 seconds total, 25 seconds for the download). An individual must have at least 60 seconds left in its existing turn to start; no turn extension is granted. Downloads use the existing public HTTPS broker: DNS pinning, private-address refusal, every redirect checked, active allowlist/public mode respected, current external-web permission and network accounting enforced. They use the smaller of the existing network single-file limit, 8 MB tool-file cap, and remaining tool storage. The existing 20 MB versioned tool storage includes base64 overhead. No extra download capacity or disk quota is granted.

Only a complete, bounded response with matching provider MIME, HTTP MIME, and recognized container signature can become an immutable artifact. Supported containers: PNG/JPEG/WebP, MP4/WebM, MP3/WAV/WebM audio. Header/container checks are not a complete codec validation; actual browser decoding/playback is a separate result. Unsupported formats are refused rather than served as HTML/SVG. The preview sandbox is not relaxed to make media work.

An artifact records SHA-256, byte count, MIME, local version, model, original local/remote job and asset IDs, output index and retrieval time. A successful repeat returns the existing artifact. Concurrent saves share one download. Received bytes remain charged on failure. An explicit retry re-resolves the original job; expired asset bytes may be permanently unavailable, in which case the original work/cost record remains and no new job is generated.

Controller close aborts downloads and waits for their failure records before closing databases. A crash cannot expose an incomplete artifact because saving is one database transaction. Restart does not automatically download or generate. Already-saved artifacts remain readable without redownloading.

## Owner operation

Open the independent candidate, then **Tools and materials → select synthetic individual → Hedra media tools**. Catalog/specification queries do not generate. A completed work offers **Save original result**, then **View or play saved result** and **Download saved result**. Viewing does not start life or grant permissions. Music is labeled explicitly.

Use this candidate's `npm start`, `npm open`, `npm status`, `npm stop`; these run the isolated development entry and its own `.private/development`, with dynamic loopback port and inference/reports disabled by default. Do not use formal workspace commands or copy private runtime/OAuth data into the candidate. Stop only this candidate to roll back; retain its ledger and artifacts. Formal deployment needs separate Owner authorization.

## Acceptance disclosure

AI executes synthetic failure, isolation, lifecycle and four-language browser acceptance. Existing approved paid test output may be queried/downloaded without a new generation; it is not a new paid end-to-end test. Synthetic video/audio playback is not proof that every Hedra model codec, duration, failure or refund has been tested. No additional paid generation, provider fault injection, independent human/native-language review or second physical Windows validation is implied.
