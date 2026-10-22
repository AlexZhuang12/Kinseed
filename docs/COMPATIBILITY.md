# Supported and tested combinations

Status is scoped to source candidates. Local same-machine validation is not a second physical computer test. No untested model or arbitrary third-party MCP is supported by implication.

| Component | Verified scope | Limits |
| --- | --- | --- |
| OS | Windows x64 on the development computer | A separate clean physical Windows machine remains pending; Linux/macOS/ARM are not qualified |
| Node.js | 24.19.0; loader accepts later 24.x | Other major versions rejected; not all later minor versions individually tested |
| Dependencies | Exact package-lock versions; install scripts disabled | Known-vulnerability queries are time-specific, not a guarantee of no unknown vulnerabilities |
| Codex CLI brain | 0.163.0-alpha.10.2, own existing ChatGPT login, gpt-6.1-sol/low | Real life/MCP/memory and failure evidence exists; provider capacity can fail; no silent fallback |
| Ollama interface | Local loopback protocol; synthetic mechanism and real local-model trials | Connection/metadata checks do not prove full life-task ability or cancellation of a shared server |
| Qwen3 1.7B Q4_K_M | Real isolated synthetic-material trials | Full autonomous-life task compatibility did not pass; do not recommend as equivalent to the qualified Codex brain |
| Controlled MCP | Kinseed-scoped tools, per-individual workspace and explicit Codex delegation | Not arbitrary MCP configuration, unrestricted shell, account, payment or publishing access |
| UI languages | Traditional Chinese baseline; additional language acceptance tracked separately | Check the release language report; source catalogs alone do not establish review or usability |
| Daily reports | Brain report-purpose contract exists | Independent clone entry does not enable the original platform's daily report scheduler |

Mechanism, provider, quality and UX evidence must be reported separately. Default CI uses no real providers or private credentials. Release notes must identify the source version used by each test. See [model acceptance standard](MODEL_ADAPTER_STANDARD.md) and [engineering plan](OPEN_SOURCE_ENGINEERING_PLAN.md).
