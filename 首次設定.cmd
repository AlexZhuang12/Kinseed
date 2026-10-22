@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo 請先從 https://nodejs.org/ 安裝含 npm 的 Node.js 24，再重新執行本檔。
 pause
 exit /b 1
)
node -e "const v=process.versions.node.split('.').map(Number);process.exit(v[0]===24 && v[1]>=19 ? 0 : 1)"
if errorlevel 1 (
 echo 這份預覽版需要 Node.js 24.19 以上的 24 系列版本，請從 https://nodejs.org/ 安裝後再試。
 pause
 exit /b 1
)
node scripts\setup.mjs %*
if errorlevel 1 pause
