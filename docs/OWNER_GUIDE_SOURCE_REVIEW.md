# 操作說明來源核對

本次介面候選核對日：2026-10-25。這是操作說明來源審閱，不是重新執行OAuth或寄信。

Gmail說明另開頁面，依序說明Google Cloud專案、Gmail API、OAuth應用設定、桌面應用用戶端、Client ID與Client secret對應欄位，以及只寄送授權與逐封批准。密碼與郵件驗證碼不屬於這些欄位。

官方參考：

- [Gmail桌面應用快速入門](https://developers.google.com/workspace/gmail/api/quickstart/python)：專案、API與桌面用戶端流程。範例自身所用scope不能直接照抄；Kinseed保留`gmail.send`。
- [Gmail OAuth範圍](https://developers.google.com/workspace/gmail/api/auth/scopes)：核對`gmail.send`用途，不加入讀取既有信箱權限。
- [Google Auth Platform設定](https://support.google.com/cloud/answer/15549945?hl=en)：應用與授權設定背景。
- [Google Cloud Console](https://console.cloud.google.com/)：使用者自行選擇其專用專案；說明不填入任何私人專案ID或憑證。

說明頁為靜態內容，使用固定路徑白名單、無表單或可執行腳本、無Owner token、無帳號密鑰與個體內容。連結另開頁面，不把控制台網址中的憑證帶入參考網站。繁簡英日均提供；未經母語審閱，Google介面名稱將來可能變動。
