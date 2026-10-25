# PDF headings, bounded page queue and text-reading acceptance

Independent version 1.7.2-document-preview.1. Formal data and existing artifacts are not migrated or regenerated. No new dependency or external service is used.

## New PDF creation

PDF paragraphs default to `text_format: markdown_headings`. Only standalone ATX heading lines (`# ` through `###### `) are converted to heading elements. Inline hashes and fenced literal blocks remain ordinary text. This is a heading subset, not a full Markdown renderer; raw HTML is escaped and cannot load resources or scripts. The separate title field is plain text. `text_format: plain` preserves literal heading markers. Word/Excel remain plain; requesting the PDF-only heading mode for them is explicitly rejected.

Headings avoid a page break immediately afterward; body paragraphs request at least three lines together around a page break. Existing text and its saved source input are not rewritten. Oversized content, long headings larger than a page, images, complex tables and professional typography remain bounded by Chromium's print pagination; no universal no-break guarantee is claimed. A new generated artifact uses the selected rules; existing PDFs retain their original bytes and hashes.

## Preview queue

Only PDF page conversion opts into a bounded FIFO queue. Heavyweight concurrency stays one; ordinary execution/conversion keeps its existing fail-fast protection. At most six requests may wait, for at most 15 seconds each, additionally bounded by the original lease's remaining time and conversion allowance. Rendering keeps its existing 10-second ceiling; MCP and life deadlines are not extended. Full or expired queues return a specific result, not fabricated page content.

Queued rendering rechecks document version/hash, identity/lease, required permissions and the current brain adapter before conversion and before delivery. Stop/cancellation removes a pending request without cancelling somebody else's running conversion. Active cancellation retains the slot until browser shutdown completes. An error releases the slot for the next job. Identical in-flight page requests coalesce only within the same individual, exact document source and access/lease scope. A bounded cache retains successful pages; owners and model leases do not share an in-flight authorization.

The Owner panel shows a waiting/rendering message. Closing or switching scope invalidates a late result, so it cannot reopen a closed preview or display another individual's page. Closing the display does not claim to cancel an already running read-only server conversion; that conversion still has its finite timeout and stop handling.

## read_document

Synthetic PDF, Word and Excel are created, saved and read from their actual stored bytes and source hashes. New PDF headings, literal mode, multiple text pages, final sentinels and unchanged artifacts are checked. PDF text extraction remains different from page viewing: layout whitespace and font Unicode mappings may differ (for example `面` versus `⾯`). The raw extracted text and existing notice are retained. Compatibility normalization is used only for test comparison; the tool does not silently normalize the returned text. Scanned image-only PDFs still do not imply text/OCR support.

## Acceptance boundary

AI tests cover boundary headings, escaped content, FIFO/finite queue, coalescing/cache, cancellation, expired lease, changed source version, revoked vision, Owner stop, cross-individual isolation and actual saved-file reading. Poppler rendering plus visual inspection and independent PDF text-position checks supplement runtime tests. No formal individual is used as a test; no real model/generation, account change or GitHub publication occurs. Rollback of this independent candidate means closing its own entry, not restoring an old formal database.
