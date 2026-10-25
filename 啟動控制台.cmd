@echo off
cd /d "%~dp0"
node scripts\development.mjs start
if errorlevel 1 pause
