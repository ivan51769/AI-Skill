---
name: codex-native-installer
description: Download and install or update the Windows Codex app from Microsoft Store package links using a local browser and Windows Add-AppxPackage.
---

# Codex Native Installer

这个技能用于在 Microsoft Store、Windows Update 或 `winget` 无法正常更新 Codex 时，通过 Windows 原生 AppX 机制安装或更新 Codex。

This skill helps install or update the Windows Codex app when Microsoft Store, Windows Update, or `winget` is unavailable.

It opens Microsoft Edge or Google Chrome with Puppeteer, submits the public Codex Microsoft Store URL to `store.rg-adguard.net`, downloads the largest matching Codex `.msixbundle` or `.msix` package, and installs it with Windows PowerShell `Add-AppxPackage`.

## Typical Scenario

适用于电脑禁用了 Windows Update、Microsoft Store 更新或相关系统更新服务，导致 Codex 停留在旧版本、无法从应用商城更新的情况。

Use this skill when a Windows computer has disabled Windows Update, Microsoft Store updates, or related update services, causing Codex to be stuck on an older version and unable to update from Microsoft Store.

中文使用说明：[`USAGE.zh-CN.md`](USAGE.zh-CN.md)

English guide: [`USAGE.en.md`](USAGE.en.md)

## Requirements

- Windows 10 or Windows 11
- Node.js
- Microsoft Edge or Google Chrome
- PowerShell with AppX deployment available
- Internet access

## Usage

在技能目录中运行：

Run from this skill directory:

```powershell
.\run.bat
```

或直接运行脚本：

Or run the script directly:

```powershell
cd scripts
npm install
node auto_install.js
```

## Notes

- 脚本会打开浏览器窗口，因为 `store.rg-adguard.net` 可能出现 Cloudflare 人机验证。请在浏览器中手动完成验证，脚本会继续执行。
- 如果 Codex 正在运行，Windows 可能要求先关闭 Codex 才能更新。
- 下载的安装包已被 Git 忽略，安装成功后会自动删除。
- A browser window is opened intentionally because `store.rg-adguard.net` may show a Cloudflare challenge. Complete any verification manually in the browser, then the script will continue.
- If Codex is already running, Windows may ask you to close it before the package can be updated.
- Downloaded package files are ignored by Git and are removed after a successful install.
