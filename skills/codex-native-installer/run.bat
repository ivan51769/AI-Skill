@echo off
chcp 65001 >nul
title Codex Native Installer

cd /d "%~dp0"

echo [1/3] Checking dependencies...
if not exist "scripts\node_modules" (
    echo Installing dependencies...
    cd scripts
    cmd.exe /c "npm install"
    cd ..
)

echo [2/3] Running installer...
node scripts\auto_install.js

echo [3/3] Done.
pause

