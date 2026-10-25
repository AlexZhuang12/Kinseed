# P3: reuse an individual's own saved Hedra images

Independent candidate version 1.8.0-hedra-preview.1. P0–P2 remain supported. This document supersedes their text-only statement only for the own-result scope below. Nothing in this document grants permissions or authorizes paid generation.

## Scope

`hedra_references` lists only the current individual's saved `hedra-media` PNG/JPEG objects. `hedra_quote.references` accepts one to four `{source_id, role}` entries: `reference_image` for images; `reference_image`, `start_image` or `end_image` for video if the chosen model supports that input. Existing explicit duration, model schema, estimate, live balance, Owner reserve, cumulative and single-item limits still apply. No reference inputs for music.

An original completed job must belong to this individual and the selected workspace. The saved bytes must match their hash. The original provider asset is reused; there is no upload route, private account-wide library listing, arbitrary URL, filesystem path, Owner material or another individual's source. A local saved image alone does not prove that the provider still retains the original asset.

## Explicit permission

The new `reference_images` setting defaults false for old and new individuals. Image/video permission alone does not grant it. Owner must save it separately in the Hedra panel, alongside the existing media rights and budgets. Old clients which omit the new field preserve its actual value. Drafts, server-saved state and version conflicts remain distinct. `hedra_references` reports whether the new permission is enabled.

## Safety and failure handling

Quotes bind the exact source object/version/hash, own original job, original asset and workspace. Validate model-supported asset input, item count, actual dimensions, aspect ratio and file size. Required URL-only image inputs are not advertised as compatible. There is no automatic resize, substitute source, prompt completion or replacement generation.

Recheck source and permission when submitting, dequeuing and just before the paid call. Check original remote job and asset availability. Expiry, removal, incompatible dimensions or revoked rights block that new job and release its unsubmitted hold. Earlier charges, source media and life authorization remain intact. An ambiguous paid submission retains its hold and original intent for investigation; duplicate submission cannot create another attempt. Restart preserves this state. This prevents local replay; it cannot promise provider exactly-once execution or refunds.

## Acceptance boundary

AI-executed tests use synthetic individuals and a synthetic Hedra transport for reference quotes, generation attempts, expiry, revocation, cross-individual isolation, schema constraints, ambiguous submission and restart. Actual local HTTP/MCP paths and four-language Chrome UI are exercised. Public model specifications were inspected read-only, without generating or uploading. No actual paid reference image/video generation has been verified. No human/native-language/second-physical-Windows acceptance is claimed.

## Deferred

Explicit Owner material consent and upload transport, other media input formats, speech/effects, editing workflows and complete paid short-film acceptance are later stages. Broad P3 is not complete: this candidate implements the own-result reference subset only. Keep this copy independent and stop it through its own entry; rollback means closing this candidate and preserving its private ledger, not overwriting any formal database.
