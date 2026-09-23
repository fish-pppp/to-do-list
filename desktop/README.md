# 今日待办（Electron 小应用）

单独的电脑小窗口：打开后直接进入当天的待办。不是浏览器标签，也不是官方完整桌面客户端。

它用仓库里已有的 Electron，加载你已经部署的 Super Productivity **网页**，并进入 `#/tag/TODAY/tasks`。不会再造一套任务列表。

## 启动

仓库根目录（先 `npm ci`，以便使用自带的 Electron）：

```bash
npm run desktop
```

或运行：

- Windows：`desktop/open-windows.cmd`
- macOS：`desktop/open-mac.command`
- Linux：`desktop/open-linux.sh`

## 小窗口 / 大窗口

默认是约 340×540 的小窗口，只看当天待办，可以放在屏幕角落。

- **Ctrl+Shift+F**（macOS：**Cmd+Shift+F**）：在小窗口和约 1100×760 的完整网页之间切换
- 也可以直接拖边框、点最大化，或双击标题栏放大

两种大小各自的位置和尺寸会记住，下次打开还是上次的样子。

没有 Electron 时，启动脚本可以退回 Chrome / Edge 的 `--app=` 窗口：`npm run desktop:chrome`。

这个小窗口按网页来跑（不是官方桌面端）。不要用官方 Super Productivity 桌面客户端打开同一份清单。

## 指向线上地址

编辑 `desktop/web-url.txt`，或：

```bash
SP_WEB_URL=https://your-app.vercel.app npm run desktop
```

手机（Safari 添加到主屏幕）和这个窗口必须用**同一个生产地址**。不要用带 Vercel 登录墙的 Preview 链接。

生产环境请关掉 Vercel **Deployment Protection**，否则 iPhone 打不开。

## 和手机同步 / 上线后数据还在

每个设备自己的 IndexedDB 是分开的。同一条生产地址重新部署，一般不会清掉这份本地数据。

要让手机和电脑看到同一份清单，并且换设备或清空浏览器后还能找回：

1. 在网页里先 **导出数据** 得到 JSON
2. 打开同一站点的 `/cloud-backup.html`，填入和 Vercel `SYNC_KEY` 相同的密钥，上传这个 JSON
3. 以后重新上线或换设备：同一页下载 JSON，再回到应用里 **从文件导入**

设置 → 同步与备份 里的「云备份」在包含该界面的网页版本里，还可以自动备份 / 空清单自动恢复。

## iPhone 直接打开

1. 用 Safari 打开**同一条生产地址**
2. 分享 → 添加到主屏幕
3. 以后从主屏幕图标进入
