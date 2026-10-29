# App-server readiness candidate — R1–R4

Identifier: `app-server-readiness-20261029.1`. Independent engineering source only. Production stays on exec; no native CLI, login, real inference, shared-service actions or GitHub work are authorized by this iteration.

## Different bounds for different stages

The default preparation policy has separate initialize/account/thread bounds of 10 seconds and a turn acknowledgement bound of 5 seconds. A complete preparation has a 20-second bound. Each phase also uses the shorter remaining parent deadline. Explicit legacy `rpcTimeout` injection remains available to existing protocol tests. Bounds must be finite integers up to 30 seconds. These are candidate engineering values, not measured native guarantees.

The model/life deadline, 1-second process cleanup, 1.5-second settlement grace, scoped tools, pinned model/CLI, thread count, pool size and Owner authority remain unchanged. An unacknowledged attempted turn is still unknown unless its actual termination is known; it never becomes a safe pre-turn retry merely because no acknowledgement arrived.

## Prepare the host that will actually work

Production-shaped life scheduling has an optional preparation hook before the original global-worker and life-cycle reservation. It runs only for a due, authorized individual. It initializes that individual's managed host, checks the account on that host in native mode, and creates an empty ephemeral thread with the same tool definitions. No identity, memory, life prompt, model turn, tool execution or external paid work is sent during preparation.

The prepared thread can be consumed once by the immediate life turn in the same owner/purpose/PID. It contains no prior model conversation. Every later turn still gets a fresh thread; prepared threads count toward the original thread cap. Idle retirement, account failure, changed authority/tool definitions, expiry or shutdown invalidate preparation. Other owners cannot consume or silently evict a still-reserved prepared slot.

The scheduler rechecks Owner/global stop, settings version, scheduled wake, window and quota after awaiting preparation. A failed preparation does not charge a life/model cycle, acquire a worker or cancel daily consent. Retries are bounded to three attempts for the current authorization/control version, with 30/60-second waits; no automatic controller restart exists. A new controller or explicit changed authority starts a new in-process preparation series. This is host readiness, not a refund or change to the established accounting rule. Once an original life/model attempt is reserved, its existing accounting is retained.

Reports and consultations continue to use their original reservations; their newly acquired host initializes and checks its own account before creating a fresh work thread. They do not receive life tools or share life threads. Account-only preflight status is explicitly separate from host phase/prepared state and model-work evidence. It does not claim that a disposed preflight child warmed the later worker.

## Late events and evidence

RPC metadata records method, generated request ID, phase, start/completion/timeout/abort, elapsed time and bounded wait, without request parameters or private response text. Up to 512 retired request metadata records identify late RPC responses. Late thread notifications are evidence only and cannot authorize a turn. Errors from remote RPCs retain the method and numeric code, not arbitrary echoed text. Evidence-write failure blocks preparation/model submission.

Before any attempt to submit `turn/start`, confirmed process exit and no turn attempt allow a locally attested `not_submitted` result. After a turn attempt, unknown handling remains conservative. Original receipts and dispatch intents remain append-only; cached results cannot dispatch another turn. No automatic adapter fallback or unknown clearing is added.

## Preservation and acceptance

`scripts/preservation-check.mjs` checks process registrations as append/close bookkeeping and memory as an immutable old B prefix plus the original MCP commit and latest A projection. It rejects unrecorded memory rewrites, missing history and restoring a backup over newer memory. It never changes a record to make a comparison pass.

`node scripts/acceptance-app-server-readiness.mjs` runs synthetic readiness, preservation, existing app-server integration and formal-shaped source/switch/rollback tests, then source/locales checks. `npm test`, the original UI suite and the production-status four-language UI verifier are separate overlapping layers. Historical source-recovery cases need the retained private integration source fixture; the new source snapshot alone does not bundle that history.

Before any formal cutover, native zero-turn checks on this pinned CLI and the chosen account need separate Owner approval. Any additional real model work needs its own explicit new budget; the fourteen prior qualification submissions remain exhausted. Passing synthetic slow-host tests is not permission to switch production and is not proof of native cold latency, provider capacity, RAM or speed.
