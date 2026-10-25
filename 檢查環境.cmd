@echo off
cd /d "%~dp0"
node scripts\development.mjs check
if errorlevel 1 pause
