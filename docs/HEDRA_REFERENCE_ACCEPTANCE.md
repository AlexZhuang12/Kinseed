# AI-executed P3 own-reference acceptance

Candidate: 1.8.0-hedra-preview.1. Windows, Node 24.19.0, headless Chrome with sandbox enabled. Independent synthetic runtime; no formal rollout. Scope: own saved Hedra PNG/JPEG only. See HEDRA_OWN_REFERENCE_P3.md.

| Validation | Final result |
|---|---|
| Complete Node regression | 745 passed, 0 failed |
| Reference-specific tests | 17 passed; included in 745 |
| Complete four-language UI | 604 checks in 27 scripts passed |
| New reference UI | 15 per language; included in 604 |
| Translation/build consistency | 1979 messages; English/Japanese missing 0 |
| Independent entry | Own start/status/shutdown; empty/stopped, inference off, session removed |
| Source review | Boundary, pattern/dependency review and manifest/ZIP checks passed |

Tests cover explicit permission and default-off, drafts versus grants, exact own-source bindings, cross-individual refusal, source version changes, expired assets, dimensions and URL-only incompatibility, queued/final-read revocation, duplicate submission, ambiguous submission with retained hold, restart without replay, and actual local HTTP/MCP paths. Synthetic image/video/audio previews decode and play in an opaque sandbox. This is AI self-acceptance, not third-party certification.

The initial UI run read the preview frame before navigation completed. The harness now waits for actual frame content instead of a fixed short delay. A new schema test initially contained a syntax error; it was corrected and all 745 tests rerun. Independent-entry harness errors with Windows ESM paths and an absent development-status version field were corrected to file URLs and the actual page version. A leftover shutdown alias was changed to the candidate's own development stop command. Complete final runs passed; earlier failures remain in private evidence.

Public provider model schemas were inspected read-only. Reference generation, expiry and disconnect tests use a synthetic provider. No new real generation, reference upload or paid reference image/video acceptance occurred. No human, native-language or second-physical-Windows acceptance was performed. No provider exactly-once, refund, professional media quality or absence-of-all-vulnerabilities guarantee is made. Private account values, individual data and raw private logs must not be published.

## Resource compatibility revalidation

The common tool-resource correction was subsequently applied to this independent candidate: separate image/structured-data/model-text budgets, matching 4 MiB tool request envelopes, metadata-only paginated inventories, and tool-scoped resource failure handling. Complete Node revalidation passed 765 tests (including the 20 new shared tests and the existing 17 reference tests). The 604-check full UI run above belongs to the earlier P3 delivery; this correction separately reruns the 60 reference UI checks, while the matching common runtime's 544-check four-language regression is recorded in its own release evidence. These counts are not added into one new independent suite. No real new generation or upload is claimed.
