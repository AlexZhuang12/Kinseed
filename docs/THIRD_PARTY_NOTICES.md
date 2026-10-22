# 第三方程式聲明與核對範圍

本頁記錄第三方程式的獨立聲明。Kinseed 原創程式及文件依 Owner 決定採 Apache-2.0，見根目錄 LICENSE；不改變本頁第三方各自授權。

## 鎖定的 npm 套件

| 套件 | 版本 | 套件標示授權 |
|---|---|---|
| ipaddr.js | 2.2.0 | MIT |
| playwright-core | 1.62.1 | Apache-2.0 |
| quickjs-emscripten | 0.32.0 | MIT |
| quickjs-emscripten-core | 0.32.0 | MIT |
| @jitl/quickjs-ffi-types | 0.32.0 | MIT |
| @jitl/quickjs-wasmfile-debug-asyncify | 0.32.0 | MIT |
| @jitl/quickjs-wasmfile-debug-sync | 0.32.0 | MIT |
| @jitl/quickjs-wasmfile-release-asyncify | 0.32.0 | MIT |
| @jitl/quickjs-wasmfile-release-sync | 0.32.0 | MIT |
| unpdf | 1.9.1 | MIT |

`third-party/` 保存這些固定已安裝套件內附 LICENSE／NOTICE 的來源校對副本，另保存 Playwright 三份內嵌第三方聲明。`third-party/inventory.json` 記錄來源與 SHA256。不要刪除上游套件內原有的聲明。

## 不能只看鎖檔的部分

- Playwright 有內嵌第三方程式，其清單與授權見 `playwright-core--utilsBundle.js.LICENSE.txt`、`playwright-core--serverRegistry.js.LICENSE.txt`、`playwright-core--webp_codec.LICENSE.txt` 及 NOTICE。npm audit 的十個鎖定套件數不涵蓋所有內嵌元件。
- unpdf 內含建置好的 PDF.js。本機程式內的版本標記為 `6.4.299`，與建置依賴 `~6.4.299` 對應。本次已另取得官方 `v6.4.299` 標籤的 LICENSE 與來源版權標頭，存於 `pdfjs-6.4.299-LICENSE.txt` 與 `pdfjs-6.4.299-source-header.txt`；該標籤根目錄 NOTICE 回應 404，未捏造聲明。PDF.js 使用 Apache-2.0（[對應版本原文](https://raw.githubusercontent.com/mozilla/pdf.js/v6.4.299/LICENSE)）。版本標記對應不等於已完成可重現建置與全部內嵌來源認證，不能以 unpdf 的 MIT 標示代替全部內容。
- QuickJS/WASM 的 npm 套件 MIT 標示與內附 LICENSE 已保留；正式散布依賴二進位前仍須核對底層引擎及其他內嵌內容的聲明。

這次來源 ZIP 不包含 node_modules、瀏覽器二進位、Codex、Ollama 或模型權重。未來若改成隨包散布這些檔案，必須新增對應的授權／聲明／來源審查，不能沿用「來源包已檢查」結論。

## 執行時另行取得的工具

Codex CLI 為使用者依設定自取的固定官方版本，遵守其上游授權與服務條款；模型帳號、商用資格及服務容量也由供應者規範。Ollama 程式與每個模型權重分別有自己的授權。Kinseed 的授權不授予這些第三方帳號、模型、商標或服務的使用權。

目前套件來源、隨附聲明及 PDF.js 對應標籤聲明已整理，不宣稱完整法律認證、可重現建置或所有內嵌元件均已完成獨立漏洞分析。正式公開前由AI再次核對散布範圍、來源及第三方聲明；獨立人類／法律審查未執行，不冒稱已取得法律認證。

## Build-time parser

Acorn 8.18.0 (MIT) is vendored only for deterministic localization builds. Its distributed ESM parser and LICENSE were obtained from the official npm package and verified against its published SHA-512. Upstream development dependencies and install scripts are not included. See [license](third-party/acorn-LICENSE.txt) and [source/hash provenance](third-party/acorn-provenance.json).

## Build-time simplified Chinese converter

OpenCC-JS 1.0.5 (MIT) supplies the offline Traditional-to-Simplified conversion for UI source strings only. No individual content is converted. The official npm package SHA-512 was verified; only its t2cn ESM build and license are distributed. See [license](third-party/opencc-js-LICENSE.txt) and [provenance](third-party/opencc-js-provenance.json). No install scripts or runtime network calls are used.

Git散布會規範文字換行；inventory.json的sha256保留原始上游複製位元，distributed_lf_sha256另記LF散布位元，不改授權條文。完整來源附件的manifest也記錄實際散布檔案SHA。
