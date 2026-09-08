# Super Productivity（Web / Vercel）

这是 [super-productivity/super-productivity](https://github.com/super-productivity/super-productivity) 的 Web 版部署。上游项目是 MIT 许可的高级待办与时间追踪工具；本仓库把它做成可部署到 [Vercel](https://vercel.com) 的静态 PWA。

官方在线版：[https://app.super-productivity.com](https://app.super-productivity.com)

## 本仓库怎么跑

Web 版数据默认存在浏览器本地（IndexedDB）。没有账号，也不需要数据库。可选的 Dropbox / WebDAV / SuperSync 同步可以之后再配。

### 本地预览生产构建

```bash
npm ci
npm run buildFrontend:prodWeb
npx serve dist/browser
```

开发模式：

```bash
npm ci
npm start
```

默认开发地址是 `http://127.0.0.1:4200`。

### 部署到 Vercel

1. 把本仓库接到 Vercel
2. 构建命令：`npm run buildFrontend:prodWeb`
3. 输出目录：`dist/browser`
4. Node.js：22.x（见 `.nvmrc`）

可选环境变量（见 `.env.example`）：`UNSPLASH_KEY`、`DROPBOX_API_KEY`、`WEBDAV_*` 等。不配也能用，只是对应集成不可用。

Web 版和桌面版的功能差异见上游 Wiki：[Web App vs Desktop](https://github.com/super-productivity/super-productivity/wiki/3.05-Web-App-vs-Desktop)。

## 来源

- 上游：https://github.com/super-productivity/super-productivity
- 许可证：MIT（见 `LICENSE`）
- 上游版本：18.21.2
