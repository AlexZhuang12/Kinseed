# Security policy

Kinseed is currently a Windows preview. Maintainers prioritize the latest preview; no fixed response or remediation deadline is promised. See [supported combinations](docs/COMPATIBILITY.md).

## Report privately

The selected channel is **GitHub private vulnerability reporting**, to be enabled when this project is published. This local source package has no published repository or active reporting endpoint. Do not post vulnerability details in a public issue. Once enabled, open this repository's **Security → Report a vulnerability** and confirm that the form is private before sending. If the button is unavailable, do not substitute a public issue; the release must provide an active private channel before claiming reporting is ready.

Include affected version, operating system, minimum synthetic reproduction, expected/actual result and potential impact. Use a new test individual. Never attach actual identities, memories, owner conversations, database backups, account files, API keys, complete Owner links, model transcripts or unredacted logs. Remove private paths and identifiers.

## Boundaries

Owner authorization, individual isolation, stop/deadline checks, quotas and controlled workspace execution must remain enforced. A model's instructions, identity or web content do not grant permissions. Unknown cancellation is not confirmed termination; failures must not trigger blind replay of side effects. Local administrators are outside the isolation threat model. Dependencies, browsers and model providers have separate security boundaries.

Routine setup/use questions belong in the issue/support process, not vulnerability reports. No production credentials or real individuals are required for a contribution or default test run. Publication and enabling a reporting channel require the project owner's authorization.
