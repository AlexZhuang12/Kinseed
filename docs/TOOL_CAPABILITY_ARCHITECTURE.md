# Tool capability preview architecture

Version 1.4.0-tool-preview.1; independent Windows candidate only.

Owner auth/Host/Origin checks → ToolHub owner routes → per-individual append-only hub_objects and scoped state. The existing controller alone owns life grants, leases, worker fencing, stop, quota and memory commits. Model MCP exposes 13 new bounded tools; it exposes no Owner approval, permission change, credential or send endpoint.

Material copies are consent-bound to bytes/hash and brain adapter/model/endpoint; model listing and reading exclude unconsented material. Public API JSON snapshots live in the existing per-individual network document store. Project and document source inputs, hashes, execution receipts and revisions remain separate from A memory; no secondary model rewrites A or B.

Execution: QuickJS/WASM for own CommonJS files; Pyodide browser WASM for own Python files, all network blocked after immutable engine/package loading. Runtime-served WASM memory maximum changes to4096 pages (256MiB); installed upstream bytes remain unchanged. Windows Job tracks only the process tree launched by the wrapper, kill-on-close, 768MiB; one heavy local job admitted at a time. This is not a defense against a compromised host/kernel/Chrome; Windows only, no sandbox downgrade on failure.

Owner interactive preview: untrusted HTML parsed in bounded isolated browser with scripts/network denied; sanitize into allowlisted inert DOM; Owner iframe has allow-same-origin without allow-scripts. User JS executes solely in QuickJS against a bounded mock DOM and click history, returns plain-text updates. No unrestricted browser API, navigation, network or raw HTML mutation through JS.

OCR and document parsing use trusted helpers in bounded Windows Jobs; input data is not executed as host code. DOCX/XLSX zip expansion capped; image dimensions capped. This resource control does not turn the trusted parser itself into an untrusted-code sandbox. Python user programs run in WASM, never in those Node helpers.

Async jobs persist intent and receipt before execution. Completion rechecks life; errors preserve failed/interrupted status. Unknown mail sends/installations are not replayed across restart. Gmail credentials stay outside MCP, send scope only, exact Owner approval bound to target, body, attachment revisions, identity and permission version. One specifically approved synthetic message completed real OAuth/send and Owner recipient confirmation; no reusable send approval or credentials are distributed. Cloud remains unconnected.

No new paid service, arbitrary MCP server, host file access, host terminal, cross-individual cooperation, formal deployment or new formal permission is enabled. Existing Codex delegation retains its original separate controls.
