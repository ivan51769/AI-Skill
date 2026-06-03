# AI Skill Collection

开放、可复用的 Codex 技能集合。

Open, reusable Codex skills.

## Skills

- [`codex-native-installer`](skills/codex-native-installer/) - 当 Microsoft Store、Windows Update 或 `winget` 无法正常更新 Codex 时，用于在 Windows 上安装或更新 Codex 的辅助技能。
- [`codex-native-installer`](skills/codex-native-installer/) - Windows helper skill for installing or updating Codex when Microsoft Store, Windows Update, or `winget` cannot update it normally.

## Codex Native Installer

### 中文

有些 Windows 电脑会因为公司策略、系统精简、手动优化或稳定性要求，禁用 Windows Update、Microsoft Store 更新或 `winget`。这种情况下，Codex 可能无法通过应用商城正常更新。

`codex-native-installer` 会通过以下方式安装或更新 Codex：

1. 在本机打开 Edge 或 Chrome。
2. 通过 `store.rg-adguard.net` 获取 Microsoft Store 官方包下载链接。
3. 下载 Codex 官方 `.msix` 或 `.msixbundle` 安装包。
4. 使用 Windows `Add-AppxPackage` 执行原生安装。

中文使用说明：[`skills/codex-native-installer/USAGE.zh-CN.md`](skills/codex-native-installer/USAGE.zh-CN.md)

### English

Some Windows machines disable Windows Update, Microsoft Store updates, or `winget` because of company policy, system hardening, or controlled deployment requirements. In that situation, Codex may be unable to update normally through Microsoft Store.

`codex-native-installer` installs or updates Codex by:

1. Opening Edge or Chrome locally.
2. Fetching the official Microsoft Store package links through `store.rg-adguard.net`.
3. Downloading the official Codex `.msix` or `.msixbundle` package.
4. Installing it with Windows `Add-AppxPackage`.

English usage guide: [`skills/codex-native-installer/USAGE.en.md`](skills/codex-native-installer/USAGE.en.md)

## Privacy Notes

公开版本已排除 `node_modules`、下载的 MSIX 安装包、日志和本机路径等运行产物。

The published copy excludes local runtime artifacts such as `node_modules`, downloaded MSIX packages, logs, and machine-specific paths.
