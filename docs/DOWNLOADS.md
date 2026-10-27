# Download Kinseed / 下載入口

**[Download the newest published Windows preview / 最新已發布的 Windows 預覽版](https://github.com/AlexZhuang12/Kinseed/releases)**

1. Choose the newest published pre-release, not a draft. For releases under this policy, open Assets and download **Kinseed-Windows-source.zip**. Earlier releases may use a versioned ZIP filename; their original assets are retained.
2. Download **SHA256SUMS.txt**, **VERIFICATION.json**, **SOURCE_FILES_SHA256.json** and **ACCEPTANCE.md** from that same tag. Verify the ZIP with PowerShell `Get-FileHash -Algorithm SHA256` against the checksum. `VERIFICATION.json` identifies the exact source SHA, version and CI run. Do not mix attachments from different releases.
3. Extract to a new directory, install the documented Node 24.19.x runtime, then open the included first-setup CMD. Follow [installation](PUBLIC_INSTALL_1_14.md) and the [four-language user guides](../README.md). Your private data starts empty; your own logins and tool permissions are configured separately.
4. Existing installation: read [upgrade/recovery](UPGRADE_RECOVERY.md), settle work and create/verify a backup first. Publishing a new version does not automatically upgrade your controller or restore stopped activity.

This is a **source package**, not an all-in-one executable. It does not include model weights, credentials, private individuals, dependencies, account subscriptions or permission grants. The setup downloads only the tools you explicitly prepare.

## Development source

Developers may clone `https://github.com/AlexZhuang12/Kinseed.git` or use main's Code ZIP. Main can contain unreleased changes and is **not** the recommended fixed-version download. To reproduce a published version, use its tag or commit, not the moving main branch.

GitHub's `/releases/latest` excludes pre-releases. While Kinseed is preview-only, use the Releases list above and each release's exact tag link. No stable release is implied.

繁中：一般安裝請從上方 Releases 選最新已發布預覽，下載同一版的來源ZIP與校驗資料；main的Code ZIP屬於開發來源，可能較新但尚未發行。解壓後仍需Node與首次設定，不含模型或私人資料。不要以舊資料庫覆蓋現有生活歷史。

简中：普通安装请从上方 Releases 选择最新已发布预览，下载同一版本的来源ZIP与校验资料。main是开发来源；发布不会自动升级本地控制器。

日本語：通常の導入は上記 Releases の最新の公開プレビューを選び、同じタグのソースZIPと検証ファイルを取得してください。mainは開発用です。公開だけでローカル環境が自動更新されることはありません。
