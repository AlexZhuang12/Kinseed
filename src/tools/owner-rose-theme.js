/* Visual revision 02. Presentation only: no requests, storage, permission or life actions. */
(()=>{
 const style=document.createElement('style');style.id='kinseed-rose-theme';
 style.textContent=`
 :root{--ink:#3d2c3a;--muted:#71616e;--line:#eadde5;--accent:#9f2c62;--rose:#9f2c62;--rose-soft:#fcf0f6;--rose-dark:#6d2d4c;--focus:#79356e}
 body{color:var(--ink);background:radial-gradient(ellipse at 90% 0%,#fae5ee 0,transparent 42%),#faf7f9;font-family:'Segoe UI','Microsoft JhengHei','Yu Gothic UI',system-ui,sans-serif;font-size:15px;line-height:1.75;-webkit-font-smoothing:antialiased}
 header{position:relative;padding:34px max(32px,calc((100vw - 1376px)/2));background:linear-gradient(120deg,#f6dce8,#fcecf3 56%,#fbf5f8);color:#512b42;border-bottom:1px solid #e8cddc;overflow:hidden}
 header h1{font-size:34px;font-weight:750;letter-spacing:-1.1px;display:flex;align-items:center;flex-wrap:wrap;gap:12px;line-height:1.35}
 header h1:before{content:'';display:inline-block;width:21px;height:28px;flex:none;border-radius:3px 18px 3px 18px;background:linear-gradient(145deg,#9f2c62,#d67ba3);transform:rotate(-18deg);box-shadow:5px 4px 0 #eed0df}
 header h1 small{font:600 11px/1.5 'Segoe UI',system-ui,sans-serif;letter-spacing:.3px;color:#79445f!important;background:#ffffffad;border:1px solid #e7c8d8;border-radius:30px;padding:5px 11px}
 header>div{font-size:13px;color:#795c6f;margin-top:9px;letter-spacing:.4px}
 #kinseed-language{background:#fcf6fa!important;color:#866479!important;font-size:12px}#kinseed-language-select{min-height:34px;font-size:12px;border-color:#e5d2df;background:white} main{max-width:1440px;padding:28px 32px 64px}
 h2{font-size:28px;line-height:1.4;font-weight:750;letter-spacing:-.55px;color:#472a3d;margin:0 0 12px}
 h3{font-size:20px;line-height:1.5;font-weight:700;letter-spacing:-.2px;color:#512e43}
 h4{font-size:16px;font-weight:700;color:#593d50}
 p{line-height:1.8}small,.lead{color:var(--muted)}a{color:#923b69;text-underline-offset:4px;text-decoration-thickness:1px}
 button{min-height:44px;border:1px solid #dfcbd7;border-radius:10px;background:#fff;color:#624257;font-size:14px;font-weight:600;padding:10px 16px;box-shadow:0 1px 2px #63244705;transition:background .15s,border-color .15s,box-shadow .15s,transform .15s}
 button:hover:not(:disabled){background:#fbedf4;border-color:#c896af;box-shadow:0 3px 8px #723c5810}
 button:active:not(:disabled){transform:translateY(1px)}
 button.primary,button.hub-primary,#page-tool-hub button.hub-primary{background:linear-gradient(110deg,#9f2c62,#a8386d)!important;border-color:#9f2c62!important;color:#fff!important;font-weight:700;box-shadow:0 4px 10px #9f2c6220}
 button.primary:hover:not(:disabled),#page-tool-hub button.hub-primary:hover:not(:disabled){background:#87204f!important;box-shadow:0 5px 14px #9f2c6230}
 button.danger{background:#9d383f;color:white;border-color:#9d383f;box-shadow:none}
 button.danger:hover:not(:disabled){background:#822c32;border-color:#822c32}
 button:disabled{opacity:1;background:#f0ebee!important;border-color:#e7dfe4!important;color:#9c8f99!important;box-shadow:none!important;cursor:not-allowed}
 input,select,textarea{color:#45333f;background:#fffdfe;border-color:#d9c6d2;border-radius:9px;min-height:44px;font-size:15px;box-shadow:inset 0 1px 2px #4d263407}
 input::placeholder,textarea::placeholder{color:#91808b}input[type=checkbox],input[type=radio],progress{accent-color:var(--rose)}input[type=checkbox],input[type=radio]{min-height:0}
 button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,a:focus-visible,summary:focus-visible,#page-tool-hub :is(input,select,button,a):focus-visible{outline:3px solid var(--focus);outline-offset:3px}
 section{border-color:var(--line);border-radius:18px;box-shadow:0 5px 24px #61314a04;padding:28px}section section{box-shadow:none}
 pre{background:#f7f3f6;color:#624e5d;font:13px/1.8 ui-monospace,'Cascadia Code',Consolas,monospace;border:1px solid #eee3e9;border-radius:10px}
 details{background:#fcfafc;border-color:#eadfe7;border-radius:10px;padding:13px 16px}
 summary{font-size:13px;color:#75626f;font-weight:600}summary::marker{color:#a96083}
 fieldset{border-color:#eadde5}legend{color:#643e55}
 #message{position:relative;top:auto;background:#f8f1f6;color:#735568;border-color:#e9d7e3;font-size:13px;border-radius:10px;padding:10px 15px;margin-bottom:18px;box-shadow:none}
 #message[data-error=true]{background:#fff0ef;border-color:#ecc1bc;color:#9b383e}
 #globalPanel{background:#ffffffb8;border:1px solid #eee3e9;box-shadow:none;padding:14px 20px;margin-bottom:26px}
 #globalPanel h2{font-size:13px;letter-spacing:.3px;color:#79616f;margin:0 0 3px}
 #globalPanel #global{font-size:13px;color:#786a74}#globalPanel button{font-size:12px;min-height:36px;padding:6px 12px}
 #shell{grid-template-columns:196px minmax(0,1fr);gap:30px}
 #nav{gap:4px;background:#ffffffa3;border:1px solid #eddee7;border-radius:16px;padding:10px 8px;box-shadow:0 8px 25px #69344d04}
 #nav button{position:relative;border-radius:9px;padding:11px 14px;color:#7a6271;font-size:14px;font-weight:550;min-height:44px;box-shadow:none;line-height:1.5}
 #nav button:hover{background:#f9edf3;color:#7c3457}
 #nav button[aria-current=page]{background:#f5dfe9;color:#822a54;font-weight:750}
 #nav button[aria-current=page]:before{content:'';position:absolute;left:1px;top:12px;bottom:12px;width:3px;border-radius:3px;background:#a43669}
 #nav details{background:transparent;border:0;margin:4px 0;padding:0 6px}#nav summary{font-size:12px;padding:8px 4px;color:#8a7381}
 #context{border-left-color:#bd7195;background:#faf0f5}.card{border-color:var(--line);border-radius:16px}.card .state{color:#80556e}.badge,.pill{background:#f6e8f0;color:#824563}.steps{background:#fcf0f6}
 #page-tool-hub{--hub-ink:#542e44;--hub-muted:#75616e;--hub-line:#eadce5;--hub-soft:#fbf2f7;padding:30px;border-color:#eadbe4;background:#fff;box-shadow:0 8px 36px #71314f05}
 #page-tool-hub>h2{font-size:29px;margin:0 0 7px;letter-spacing:-.6px}
 #page-tool-hub .hub-subtitle{color:#816b79;font-size:14px;margin:0 0 24px;max-width:65ch}
 .hub-context{background:linear-gradient(110deg,#fcecf4,#fdf7fa);border:1px solid #efd7e5;padding:16px 20px;gap:16px;border-radius:13px}
 .hub-context label{font-size:12px;font-weight:700;letter-spacing:.3px;color:#935b78;gap:7px}
 .hub-context select{background:#fff;border-color:#ddbdcf;font-size:16px;font-weight:650;color:#5d304b;min-height:46px;padding:9px 13px;box-shadow:0 1px 4px #71314f08}
 .hub-context>button{background:#fff7fb;color:#8a5370;border-color:#e4cbd9;font-size:12px;box-shadow:none;min-height:42px}
 .hub-navigation{gap:7px 14px;padding:22px 0 18px;margin-bottom:24px;border-bottom:1px solid #efdfE8}
 .hub-nav-group{gap:3px}.hub-nav-group>span{font-size:10px;letter-spacing:.5px;font-weight:700;color:#947b8a;padding:0 6px 0 0}
 .hub-navigation button{font-size:13px;font-weight:600;padding:8px 11px;min-height:39px;border-radius:8px;color:#765366;background:transparent;box-shadow:none;border:1px solid transparent}
 .hub-navigation button:hover{background:#f9edf4;border-color:#f1dae6}
 .hub-navigation button[aria-selected=true]{background:#71324f;color:#fff;border-color:#71324f;box-shadow:0 2px 7px #71324f18}
 .hub-card{border:1px solid #eadde5;background:#fff;border-radius:16px;padding:25px;margin:18px 0;box-shadow:0 3px 14px #71314f03}
 .hub-card>h3{font-size:20px;margin:6px 0 9px;color:#522f44;line-height:1.5}
 .hub-card>p:not(.hub-step-tag):not(.hub-status){color:#7a6674;font-size:14px;margin:8px 0 18px;line-height:1.85}
 .hub-step-tag{display:inline-flex;align-items:center;width:fit-content;max-width:100%;border:1px solid #f0d5e4;background:#fcf0f6;color:#9b4a73;font-size:11px;font-weight:700;letter-spacing:.25px;border-radius:6px;line-height:1.65;padding:3px 8px;margin:0 0 5px}
 #toolHub-overview>h3{font-size:23px;margin:0 0 6px}#toolHub-overview>p{font-size:14px;color:#806b78;margin:6px 0 20px}
 #toolHub-overview .hub-flow-grid{gap:18px;margin-top:20px;counter-reset:flow}
 .hub-flow-card{position:relative;background:linear-gradient(140deg,#fff,#fdf7fb);border-color:#eedce7;box-shadow:none;padding:24px 23px;display:flex;flex-direction:column;align-items:flex-start;min-height:240px}
 #toolHub-overview .hub-flow-card>.hub-step-tag{width:34px;height:34px;justify-content:center;background:#f2d9e6;border:0;border-radius:10px;font-size:13px;letter-spacing:.5px;color:#914069;padding:0;margin-bottom:14px}
 .hub-flow-card>h3{font-size:20px!important;margin:0 0 6px!important}.hub-flow-card>p:not(.hub-step-tag){margin:0 0 20px!important;font-size:14px!important}
 .hub-flow-card>button{margin:auto 0 0;background:#fff;color:#973f6b;border-color:#e6bfd3;font-size:13px;padding:8px 13px;min-height:40px;box-shadow:none}
 .hub-flow-card>button:after{content:' →';display:inline-block;margin-left:8px;color:#b7608a}
 .hub-outcome{margin-top:22px;gap:7px 22px;padding-top:18px;border-top:1px dashed #e9d9e3}
 .hub-outcome a{padding:0;background:none;border:0;border-radius:0;font-size:12px;text-decoration:underline;color:#90657e}
 .hub-help{font-size:12px;font-weight:600;color:#9c4775;line-height:1.7;text-decoration:underline;text-decoration-color:#d7a0bc;text-underline-offset:4px}
 .hub-help:hover{color:#71324f;text-decoration-color:#71324f}
 .hub-card details{background:#faf7fa;border:1px solid #eee2ea;padding:12px 15px;margin-top:17px}
 .hub-card summary{font-size:12px;line-height:1.7;color:#816a79;font-weight:600}
 .hub-field{font-size:12px;color:#8a5f78;gap:7px!important;margin:20px 0!important;font-weight:650}
 .hub-field input,.hub-field select,.hub-field textarea{color:#4b3544;font-weight:500;padding:10px 13px;font-size:15px;border-color:#dac5d2}
 .hub-field input[type=number]{font-variant-numeric:tabular-nums;font-weight:650;font-size:18px;letter-spacing:.4px}
 .hub-actions{gap:10px;border-top:1px solid #eee2e9;padding-top:18px;margin-top:22px}
 .hub-actions button{margin:0}.hub-secondary,#page-tool-hub button.hub-secondary{color:#836b7a!important;background:#fff!important;border-color:#e6dce2!important;font-size:13px;font-weight:500;box-shadow:none}
 #page-tool-hub button.hub-utility{background:#f7f3fa;border-color:#dfd4e9;color:#6c527f;box-shadow:none;font-size:13px;font-weight:600}
 #page-tool-hub button.hub-demo{background:#fff8ed;border:1px dashed #d9b885;color:#89663d;font-size:12px;font-weight:500;box-shadow:none}
 .hub-choice{background:#fff;border-color:#e8dde5;border-radius:11px;padding:15px!important;gap:11px!important;align-items:flex-start;transition:background .15s,border-color .15s}
 .hub-choice:hover{background:#fef9fc;border-color:#dab5c9}
 .hub-choice:has(input:checked){background:#fcf1f7;border-color:#d69bb9;box-shadow:inset 3px 0 0 #bc608c}
 .hub-choice:has(input:focus-visible){outline:2px solid #b77399;outline-offset:2px}
 .hub-choice input[type=checkbox]{accent-color:#a33268;width:18px!important;height:18px!important;margin-top:3px!important;border-radius:5px;flex:0 0 18px!important;min-height:0}
 .hub-choice-copy{font-size:14px;font-weight:650;color:#5d4053;line-height:1.65}
 .hub-choice-copy small{color:#806e7b;font-size:12px;line-height:1.7;font-weight:400;margin-top:6px}
 .hub-choice-copy>span{display:inline-block;font-size:10px;font-weight:500;line-height:1.65;color:#8e6c80;background:#f2e6ee;border-radius:4px;padding:1px 5px;margin-left:5px;vertical-align:middle}
 #toolHub-permissions{counter-reset:capability-group}.hub-permission-grid{gap:0 18px}
 fieldset.hub-permission-grid{background:#fdfafd;border:1px solid #f0e3eb;border-radius:14px;padding:17px;margin:15px 0;counter-increment:capability-group}
 .hub-permission-grid legend{font-size:15px;font-weight:750;padding:0 8px;color:#633a53}
 .hub-permission-grid legend:before{content:'0' counter(capability-group);font:700 10px/1 'Segoe UI',sans-serif;display:inline-block;padding:6px;margin-right:7px;color:#ac6689;background:#f6e4ee;border-radius:5px;vertical-align:middle}
 .hub-status{border:1px solid #eaddE5;border-left:3px solid #c27b9f;background:#fbf5f9;color:#7a526b;border-radius:9px;padding:13px 16px;font-size:13px;line-height:1.8}
 #hubPermissionSaved,#hedraSavedState,#hedraConnectionSavedState{padding:12px 15px;background:#f5f8f6;border:1px solid #dfe9e2;color:#506c5d;border-radius:9px;font-size:12px;line-height:1.85}
 #hubPermissionDraft,#hedraReserveDraftState,#hedraConnectionDraftState{font-size:12px;color:#8d7684;margin:10px 0}
 #toolHub-permissions:has(#hubPermissionSave:not(:disabled)) #hubPermissionDraft{background:#fff7e8;border:1px solid #e8d0a4;color:#8a632d;padding:10px 13px;border-radius:8px}
 #hubPermissionBlocker{font-size:12px;color:#7d6a78}#hubPermissionError:not(:empty){background:#fff1ef;border:1px solid #edc8c3;color:#9a3c42;padding:13px;border-radius:9px}
 #toolHubNotice{font-size:13px;color:#8c5472;min-height:0;margin:10px 0 0}#toolHubNotice:empty{display:none}
 .hub-preview-banner{background:#fff8eb;border:1px dashed #dfc89c;border-radius:10px;padding:11px 14px;color:#826b45;font-size:11px;line-height:1.7;margin:0 0 25px}
 .hub-checklist{color:#765e6f;font-size:13px;line-height:1.9;padding-left:23px}.hub-checklist li{padding-left:4px;margin:9px 0}.hub-checklist li::marker{color:#ae5c85;font-weight:700}
 .hub-summary-list{grid-template-columns:120px minmax(0,1fr);gap:11px 16px;background:#fcf6fa;border-radius:10px;padding:17px;font-size:13px}.hub-summary-list dt{color:#926a82;font-size:12px}.hub-summary-list dd{color:#5f3c54;overflow-wrap:anywhere}
 .hub-subnav{gap:10px}.hub-subnav button{background:#fcf5f9;color:#965b7b;border-color:#ead5e1;font-size:12px}
 #hubCloudUnavailable{background:#faf8fa;border-style:dashed;box-shadow:none}#hubCloudUnavailable>h3{color:#87717f}#hubCloudUnavailable input:disabled{background:#efebee;color:#9b8a96}
 #hedraCatalogResult:not(:empty){background:#f7f4f9;border-color:#e7dfed;font-size:12px}
 @media(prefers-reduced-motion:reduce){*,*:before,*:after{transition:none!important;animation:none!important;scroll-behavior:auto!important}}
 @media(max-width:1000px){#shell{grid-template-columns:165px minmax(0,1fr);gap:20px}main{padding:24px}#page-tool-hub{padding:24px}.hub-context{gap:12px}.hub-navigation{gap:9px}.hub-nav-group>span{font-size:10px}.hub-navigation button{padding:8px 10px}}
 @media(max-width:780px){body{font-size:14px}header{padding:25px 20px}header h1{font-size:29px;gap:10px}header h1 small{font-size:10px}header>div{font-size:12px}main{padding:18px 14px 42px}#shell{display:block}#nav{position:static;display:flex;padding:7px;gap:3px;overflow-x:auto;border-radius:12px;margin-bottom:18px}#nav>*{flex:0 0 auto}#nav details{white-space:nowrap;min-width:max-content}#nav summary{white-space:nowrap}#nav button{font-size:12px;padding:10px 12px;white-space:nowrap}#nav button[aria-current=page]:before{display:none}section{padding:20px;border-radius:14px}#page-tool-hub{padding:20px}#page-tool-hub>h2{font-size:25px}.hub-context{padding:15px;grid-template-columns:1fr;gap:12px}.hub-context>button{justify-self:start}.hub-card{padding:20px;border-radius:13px}.hub-card>h3{font-size:18px}.hub-navigation{padding:19px 0 15px;gap:12px}.hub-nav-group{width:100%}.hub-navigation button{font-size:12px}.hub-preview-banner{font-size:11px;padding:10px 12px}.hub-flow-card{min-height:215px}.hub-actions button{width:100%;max-width:100%;min-height:46px}.hub-field input[type=number]{font-size:17px}.hub-outcome{gap:12px}.hub-summary-list{grid-template-columns:1fr}.hub-summary-list dd{margin-bottom:9px}#globalPanel{padding:12px 15px}#globalPanel button{min-height:36px}#message{font-size:12px}.hub-permission-grid{grid-template-columns:1fr}}
 @media(max-width:430px){#page-tool-hub{padding:17px}.hub-card{padding:17px}.hub-choice{padding:13px!important}.hub-choice-copy{font-size:13px}.hub-context select{font-size:15px}.hub-step-tag{font-size:10px}.hub-card>p:not(.hub-step-tag):not(.hub-status){font-size:13px}}
 /* Group names are headings above their own controls, never inline hint-like labels. */
 #page-tool-hub .hub-navigation{display:grid;grid-template-columns:minmax(140px,.9fr) minmax(200px,1.4fr) minmax(200px,1.4fr) minmax(145px,1fr);gap:12px;padding:20px 0 22px;margin-bottom:24px;align-items:stretch}
 #page-tool-hub .hub-nav-group{display:flex;flex-direction:column;align-items:stretch;gap:0;width:auto;min-width:0;padding:12px;background:#fcf9fb;border:1px solid #eee1e9;border-radius:11px}
 #page-tool-hub .hub-nav-heading{display:block;font-size:12px;line-height:1.5;font-weight:700;letter-spacing:.25px;color:#8b637a;margin:0 0 9px;padding:0 2px 8px;border-bottom:1px solid #eddee7;cursor:default}
 #page-tool-hub .hub-nav-items{display:flex;flex-wrap:wrap;align-content:flex-start;gap:5px;min-width:0}
 #page-tool-hub .hub-nav-items button{font-size:12px;padding:8px 10px;min-height:39px;margin:0;max-width:100%;white-space:normal;text-align:left;line-height:1.5}
 #page-tool-hub .hub-nav-group:has(button[aria-selected=true]){background:#fdf3f9;border-color:#d9afc6}
 #page-tool-hub .hub-nav-group:has(button[aria-selected=true]) .hub-nav-heading{color:#803a5f;border-bottom-color:#e5bfd4}
 @media(max-width:1200px){#page-tool-hub .hub-navigation{grid-template-columns:repeat(2,minmax(0,1fr))}}
 @media(max-width:580px){#page-tool-hub .hub-navigation{grid-template-columns:1fr;gap:10px;padding:16px 0 20px}#page-tool-hub .hub-nav-group{padding:12px 13px}#page-tool-hub .hub-nav-heading{font-size:12px;margin-bottom:8px;padding-bottom:7px}#page-tool-hub .hub-nav-items{gap:6px}#page-tool-hub .hub-nav-items button{min-height:42px}}
 
 `;
 document.head.append(style);document.documentElement.dataset.visualRevision='rose-02';
})();
