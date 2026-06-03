# Codex Native Installer Usage Guide

## When to Use This

Some Windows computers disable Windows Update, Microsoft Store updates, `winget`, or related update services because of company policy, system hardening, manual optimization, or controlled deployment requirements.

In that situation, Codex may run into problems such as:

- Codex cannot be updated from Microsoft Store
- `winget upgrade` cannot find or download the update
- Codex stays on an old version
- Microsoft Store is disabled, blocked, unavailable, or its update button does nothing

This skill bypasses the Microsoft Store client update flow. It fetches the official Codex package download link from Microsoft Store package metadata, then installs or updates Codex through Windows native `Add-AppxPackage`.

## How It Works

The script performs these steps:

1. Launch Microsoft Edge or Google Chrome locally.
2. Open `store.rg-adguard.net`.
3. Submit the public Codex Microsoft Store page URL.
4. Select the largest matching Codex `.msixbundle` or `.msix` package from the result list.
5. Download the official package into the `scripts` directory.
6. Run PowerShell `Add-AppxPackage` for native Windows installation.
7. Delete the temporary package file after a successful install.

## Requirements

- Windows 10 or Windows 11
- Node.js
- Microsoft Edge or Google Chrome
- PowerShell
- Windows AppX deployment services
- Internet access

## Quick Start

From the skill directory, double-click:

```powershell
run.bat
```

Or run it from PowerShell:

```powershell
cd skills\codex-native-installer
.\run.bat
```

On the first run, if dependencies are missing, the script will automatically run:

```powershell
npm install
```

## Manual Script Run

You can also run the script directly:

```powershell
cd skills\codex-native-installer\scripts
npm install
node auto_install.js
```

## Cloudflare Verification

`store.rg-adguard.net` may show a Cloudflare human verification page.

The script intentionally opens a real browser window. If you see a prompt such as "verify you are human", complete it manually in the browser. After verification passes, the script will continue waiting and parse the package links automatically.

## If Codex Is Already Running

During installation, you may see an error similar to:

```text
0x80073D02: The package cannot be installed because resources it modifies are currently in use.
```

This means Codex is currently running, so Windows cannot replace the app files.

Fix:

1. Close all Codex windows.
2. Open Task Manager and end remaining `Codex` or `codex` processes.
3. Run `run.bat` again.

## Troubleshooting

### 1. Package cannot be opened, error `0x80073CF0`

Possible causes:

- The package download is incomplete
- The package file is still being held by another process
- AppX deployment services are not working correctly

Suggested fixes:

- Delete `scripts\codex_setup.msix` or `scripts\codex_setup.msixbundle`
- Run the script again
- Restart the computer and retry if needed

### 2. Missing AppX or Msixvc support service

This may mean the system has removed or disabled Windows deployment services.

Try this in an Administrator PowerShell:

```powershell
net start AppXSvc
net start ClipSVC
```

If AppX deployment is fully disabled by system policy, restore the related Windows components first.

### 3. Browser cannot be started

The script checks these default browser paths:

```text
C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
C:\Program Files\Google\Chrome\Application\chrome.exe
```

If your browser is installed elsewhere, edit the browser path in `scripts\auto_install.js`.

### 4. Download is slow or fails

This is usually caused by Microsoft download nodes, proxy settings, or local network conditions. Run the script again to fetch a fresh package link.

## Security Notes

- The tool downloads the official Codex package distributed through Microsoft Store.
- It does not submit local accounts, tokens, cookies, or Codex session data.
- `node_modules`, downloaded `.msix/.msixbundle` files, and logs are excluded by `.gitignore`.
- If you want to audit it first, read `scripts\auto_install.js` before running it.

## Recommended Update Flow

1. Close Codex first.
2. Run `run.bat`.
3. Complete Cloudflare verification if prompted.
4. Wait for download and installation to finish.
5. Reopen Codex.
