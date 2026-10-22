# Acceptance diagnosis and correction record

## Initial run: ai-20261022-mvjkua0n-da7a6c49

The initial public report is retained unchanged. V01–V08 and V10 passed their executed assertions. V09 was recorded as BLOCKED despite all ten cancellation checks passing.

AI diagnosis of the retained synthetic evidence found:

- Actual delegated status was `cancelled` with `local_exit_confirmed=true`.
- The stop was `OWNER_OR_CONTROL_STOP` in the synthetic fixture.
- `remote_result=unknown` remained honest: local cancellation does not confirm remote provider cancellation.
- The provider classifier returned `{kind:unknown}` for the deliberately interrupted stream.
- The acceptance script mistakenly treated any provider-failure object as provider unavailability, including this expected unknown result.

The defect was in **acceptance-result classification**, not the controller's cancellation guard. No production controller, identity, memory or permission was changed to obtain a pass.

## Repair

Added `acceptanceProviderReason` and AV09–AV10 regression checks. A requested cancellation with confirmed local termination is judged by the cancellation assertions. Actual capacity/authentication/quota/transient/timeout failures still block provider completion. Unconfirmed local settlement remains blocked. No remote cancellation success is invented.

Schema 2 adds fixed-name boolean check details and timestamps to public reports. AV11–AV12 reject arbitrary check names and mismatched counts. The schema-1 initial report remains historical evidence. Later run records identify their own source hashes and actual results; a corrected pass never erases the original record.

Raw model logs and local paths are not copied into this document. Reproduce with the published test sources and explicitly opted-in provider suite. These are AI-executed project tests, not independent human certification.

## Product regression coverage audit

A second AI audit found that the independently exported test set did not carry the full set of relevant earlier product regressions. Existing passing counts described that set, not complete legacy-product coverage. The public suite now includes synthetic cases for identity compilation/review, budget, authorization expiry, controller recovery, owner messaging, memory capacity, public-network guards, reading, temporary life and isolated work execution.

The private original-56-clauses content test is not exported: real native conditions must not become test data. Synthetic identity/source fidelity tests remain, and private immutable-source preservation is checked separately without publishing the clauses. Legacy startup modes and the disabled daily report service are not qualified by these additions.

Initial portable-regression execution: 230/232 passed. Two test-porting issues were retained and repaired: the owned crash-worker fixture was missing; and an old archive-management marker assertion did not match the clone's explicitly disabled archive stub. The latter now asserts the candidate's disabled state, not the unavailable feature. The targeted repair run passed 46/46. No life or permission guard was removed.

Public-source scanning also rejected a literal synthetic Windows user-path example. The fixture now constructs the same runtime string in pieces; the outbound rejection assertion is unchanged and the privacy scanner was not relaxed. Owned temporary fixtures are confined to `.private/product-fixtures`; recursive cleanup verifies ownership and containment first.

The real delegation case was strengthened to read back the hash-verified saved JSON and assert numeric `sum=10`, beyond checking execution completion. The AI does not write or repair the model's output to satisfy this assertion. Later full runs document the final actual result and tested source separately.
