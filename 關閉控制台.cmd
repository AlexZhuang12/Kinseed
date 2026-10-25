@echo off
cd /d "%~dp0"
node scripts\development.mjs stop
if errorlevel 1 pause
