# Acceptance for 1.6.1-preview.1

## Publication-candidate local run

AI-executed full Node regression: **705 passed, 0 failed**, on the clean Windows publication candidate. The application baseline was independently exercised with 144 four-language Hedra browser assertions, 20 read-only deployed UI assertions and six same-database upgrade/source-rollback/re-upgrade assertions. Those application-baseline checks are historical evidence, not an additional run on each publication commit.

The new release source includes the full four-language browser suite plus the public-web scope regression. The required hosted gate runs locked install with scripts disabled, the full Node suite, source boundary/release checks, generated UI consistency, all browser journeys and source export. **The exact hosted commit, run ID and outcome are recorded in the Release's ACCEPTANCE.md and VERIFICATION.json assets.** A source document does not assume future CI success.

The core application source is aligned to local 1.6.1. Public launcher/bootstrap, version suffix and documentation are adapted for a fresh independent install, never the existing private runtime. The two small test-runner improvements (dynamic UI command count and private-only web-scope evidence output) do not change runtime permissions or life behavior.

## Provider and human evidence

Historical real Hedra image and document/model integration checks are described in HEDRA_AI_ACCEPTANCE.md and generated-document documentation. No private provider call or paid generation occurs in hosted CI or this publication validation. No private credentials, individuals or raw life/model logs are distributed.

Acceptance is performed by AI. No independent human, native-language, second physical Windows or multi-day provider acceptance was performed. Full autonomous-life qualification of the tested small local model remains incomplete. This is a preview, not a claim of universal model or arbitrary MCP support.
