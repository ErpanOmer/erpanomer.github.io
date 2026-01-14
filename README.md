# ErpanOmer's Personal Website

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
- 🚀 **项目展示** - 智能链接系统（外部 URL 自动跳转，相对路径显示 alert 弹窗）
- 🔧 **智能代理** - GET 请求限制、速率限制（30/min）、智能缓存、超时控制
- 📊 **访问统计** - 基于 Cloudflare KV 的实时流量统计
- 🔒 **安全防护** - URL 长度限制、速率限制、请求方法限制
- 🎯 **SEO 优化** - Sitemap、Robots.txt、Open Graph、结构化数据

## 🛠️ 技术栈

**核心框架**: Astro 5.16.6 (SSR), TypeScript 5.x, Vite

**样式方案**: Tailwind CSS 3.4.17, @tailwindcss/typography

**部署平台**: Cloudflare Workers, GitHub Pages, Cloudflare KV

**图片处理**: Cloudinary, Sharp

**工具库**: dayjs, lodash-es, reading-time, @astrojs/rss, @astrojs/sitemap, @astrojs/cloudflare

**Markdown 插件**: remark-modified-time, remark-reading-time

**开发工具**: Wrangler, Express

## 📋 环境要求

- Node.js 20.x 或更高版本
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

复制 `.env` 文件并配置：

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
npm run preview  # 预览生产构建
```

### 部署

**GitHub Pages**（自动部署）:
- 推送到 `master` 分支自动触发部署
- 配置文件：`.github/workflows/deploy.yml`

**Cloudflare Workers**:
```bash
npm run build
npx wrangler deploy
```

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
    link: "/projects/my-project/",  // 相对路径显示 alert 弹窗
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