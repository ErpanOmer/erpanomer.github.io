<p align="center">
  <img src="./website.webp" style="border-radius: 10px;" alt="Personal Website" width="600"/>
</p>

# Personal Website

![Status](https://img.shields.io/badge/Status-Active-success)
![Astro](https://img.shields.io/badge/Astro-v5.16.6-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4.17-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)

基于 Astro 5.x（SSR 模式）构建的现代化个人网站，部署在 Cloudflare Workers，提供极致性能和全球边缘计算能力。用于展示技能、项目和技术博客，面向前端开发者和技术爱好者。

## ✨ 主要特性

- 🚀 **极致性能** - Astro SSR 模式 + Cloudflare 边缘计算，毫秒级响应
- 🎨 **精美设计** - GitHub Dark 主题，响应式设计，完美适配各种设备
- 📝 **博客系统** - 完整的 Markdown 博客，支持标签、封面图、阅读时间、RSS 订阅
- 🚀 **项目展示** - 智能链接系统（外部 URL 自动跳转，站内链接直接打开，暂不可用项目显示提示）
- 🔧 **智能代理** - GET 请求限制、速率限制（30/min）、智能缓存、超时控制
- 📊 **访问统计** - 基于 Cloudflare KV 的实时流量统计
- 🔒 **安全防护** - URL 长度限制、速率限制、请求方法限制
- 🎯 **SEO 优化** - Sitemap、Robots.txt、Open Graph、结构化数据

## 🛠️ 技术栈

**核心框架**: Astro 5.16.6 (SSR), TypeScript 5.x, Vite

**样式方案**: Tailwind CSS 3.4.17, @tailwindcss/typography

**部署平台**: Cloudflare Workers、D1、Cloudflare KV

**图片处理**: Cloudinary, Sharp

**工具库**: dayjs, lodash-es, reading-time, @astrojs/rss, @astrojs/sitemap, @astrojs/cloudflare

**Markdown 插件**: remark-modified-time, remark-reading-time

**开发工具**: Wrangler, Express

## 📋 环境要求

- Node.js 24（与 GitHub Actions 校验环境一致）
- npm（随 Node.js 安装）
- Git
- Cloudflare 账户（可选，用于部署到 Workers）

## 🚀 快速开始

### 安装

```bash
git clone https://github.com/ErpanOmer/erpanomer.github.io.git
cd erpanomer.github.io
npm install
```

### 配置环境变量

复制 `.env.example` 为本地 `.env` 后配置；`.env` 和 `.dev.vars` 不提交到 Git：

```bash
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 配置 Cloudflare Workers（可选）

编辑 `wrangler.jsonc`：

```json
{
  "name": "your-project-name",
  "main": "./dist/_worker.js/index.js",
  "compatibility_date": "2025-12-25",
  "kv_namespaces": [
    {
      "binding": "VIEWS",
      "id": "your_kv_namespace_id"
    },
    {
      "binding": "RATE_LIMIT",
      "id": "your_rate_limit_namespace_id"
    }
  ]
}
```

创建 KV 命名空间：

```bash
wrangler kv:namespace create "VIEWS"
wrangler kv:namespace create "RATE_LIMIT"
```

将返回的 ID 更新到 `wrangler.jsonc` 中。

## 📖 使用指南

### 开发命令

```bash
npm run dev      # 启动开发服务器（http://localhost:4321）
npm run build    # 构建生产版本
npm run preview  # 先 build，再使用本地 Worker 预览（默认 8787 端口）
```

### 博客列表与本地数据

- 首页以两列简洁预览展示最新 6 篇，热门文章放在下方并排除重复项；影响力数据只请求一次。
- `/blog` 服务端渲染首批 12 篇，后续滚动加载；支持搜索、标签、阅读/点赞排序，以及关闭 JavaScript 后的下一页链接。
- `GET /api/blog/posts` 接受 `q`、`tag`、`sort=latest|views|likes`、`cursor`、`includeMeta=1`。每批固定 12 篇，只返回摘要，不携带正文或管理字段。
- 开发继续使用 `.wrangler/state` 中的本地 D1，生产使用 `BLOG_DB` 绑定。两者共用查询逻辑，但本地文章和计数可能与线上不同；不会自动同步或写入生产数据库。
- Markdown 与数据库按 slug 去重，数据库有效文章的元数据和发布状态优先。本站文章数为去重后的可见文章数，跨平台发布次数包含多平台分发。
- 本地缺少表或未提供数据库绑定时可展示静态文章；统计不可用显示“—”。其他数据库错误会显示失败状态，并支持重试。
- RSS 提供最新 50 篇，sitemap 与 llms.txt 按批读取全部公开文章，不再受 200 篇上限影响。

使用 Node.js 24（含内置 SQLite）运行独立的查询测试，不修改现有本地或线上数据库：

```bash
npm run test:catalog
```

### 页面样式约定

- 文章详情保持原有三栏结构、标题和正文排版；首页与列表的调整不改变详情页布局。
- 首页最新与热门文章保留已有封面，使用等比例缩略图和简洁摘要。
- 本站及外部平台全部复用 `PlatformCard.astro`，通过数据配置展示不同指标，不单独绘制本站卡片。

### 提交与部署

当前项目使用 Astro SSR 与 Cloudflare D1，部署目标是 **Cloudflare Workers**。GitHub 用于存储代码与执行校验，不再使用静态 GitHub Pages 发布工作流。

推送到 `master` 或发起 PR 后，`.github/workflows/deploy.yml` 会执行依赖安装、12 项数据测试、类型检查、构建及 Worker 部署预演；不会自动发布网站。

提交前可在本地执行：

```bash
npm run test:catalog
npm run typecheck
npm run build
npm run deploy:check
```

正式发布（以下命令会更新线上 Worker，需要自行确认部署时机）：

```bash
npx wrangler login
npm run build
npx wrangler deploy
```

生产账号需具备 `wrangler.jsonc` 中 D1、KV、`GET_FANS_WORKER` 服务及 Secrets Store 绑定的访问权限。现有数据库沿用原表结构，本次界面与汇总改动无需迁移；新建环境需要先用 `schema.sql` 初始化数据库。管理员凭据通过已有 `WEBSITE_ADMIN_TOKEN` Secrets Store 绑定提供，勿将真实凭据写入仓库。

“成就与影响力”按原口径直接累加本站的公开文章数、文章阅读与点赞；外部平台的粉丝和收藏保持原值。全站访问量单列展示，避免与文章阅读重复相加。某个来源不可用时，仅展示已获得的数据，不补造数值。

本地 Worker 生产预览使用本地数据库；若未启动 `GET_FANS_WORKER` 服务，外部平台统计会显示不可用，`npm run dev` 则沿用公开统计接口。


### 添加博客文章

在 `src/content/blog/` 创建 Markdown 文件：

```markdown
---
title: "文章标题"
description: "文章描述"
pubDate: 2025-01-05
lastModified: 2025-01-05T00:00:00.000Z
author: "ErpanOmer"
draft: false
tags: ["标签1", "标签2"]
cover: "https://example.com/cover-image.jpg"
---

文章内容...
```

### 添加项目

编辑 `src/data/projects.ts`：

```typescript
{
    title: "项目标题",
    description: "项目描述",
    tags: ["标签1", "标签2"],
    image: "https://example.com/project-image.jpg",
    link: "/projects/my-project/",  // 站内链接直接打开，暂不可用项目显示提示
    type: "project-type",
    icon: "svg-icon-string",
    message: "该项目正在开发中，敬请期待！"  // 可选，自定义消息
}
```

**智能链接说明**：
- 外部 URL（`http://` 或 `https://`）：自动跳转，新标签页打开
- 相对路径：阻止跳转，显示 alert 弹窗（使用 `message` 字段或默认消息）

### 配置代理

编辑 `src/config/proxyConfig.ts`：

```typescript
export const PROXY_TARGETS: ProxyTarget[] = [
    {
        name: 'project-name',
        origin: 'https://your-project.pages.dev',
        staticExtensions: ['js', 'css', 'woff2', 'woff', 'png', 'jpg', 'webp', 'svg', 'ico']
    },
];
```

## 📂 目录结构

```
erpanomer.github.io/
├── .github/workflows/          # GitHub Actions 配置
├── public/                     # 静态资源
├── src/
│   ├── components/             # 可复用组件
│   ├── config/                 # 配置文件（proxyConfig.ts）
│   ├── content/blog/           # 博客文章
│   ├── data/projects.ts        # 项目数据
│   ├── images/                 # 图片资源
│   ├── layouts/                # 页面布局
│   ├── pages/                  # 页面路由
│   ├── utils/proxy.ts          # 代理工具
│   └── middleware.js          # 中间件（访问统计）
├── astro.config.mjs            # Astro 配置
├── tailwind.config.mjs         # Tailwind 配置
├── wrangler.jsonc              # Cloudflare Workers 配置
└── package.json                # 依赖配置
```

## 🔧 核心功能

### 博客系统
- 基于 Astro Content Collections，类型安全
- 路由：`/blog`（列表）、`/blog/[slug]`（详情）
- 支持 Markdown、标签、封面图、草稿、阅读时间、最后修改时间

### SEO 优化
- 自动生成 sitemap-index.xml
- 动态生成 robots.txt
- Open Graph 和结构化数据（JSON-LD）
- 完整的 meta 标签配置

### 访问统计
- 基于 Cloudflare KV 存储
- Cookie 访客识别（visitor_id）
- 每日访问量统计（site_views）
- 防重复计数（has_visited_today cookie）
- 开发环境回退值（8888）

### 代理功能
- **安全限制**：仅允许 GET 请求，URL 最大 2000 字符
- **速率限制**：每 IP 每分钟 30 次请求，超限后挂起
- **超时控制**：5 秒超时
- **智能缓存**：根据文件类型和扩展名自动设置缓存策略
- **详细错误处理**：完整的错误日志和状态码

### 项目智能链接
- 外部 URL：自动跳转，新标签页打开
- 相对路径：阻止默认行为，显示 alert 弹窗
- 支持自定义消息提示

## 🔍 常见问题

**开发服务器无法启动**：
```bash
# 检查端口占用
netstat -ano | findstr :4321  # Windows
lsof -i :4321                 # macOS/Linux

# 更换端口
npm run dev -- --port 4322
```

**构建失败**：
```bash
rm -rf node_modules package-lock.json
npm install
node --version  # 确保是 20.x 或更高
```

**图片无法加载**：
- 检查 `.env` 中的 `PUBLIC_CLOUDINARY_CLOUD_NAME`
- 确认 Cloudinary 账户状态
- 检查图片 URL 正确性

**部署问题**：
- KV 命名空间未找到：确保已创建并更新 ID
- 部署失败：检查 `wrangler.jsonc` 配置
- 路由错误：检查 Astro 配置中的 `base` 路径

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出改进建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

**代码规范**：
- 遵循现有代码风格
- 使用 TypeScript 类型检查
- 组件命名使用 PascalCase
- 文件命名使用 PascalCase（组件）或 kebab-case（工具函数）

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 📮 联系方式

- **Email**: erpanomer@gmail.com
- **GitHub**: [ErpanOmer](https://github.com/ErpanOmer)
- **Website**: [https://erpanomer.nurverse.com](https://erpanomer.nurverse.com)

## 🙏 致谢

感谢以下开源项目：
- [Astro](https://astro.build/) - 现代化的 Web 框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Cloudflare](https://www.cloudflare.com/) - 边缘计算平台
- [Cloudinary](https://cloudinary.com/) - 云端图片托管服务

---

如果这个项目对您有帮助，请给个 ⭐️ Star 支持一下！
