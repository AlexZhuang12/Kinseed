# Tool resource policy: bounded normal operations

Version 1.7.1-resource-preview.1. Transport bytes are not LLM tokens, life quota, network quota or paid-service credits. No identity, memory, prompt or tool authority is changed by these limits.

| Boundary | Allowance and reason |
|---|---|
| Text reading: web/document/workspace/record | Existing 6000 characters per page; identity pages 12000. Pagination remains the way to read more. UTF-8 Chinese pages have explicit room in transport. |
| Own image or Hedra image to model | Existing 200000 raw bytes. No permission or format expansion. Base64 overhead and repeated CLI events have room. |
| PDF page image to model | Existing 1500000 raw bytes, width 1100 / 4 million pixels. This is approximately 2 MB base64, not a 256 KiB text reply. |
| Tool request | 4 MiB UTF-8 for enabled hub/workbench, enough for normal long document creation; excessive input is refused before execution, no silent truncation. |
| Tool inventory | hub_list defaults to 50 metadata-only items, up to 100, with next_offset; large stored source text is not copied into inventory. |
| One structured tool result | 2 MiB UTF-8 metadata/text. Larger results return an explicit result-only refusal and known saved receipt; no silent truncation or replay of writes/payment. |
| Model-authored prose | 256 KiB per life turn; separate from tool payloads. Reports/consults retain 512 KiB. This is a host safety ceiling, not a requested writing length. |
| JSON event line | 8 MiB maximum, bounded before parsing, including unterminated lines. |
| Tool-text events per turn | 24 MiB, includes duplicate CLI observations. Normal paged reads and 32000-character execution outputs fit. |
| Encoded image events per turn | 64 MiB; accepts 16 maximum permitted page images including ordinary duplicate event overhead. The original 16-tool-call ceiling remains. |
| Raw stdout+stderr per turn | 96 MiB absolute fail-safe; independently classifies local overload. This permits valid multimodal work, not unlimited data. |
| Diagnostic stderr | 256 KiB total; individual lines 64 KiB. This does not consume model prose allowance. |
| Artifacts/downloads/execution | Existing 8 MB file, 20 MB tool storage, network budgets, 256 KB projects, 5-second isolated execution, 32000-character outputs, Job/WASM limits and no arbitrary host shell remain unchanged. |
| Life and external operations | Original two-minute turn, original window/end, cycle usage, provider prices/Owner reserve and exact paid submission ledger remain unchanged. |

The stream reader bounds memory before JSON parsing. Evidence copies replace image bytes with a hash/encoded length; the actual image delivered to the model is unchanged. Small malformed streams and forbidden tools remain security failures. Reasoning is not retained. General raw limits cannot prove which tool caused an overrun; unattributed failures hold the necessary brain execution, with daily authority retained.

Known tool-specific local resource failures preserve completed operations, isolate the affected tool and schedule other authorized work once locally settled, within the original time/quota. They are not classified as unknown supplier failures, and do not replay a paid submission. Owner stop always wins. Explicit Owner resume starts a new finite recovery episode, preserves original unfinished receipts and does not refund used cycles. Read-only diagnostic indices retain the latest eight, with full immutable events kept; unresolved write receipts are not evicted.

Acceptance must cover original-size and maximum-size images through actual MCP result normalization and the CLI adapter, chunked UTF-8, duplicate tool events, malformed/overlong streams, model prose limits, tool-scoped recovery, Owner stop and unknown writes. No human or second physical Windows verification is implied.
