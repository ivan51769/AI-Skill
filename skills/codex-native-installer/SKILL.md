---
name: codex-native-installer
description: Download and install or update the Windows Codex app from Microsoft Store package links using a local browser and Windows Add-AppxPackage.
---

# Codex Native Installer

This skill helps install or update the Windows Codex app when Microsoft Store or `winget` is unavailable.

It opens Microsoft Edge or Google Chrome with Puppeteer, submits the public Codex Microsoft Store URL to `store.rg-adguard.net`, downloads the largest matching Codex `.msixbundle` or `.msix` package, and installs it with Windows PowerShell `Add-AppxPackage`.

## Requirements

- Windows 10 or Windows 11
- Node.js
- Microsoft Edge or Google Chrome
- PowerShell with AppX deployment available
- Internet access

## Usage

From this skill directory:

```powershell
.\run.bat
```

Or run the script directly:

```powershell
cd scripts
npm install
node auto_install.js
```

## Notes

- A browser window is opened intentionally because `store.rg-adguard.net` may show a Cloudflare challenge. Complete any verification manually in the browser, then the script will continue.
- If Codex is already running, Windows may ask you to close it before the package can be updated.
- Downloaded package files are ignored by Git and are removed after a successful install.

