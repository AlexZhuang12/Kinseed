# Security policy

Kinseed is a Windows preview. Maintainers prioritize the latest preview; no fixed response or remediation deadline is promised. See [supported combinations](docs/COMPATIBILITY.md).

## Report privately

Use **GitHub private vulnerability reporting** at [Security Advisories](https://github.com/AlexZhuang12/Kinseed/security/advisories). For a public release, maintainers enable the private reporting feature and check the report form. Before sending, confirm that **Report a vulnerability** is available and the form is private. If unavailable, do not substitute a public issue or publish vulnerability details. The existence of this file alone does not prove that a reporting endpoint is active.

Include affected version, OS, minimal synthetic reproduction, expected/actual result and potential impact. Use a new test individual. Never attach actual identities, memories, owner conversations, database backups, account files, API keys, complete Owner links, model transcripts or unredacted logs. Remove private paths and identifiers.

## Boundaries

Owner authorization, individual isolation, stop/deadline checks, quotas and controlled execution remain enforced. A model's instructions, identity or web content do not grant permissions. Unknown cancellation is not confirmed termination; failures must not trigger blind replay of side effects. Local administrators are outside the isolation threat model. Dependencies, browsers and model providers have separate security boundaries.

Routine setup questions belong in [SUPPORT](SUPPORT.md), not vulnerability reports. No production credentials or real individuals are required for default tests or contributions. AI project self-acceptance is not an independent human security audit; unperformed reviews remain disclosed.
