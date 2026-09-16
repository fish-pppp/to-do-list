# 今日待办（Electron 小应用）

单独的电脑小窗口：打开后直接进入当天的待办，不是浏览器标签，也不是官方完整桌面客户端。

它用项目里已有的 Electron，加载你已经部署的 Super Productivity **网页**，并进入 `#/tag/TODAY/tasks`。不会再造一套任务列表。

## 启动

仓库根目录（`npm ci` 之后，以便使用自带的 Electron）：

```bash
npm run desktop
```

或运行：

- Windows：`desktop/open-windows.cmd`
- macOS：`desktop/open-mac.command`
- Linux：`desktop/open-linux.sh`

窗口大约 420×780，适合竖在屏幕一侧看当天任务。没有 Electron 时，启动脚本会退回 Chrome / Edge 的 `--app=` 窗口。

只要浏览器窗口：`npm run desktop:chrome`。

## 指向线上地址

编辑 `desktop/web-url.txt`，或：

```bash
SP_WEB_URL=https://your-app.vercel.app npm run desktop
```

手机（Safari 添加到主屏幕）和这个窗口必须用**同一个生产地址**。不要用带 Vercel 登录墙的 Preview 链接。

生产环境请关掉 Vercel **Deployment Protection**，否则 iPhone 打不开。

## 和手机同步

每个设备自己的 IndexedDB 是分开的。要让手机和电脑看到同一份今日待办：在网页设置里配好云备份（同一把密钥），一台备份、另一台恢复。

不要用官方 Super Productivity 桌面客户端打开这份清单，那会再造一套本地数据。

## iPhone 直接打开

1. 用 Safari 打开**同一条生产地址**
2. 分享 → 添加到主屏幕
3. 以后从主屏幕图标进入
