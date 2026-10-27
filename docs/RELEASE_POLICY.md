# Release policy / 固定版本發布制度

Kinseed currently ships **Windows previews**, not a stable production promise. GitHub does not require one universal release procedure; this project uses tags, releases, exact CI provenance and immutable assets to make each delivery reviewable.

## Channels and version numbers

- `main` is development source and may be ahead of the newest published release. A push is not a release and does not update a user's local controller.
- Public preview: `MAJOR.MINOR.PATCH-preview.N`, tag `v` plus the exact package version, GitHub `prerelease=true`. Stable releases use `MAJOR.MINOR.PATCH` and require a separate Owner decision, scope and compatibility statement.
- Package, lockfile, ZIP contents, tag, verification document and release channel must agree. User-visible feature additions increment minor; compatible fixes increment patch; breaking installation/data/contract changes require a major decision. An unshipped preview revision can increment `preview.N`.
- Never move/reuse a published tag or replace its assets. Fixes get a new version. Old mutable releases remain historical; do not rewrite them as newly immutable or claim they were retested.

## Continuous execution

1. Review clean source only. Keep private data, runtime, logins, transcripts, weights and raw evidence outside the repository and release.
2. Each main push runs Windows locked installation, Node tests, source/boundary checks, four-language build, browser journeys and source export. Failure produces no ready draft. PRs cannot run the write-enabled draft job.
3. That exact CI commit builds one source ZIP with its lockfile and five fixed assets. The ZIP is read back against its manifest, and Git blob hashes bind every distributed source file to the actual commit. Raw acceptance logs are not assets.
4. After verification, the least-privilege draft job prepares or updates only its managed **unpublished** draft. Stale main runs skip; already-published versions are never overwritten. Bump the version for the next delivery. Unexpected Owner-created drafts or assets are not deleted automatically.
5. Owner reviews the draft tag, **full source SHA**, scope and attachments. Only an explicit repository-Owner-triggered publish action may publish; passing CI alone is not publication authorization.
6. Publishing downloads and verifies the actual draft assets again, checks source blobs, successful main-push CI, tag SHA and immutability, then publishes once. A published/unknown outcome is inspected, not blindly repeated.
7. Verify anonymously after publication: tag resolution, version, attachment SHA256, archive manifest and download instructions. An invalid release is disclosed and superseded by a new version; immutable attachments are not silently repaired.

The draft already stores assets persistently. Workflow artifacts are temporary (30 days) and are not the public download channel. An Owner may leave a draft unpublished indefinitely. Every new public release still requires Owner authorization.

## Owner publishing operation

Use GitHub Actions → **Owner publish verified release** → Run workflow on main. Enter the exact draft tag, the full source SHA from `VERIFICATION.json`, and `PUBLISH`. This publishes the already-reviewed bytes; it does not rebuild them. Local maintainers can use the same `release-github.mjs publish` gate after explicit Owner authorization.

Release notes must describe changes since the previous published release, supported OS/Node/CLI, setup and upgrades, known limitations, exact CI source and AI acceptance. Human/native-language/second-machine checks not performed remain `NOT_RUN`; no model or paid-service test is invented. AI acceptance is project self-acceptance, not independent certification.

## Downloads and upgrades

Use [the download guide](DOWNLOADS.md). The current preview channel uses the Releases list and exact tag links. GitHub's `releases/latest` API is for full releases, excludes drafts/prereleases, and is not a substitute for the preview channel. Never remove the pre-release flag merely to make a latest URL work.

`Kinseed-Windows-source.zip` contains source, not an EXE installer, Node, model weights, dependencies or account logins. Initial setup installs locked dependencies; model/tool preparation and account permissions remain opt-in. Upgrade the user's own installation only after its work settles, backup and verification. Retain its current private data; rollback source only, never overwrite new history with an old database or restore Owner-stopped life without authorization.

## References

- [GitHub release management](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Immutable releases: draft → attach all assets → publish](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases)
- [Release links](https://docs.github.com/en/repositories/releasing-projects-on-github/linking-to-releases)
- [Releases API](https://docs.github.com/en/rest/releases/releases)

繁中：main供開發；一般使用者從已發布的預覽版下載。驗收通過只自動建立草稿，Owner每次核對特定SHA與附件後才發布。發布後不換附件、不移標籤，修正另發新版。不能將預覽版假裝穩定版，也不能把來源發布當作替使用者更新控制器或恢復生活的授權。

Publishing workflow checks the repository Owner actor. If additional maintainers are granted repository write access in the future, review GitHub environment/reviewer and repository role protections before delegating publishing; workflow checks do not remove permissions granted directly through GitHub roles.
