@echo off
chcp 65001 >nul
title Codex Native Installer

cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing dependencies...
    cmd.exe /c "npm install"
)

node auto_install.js
pause

