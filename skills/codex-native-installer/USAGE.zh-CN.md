# Codex Native Installer 使用说明

## 适用场景

有些 Windows 电脑会因为公司策略、系统精简、手动优化或稳定性要求，禁用 Windows Update、Microsoft Store 更新、`winget` 等系统更新通道。

这种情况下，Codex 可能出现以下问题：

- Microsoft Store 里无法更新 Codex
- `winget upgrade` 找不到更新或下载失败
- Codex 一直停留在旧版本
- 应用商城被禁用、无法联网、无法打开，或更新按钮无效

这个技能用于绕过 Microsoft Store 客户端更新流程，直接获取 Microsoft Store 官方发布的 Codex 安装包链接，然后通过 Windows 原生 `Add-AppxPackage` 安装或更新 Codex。

## 工作原理

脚本会自动完成以下步骤：

1. 启动本机 Microsoft Edge 或 Google Chrome。
2. 打开 `store.rg-adguard.net`。
3. 提交 Codex 的 Microsoft Store 公共页面链接。
4. 从返回结果里选择最大的 Codex `.msixbundle` 或 `.msix` 安装包。
5. 下载官方安装包到 `scripts` 目录。
6. 调用 PowerShell `Add-AppxPackage` 进行原生安装。
7. 安装成功后自动删除临时安装包。

## 前置要求

- Windows 10 或 Windows 11
- 已安装 Node.js
- 已安装 Microsoft Edge 或 Google Chrome
- PowerShell 可用
- Windows AppX 部署服务可用
- 电脑可以访问外网

## 快速使用

进入技能目录后双击运行：

```powershell
run.bat
```

或在 PowerShell 中运行：

```powershell
cd skills\codex-native-installer
.\run.bat
```

第一次运行时，如果没有依赖，会自动执行：

```powershell
npm install
```

## 手动运行脚本

也可以直接进入脚本目录运行：

```powershell
cd skills\codex-native-installer\scripts
npm install
node auto_install.js
```

## Cloudflare 验证

`store.rg-adguard.net` 有时会出现 Cloudflare 人机验证。

脚本会打开一个真实浏览器窗口。如果看到“请确认您是人类”之类的验证页面，请在浏览器里手动完成验证。验证通过后，脚本会继续等待并自动解析下载链接。

## Codex 正在运行怎么办

如果安装阶段出现类似提示：

```text
0x80073D02: 无法安装，因为需要关闭 OpenAI.Codex
```

说明当前 Codex 正在运行，Windows 无法替换应用文件。

处理方式：

1. 关闭所有 Codex 窗口。
2. 在任务管理器里结束残留的 `Codex` 或 `codex` 进程。
3. 重新运行 `run.bat`。

## 常见问题

### 1. 无法打开包，提示 `0x80073CF0`

可能原因：

- 安装包下载不完整
- 文件仍被下载进程占用
- AppX 部署服务异常

建议：

- 删除 `scripts\codex_setup.msix` 或 `scripts\codex_setup.msixbundle`
- 重新运行脚本
- 必要时重启电脑后再试

### 2. 提示缺少 AppX 或 Msixvc 服务

说明系统可能精简或禁用了相关部署服务。

可以在管理员 PowerShell 中尝试：

```powershell
net start AppXSvc
net start ClipSVC
```

如果系统策略彻底禁用了 AppX 部署，需要先恢复相关 Windows 组件。

### 3. 浏览器无法启动

脚本默认查找：

```text
C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
C:\Program Files\Google\Chrome\Application\chrome.exe
```

如果你的浏览器安装在其它位置，需要修改 `scripts\auto_install.js` 里的浏览器路径。

### 4. 下载很慢或失败

这是 Microsoft 下载节点、网络代理或本机网络环境导致的。可以重新运行脚本，脚本会重新获取下载链接。

## 安全说明

- 该工具下载的是 Microsoft Store 官方分发的 Codex 安装包。
- 不会提交本机账号、Token、Cookie 或 Codex 会话数据。
- `node_modules`、下载得到的 `.msix/.msixbundle`、日志文件都已被 `.gitignore` 排除。
- 如果不放心，可以先阅读 `scripts\auto_install.js` 再运行。

## 更新流程建议

推荐流程：

1. 先关闭 Codex。
2. 运行 `run.bat`。
3. 如出现 Cloudflare 验证，手动点过。
4. 等待下载和安装完成。
5. 重新打开 Codex。
