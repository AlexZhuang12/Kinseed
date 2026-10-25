# Local audio transcription and understanding

Independent candidate 1.10.0-hearing-preview.1. Production deployment and production permissions are not included. No model is bundled, downloaded or started automatically. Model installation, real inference speed, memory and semantic accuracy remain unverified until the Owner chooses and approves an installation.

## Capabilities and setup

The existing Codex brain keeps its identity and memory. It can request an additional audio tool. Enable both `media` and the separate `hearing` permission, then configure each individual's independent local service in Tools and materials → Audio understanding and comparison. Defaults are disabled. The URL must use literal `http://127.0.0.1:<port>`; no shared Ollama/chat/controller ports, credentials, paths, remote hosts or redirects. Existing source/version/SHA/identity and life checks remain required.

`whisper.cpp` calls only POST `/inference` with bounded multipart WAV, `language=auto`, `response_format=json`, temperature 0 and no initial prompt. It does not call `/load`, install software, or supply the screenplay as an expected answer. Returned text has whole-clip timing only and does not establish emotion, music or sound-event understanding. The Owner-supplied model label is not proof of the running model's identity.

`kinseed-audio-v1` is a replaceable local analysis protocol, not a bundled trained model. A future verified local model wrapper must implement POST `/analyze`, receive one or two actual WAV buffers and return the validated report below. There is no cloud fallback. A local service may itself use the network; Owner must inspect it before enabling. A compatible mock validates transport only, never model accuracy.

## Work and approval

The individual uses `audio_analysis_request` with operation `transcribe`, `analyze` or `compare`, one or two explicit source versions, `in_ms`, `out_ms` and a question. Sources must already belong to this individual as stored audio/video artifacts. Source files are unchanged. Each clip is at most 30 seconds, converted using the existing isolated FFmpeg/WASM to 16 kHz mono PCM WAV, at most 1 MB. There is one queued audio worker, no simultaneous local media worker, a 45-second total deadline and at least 2 GiB available system memory before work. Local model memory/CPU isolation must be validated separately when installing the chosen service; this adapter does not manage that process or promise its resource limit.

Owner reviews exact source hashes, ranges, operation, question and local destination. Approval covers that one immutable request and disclosure of its report to the current brain. Changing identity, permission version or destination invalidates the request. Owner approvals do not extend life. Work waits within normal authorized life. Preparing/sending are durably distinguished. Owner stop cancels own work; no automatic recovery of life. Technical failure does not cancel daily authority.

Unknown or invalid results after submission cannot be resubmitted by retry or a new request ID for identical content. Before-send failures can be explicitly reapproved at most twice after the first approval. Restart converts approved/preparing to `not_sent` and sending to `unknown_or_invalid`; there is no silent replay. Service errors contain no raw response or credentials in public events. Stored reports are untrusted observations, never tool instructions or automatic memory updates.

An aborted HTTP request does not prove that the local inference process stopped. An unknown request therefore holds new analysis for the same endpoint across this installation's individuals. Other tools and daily life remain available. The Owner may explicitly confirm that the local service has finished, which changes the original request to `unknown_resolved` and clears this tool hold without retrying it or certifying its result. Requests from other applications are outside this installation's lock; this is not an exclusive service reservation.

## Analysis protocol

Request JSON: `schema=kinseed-audio-v1`, model label, operation, question, clips with labels A/B, duration, SHA and `audio_wav_base64`. The wrapper must independently verify its actual loaded model and limits. Response JSON:

```
{"transcript":[],"observations":[],"comparison":null,"uncertain":true}
```

Each transcript/observation row has only `clip`, `start_ms`, `end_ms`, `text`, and `certainty` (`observed`, `tentative`, `unclear`). Times are relative to the supplied clip, not necessarily exact. Empty uncertain results are valid. Comparison is allowed only for two clips. Output is limited to 64 KB and bounded text/row counts; malformed output is not repaired or invented. Reports record provider provenance, model label and timing precision. `media_review` may use `analysis_consulted` only with completed analysis IDs bound to this exact source. It means the individual consulted a tool report; it does not assert direct audio perception, human listening or artistic certification.

## Accuracy acceptance still required

Use withheld reference clips: same words/different delivery, conflicting screenplay, graded music masking, silence/noise/unintelligible speech and A/B edits. Do not send reference answers into the service. Measure word/character errors, time localization, event/tone distinction, uncertainty and A/B consistency separately. Repeat cases and preserve misses. Synthetic HTTP fixtures prove the interface and safety boundaries, not these semantic abilities. No human, native-language or second-machine acceptance is claimed.

References: https://github.com/ggml-org/whisper.cpp/tree/master/examples/server and https://github.com/ggml-org/whisper.cpp#memory-usage . New provider models must retain their own licenses; none are redistributed here.
