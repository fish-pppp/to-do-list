# 简洁桌面窗口 / Simple desktop window

电脑用独立小窗口打开**同一条生产网址**的今日待办（`#/tag/TODAY/tasks`）。不是浏览器标签，也不是官方 Super Productivity 桌面软件。

同一网址 = 同一份 IndexedDB。换域名等于空清单。

## 设置网址 / Set the URL

1. 编辑 `desktop/web-url.txt`，写成一行 `https://…`
2. 或设置环境变量 `SP_WEB_URL`

手机和电脑必须用**同一条**地址。Preview 链接通常有 Vercel 登录墙，日常不要用。

当前文件里是已确认能打开 Super Productivity 的公开地址。如果你后来有了固定的 Production 域名，改成那一条，并在手机上重新「添加到主屏幕」。

## 关掉 Vercel 保护 / Deployment Protection

Vercel → 项目 → Settings → Deployment Protection：关掉 Production 的 SSO / Vercel Authentication。否则 iPhone 主屏幕图标会停在登录页。

## 电脑打开 / Computer

默认用本机 **Chrome 或 Edge** 的 `--app=`（约 420×780，可竖在屏幕一侧）。

- Windows：双击 `desktop/open-windows.cmd`，或在仓库根目录运行 `npm run desktop`
- macOS：双击 `desktop/open-mac.command`，或 `npm run desktop`
- Linux：运行 `desktop/open-linux.sh`，或 `npm run desktop`

`npm run desktop:chrome` 只走浏览器。`npm run desktop:electron` 仅在本仓库已安装 Electron 时可用；那是另一套本地存储，日常请用 Chrome/Edge 窗口。

不要用官方 Super Productivity 桌面客户端打开这份清单，那会再造一套 IndexedDB。

## iPhone

1. 用 **Safari**（不要用微信 / Chrome）打开**同一条生产网址**
2. 底部分享按钮 → **添加到主屏幕**
3. 以后从主屏幕图标进入（独立窗口，不是 Safari 标签）

## 和手机同步 / Sync

只有同时满足才会一起更新：

1. 手机和电脑打开**同一条**生产网址
2. 网页里已配置云备份（同一把密钥；见 PR #4），并在一台设备备份、另一台恢复
