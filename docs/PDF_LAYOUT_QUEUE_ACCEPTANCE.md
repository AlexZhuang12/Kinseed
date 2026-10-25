# PDF layout and preview queue: AI acceptance

Candidate: **1.7.2-document-preview.1**. Independent synthetic environment; not deployed to an existing installation.

- Full Node suite: **763 passed, 0 failed**.
- Four-language browser suite: **23 scripts / 552 checks passed**.
- Independent empty entry: **8 checks passed**, brain disabled, stopped, own process exited and session removed.
- Five page-boundary fixtures: all heading/body pairs stay on the same page after the fix. Two previously separated pairs now move together. Source text is compared after declared heading-marker removal and layout whitespace normalization.
- PDF, Word and Excel are read back from stored bytes with source hashes; PDF long-text pagination reaches the final sentinel. Raw PDF text may contain font mapping variants or layout whitespace. This remains explicitly disclosed.
- Queue tests cover three actual pages, FIFO, six-waiter capacity, timeout, stop, revoked permission, expired lease, changed document version, in-flight coalescing and cache. No increase in active conversion concurrency, life window or tool permission.
- AI visual inspection covers two heading-boundary pages and one literal-marker page, rendered with Poppler. No observed clipping/overlap in those samples.

Initial targeted testing exposed a PDF font mapping difference (`面` / `⾯`). The comparison was corrected to apply Unicode compatibility normalization **only in test assertions**; raw returned tool text and its warning were retained. The original failed run was preserved. A supplemental sandbox invocation stalled; its own session was stopped and the same diagnostic succeeded under normal Windows user execution. No sandbox protection was relaxed in the product.

No real model generation, paid media generation, email, new package download, private data migration or GitHub upload was used. No human, native-language reviewer or second physical Windows machine acceptance is claimed. Complex/oversized page content remains subject to the print renderer's documented pagination limits. See PDF_LAYOUT_QUEUE.md for behavior and limits.
