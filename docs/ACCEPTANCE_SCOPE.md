# What each acceptance case actually proves

This inventory accompanies [AI acceptance policy](AI_ACCEPTANCE_POLICY.md). Results are in [version records](VALIDATION_INDEX.md). Tests are project self-acceptance executed by AI, not independent human certification. A pass applies to the named case and source, not every possible model or environment.

| Case | Actual procedure and expected behavior | Boundary |
| --- | --- | --- |
| V01 | Run every exported Node test. Includes identity compilation/source fidelity, review, budget, time, lifecycle, memory, owner messages, web guards, workspace execution, controller settlement and acceptance privacy. | Model/HTTP/clock fixtures are synthetic unless a test explicitly says otherwise. Private original native conditions are not included. |
| V02 | Check deterministic shared journal/control bundles and complete four-language builds. | Complete catalogs do not establish independent native-language review. |
| V03 | Four Chrome journeys through settings/review/approval/first birth, followed by setup and unsaved-language-switch cases. | New synthetic individuals, fixed clock and explicit fake-ready brain state. No model inference in this case. |
| V04 | Review source boundaries and secret shapes; verify zero reported problems, npm-private protection and no implied publication. | Pattern checks are not a proof that all secrets or vulnerabilities are absent. |
| V05 | Export a new source, install locked packages with scripts disabled, start an empty stopped platform, create an unborn synthetic individual in Asia/Tokyo, stop, make/verify a cold snapshot, reopen and verify preserved data. | Same physical machine; installation may need normal package downloads. No model download or inference. Compatible-source rollback is separately covered in V01's release tests; arbitrary migrations are not qualified. |
| V06 | Two real GPT-6.1-Sol life rounds through actual Codex CLI and Kinseed MCP. First saves a note and model-authored synthetic memory; next reads it, consults an independent model conversation, and commits. A separate real report-purpose call checks JSON text output. | Model-authored memory is not repaired by the harness. Report-format success is not independent semantic certification. This case does not load a shared local model. |
| V07 | A synthetic parent driver invokes actual MCP delegation. A real Codex child saves JavaScript, uses actual scoped MCP/WASM execution, and the harness reads hash-verified saved JSON to assert numeric sum=10. | Parent driver is synthetic; child Codex, MCP, workspace and execution are real. Prior real brain-to-delegation evidence is historical and is not misrepresented as rerun here. |
| V08 | Dedicated failure and cancellation regression fixtures exercise denied scopes, deadlines, retries, unknown settlement and no automatic replay. V01 also covers an actual owned synthetic controller process crash and interrupted-work recovery. | Injected faults are not spontaneous provider outages or proof of all failure modes. |
| V09 | Spawn a real delegated CLI, request stop in the owned synthetic fixture and verify local process/proxy settlement, worker release, no late success and no memory commit. | Remote result may remain unknown. The report does not claim the provider confirmed remote cancellation. |
| V10 | Reject unknown report fields, raw logs, transcripts, arbitrary paths, invented human claims, empty passes, inconsistent counts and arbitrary detailed-check names. | Raw evidence stays private. Evidence hashes are identifiers, not third-party signatures. |

## State and authority

Synthetic fixtures may directly seed specific states for isolated fault tests. Those seeds are not presented as model-authored memories or actual production births. Real-provider cases separately verify actual MCP receipts and model commits. AI operates only the newly-created test individuals. Existing identities, birth records, memories, histories, permissions and authorized hours are preserved.

First birth and approval remain independent Owner-authority actions in the product. The Owner authorized the AI to exercise them only in synthetic acceptance fixtures; a test does not grant authority over formal individuals.

The suite does not claim live validation of every external website, arbitrary third-party MCP, payment, publishing, private account access, Linux/macOS, every local model, another physical Windows or independent human use. Shared local-model inference is deliberately not performed. The clone's daily LLM report scheduler and archive-management control remain disabled; a tested disabled state is not a usable-feature claim.

## Reproduction

```powershell
npm ci --ignore-scripts --no-audit --no-fund
npm run acceptance:local -- --allow-install-network
# Explicit account-capacity opt-in, synthetic individuals only:
npm run acceptance:full
# Individual real-provider cases:
npm run acceptance:provider -- memory --allow-provider
npm run acceptance:provider -- delegation --allow-provider
npm run acceptance:provider -- cancel --allow-provider
```

Raw results are retained in this copy's `.private`. Published reports use fixed metadata and check identifiers only. Read the run's source digest and timestamps; a previous pass must not be silently treated as a new-version pass. Preserve failures and their correction records. Do not commit the private evidence directory.
