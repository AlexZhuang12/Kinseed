@echo off
cd /d "%~dp0"
node scripts\development.mjs open
if errorlevel 1 pause
