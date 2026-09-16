# 今日待办（Electron 小窗口）

独立的电脑小应用：打开后只显示当天的待办，而不是浏览器标签页，也不是官方完整桌面客户端。

它加载你已经部署的 Super Productivity **网页**，并进入 `#/tag/TODAY/tasks`。数据和手机是同一份（同一网址 + 云备份），不会再造一套任务列表。

## 启动

在仓库根目录（需要已经 `npm ci`，以便使用项目自带的 Electron）：

```bash
npm run desktop
```

或双击 / 运行：

- Windows：`desktop/open-today.cmd`
- macOS / Linux：`desktop/open-today.sh`

窗口大约 420×780，适合放在屏幕一侧看当天任务。

## 指向线上地址

默认读取 `desktop/web-url.txt`。也可以用环境变量覆盖：

```bash
SP_WEB_URL=https://your-app.vercel.app npm run desktop
```

手机（Safari 添加到主屏幕）和这个窗口必须用**同一个生产地址**。Preview 地址通常有 Vercel 登录墙，日常不要用。

生产环境请关掉 Vercel **Deployment Protection**，否则 iPhone 打不开。

## 和手机同步

网页数据存在每个设备自己的 IndexedDB 里。换网址或仅重新部署看起来像“列表空了”，其实是新的本地库。

要让手机和电脑看到同一份今日待办：先在网页设置里配好云备份（同一把 `SYNC_KEY`），在一台设备备份，另一台恢复。

## iPhone 直接打开

1. 用 Safari 打开**生产地址**（不要用 Preview）
2. 分享 → 添加到主屏幕
3. 以后从主屏幕图标进入，全屏打开今日待办
