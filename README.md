# ErpanOmer's Personal Website

![Status](https://img.shields.io/badge/Status-Active-success)
![Astro](https://img.shields.io/badge/Astro-v5.16.6-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4.17-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)

欢迎来到我的个人网站源代码！这是一个基于 Astro 5.x（SSR 模式）构建的现代化个人网站，用于展示我的技能、项目和技术博客。

## 📖 项目简介

本项目是一个功能完整的个人网站，采用现代化的前端技术栈构建，主要面向前端开发者和技术爱好者。网站采用 SSR（服务端渲染）模式，部署在 Cloudflare Workers 上，提供出色的性能和全球边缘计算能力。

### 核心定位

- **个人品牌展示** - 展示个人技能、技术栈和职业成就
- **技术博客** - 分享前端开发、算法学习、AI 编程等技术心得
- **项目展示** - 展示个人项目作品，包括 Shopify 独立站、算法笔记等
- **SEO 优化** - 完整的 SEO 配置，包括 sitemap、Open Graph、结构化数据

## ✨ 主要功能特性

### 🏠 个人主页
- **Hero 区域** - 个人简介、头像展示、技能标签
- **成就展示** - 展示个人职业成就和技术里程碑
- **最新文章** - 首页展示最新的博客文章列表
- **项目展示** - 展示精选项目，支持动态路由

### 📝 博客系统
- **Markdown 支持** - 使用 Markdown 格式编写博客文章
- **文章分类** - 支持标签系统，方便文章分类
- **封面图支持** - 每篇文章可设置封面图片
- **草稿功能** - 支持草稿模式，未发布文章不会显示
- **阅读时间估算** - 自动计算文章阅读时间
- **最后修改时间** - 显示文章最后修改时间
- **图片灯箱** - 博客图片支持点击放大查看
- **RSS 订阅** - 自动生成 RSS 订阅源

### 🚀 项目展示
- **动态路由** - 支持项目详情页的动态路由
- **项目标签** - 每个项目可设置多个技术标签
- **外部链接** - 支持项目链接和 GitHub 仓库链接
- **精选标记** - 支持标记精选项目

### 🔧 技术特性
- **SSR 模式** - 采用服务端渲染，提升首屏加载速度
- **边缘计算** - 部署在 Cloudflare Workers，全球边缘节点
- **访问统计** - 使用 Cloudflare KV 存储网站访问量
- **图片优化** - 集成 Cloudinary 图片托管和优化
- **代理功能** - 支持静态资源代理和缓存策略
- **SEO 优化** - 完整的 SEO 配置，包括 sitemap、robots.txt
- **响应式设计** - 完美适配桌面端和移动端
- **暗色主题** - 采用 GitHub Dark 主题配色

## 🛠️ 技术栈说明

### 核心框架
- **Astro 5.16.6** - 现代化的 Web 框架，采用 SSR 模式
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速的前端构建工具

### 样式方案
- **Tailwind CSS 3.4.17** - 实用优先的 CSS 框架
- **@tailwindcss/typography** - Tailwind 的排版插件，用于博客内容样式

### 部署平台
- **Cloudflare Workers** - 无服务器边缘计算平台
- **GitHub Pages** - 静态网站托管（备用部署方式）
- **Cloudflare KV** - 键值存储，用于访问统计

### 图片处理
- **Cloudinary** - 云端图片托管和优化服务
- **Sharp** - Node.js 图片处理库

### 工具库
- **dayjs** - 轻量级日期处理库
- **@astrojs/rss** - RSS 订阅源生成
- **@astrojs/sitemap** - Sitemap 生成
- **@astrojs/cloudflare** - Cloudflare 适配器

### 开发工具
- **Wrangler** - Cloudflare Workers CLI 工具
- **Express** - Node.js Web 框架（用于本地开发）

## � 环境要求

在开始之前，请确保您的开发环境满足以下要求：

- **Node.js** - 推荐使用 Node.js 20.x 或更高版本
- **npm** - 包管理器（随 Node.js 安装）
- **Git** - 版本控制工具
- **Cloudflare 账户** - 用于部署到 Cloudflare Workers（可选）

### 检查环境

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 检查 Git 版本
git --version
```

## 🚀 安装与配置步骤

### 1. 克隆项目

```bash
git clone https://github.com/ErpanOmer/erpanomer.github.io.git
cd erpanomer.github.io
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env` 文件并根据需要配置环境变量：

```bash
# Cloudinary 配置（用于图片托管）
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 4. 配置 Cloudflare Workers（可选）

如果需要部署到 Cloudflare Workers，需要配置 `wrangler.jsonc`：

```json
{
  "name": "your-project-name",
  "main": "./dist/_worker.js/index.js",
  "compatibility_date": "2025-12-25",
  "kv_namespaces": [
    {
      "binding": "VIEWS",
      "id": "your_kv_namespace_id"
    }
  ]
}
```

## 📖 使用指南

### 开发模式

启动本地开发服务器：

```bash
npm run dev
```

开发服务器将在 `http://localhost:4321` 启动，并自动在浏览器中打开。

### 构建生产版本

构建生产版本：

```bash
npm run build
```

构建完成后，静态资源将生成在 `dist/` 目录中。

### 预览生产构建

预览生产构建：

```bash
npm run preview
```

### 部署到 Cloudflare Workers

```bash
# 使用 Wrangler 部署
npm run build
npx wrangler deploy
```

### 添加博客文章

1. 在 `src/content/blog/` 目录下创建新的 Markdown 文件
2. 文件名建议使用英文，如 `my-first-post.md`
3. 在文件头部添加 frontmatter：

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

1. 编辑 `src/data/projects.ts` 文件
2. 在 `projects` 数组中添加新项目：

```typescript
{
    title: "项目标题",
    description: "项目描述",
    tags: ["标签1", "标签2"],
    image: "https://example.com/project-image.jpg",
    link: "/projects/my-project/",
    type: "project-type",
    icon: "svg-icon-string"
}
```

## 📂 目录结构说明

```
erpanomer.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions 部署配置
├── public/                      # 静态资源目录
│   ├── favicon.ico              # 网站图标
│   ├── apple-touch-icon.png     # Apple 设备图标
│   └── site.webmanifest         # Web 应用清单
├── src/
│   ├── components/              # 可复用组件
│   │   ├── Achievements.astro   # 成就展示组件
│   │   ├── BackToTop.astro      # 返回顶部组件
│   │   ├── Footer.astro         # 页脚组件
│   │   ├── Header.astro         # 页头组件
│   │   ├── Hero.astro           # Hero 区域组件
│   │   ├── LatestPosts.astro    # 最新文章组件
│   │   ├── Projects.astro       # 项目展示组件
│   │   └── TechStack.astro      # 技术栈组件
│   ├── config/
│   │   └── proxyConfig.ts       # 代理配置
│   ├── content/                 # 内容集合
│   │   ├── blog/                # 博客文章目录
│   │   │   ├── about-algorithm.md
│   │   │   ├── about-gemini3.md
│   │   │   └── stop-hyping-up-performance-optimization.md
│   │   └── config.ts            # 内容集合配置
│   ├── data/
│   │   └── projects.ts          # 项目数据
│   ├── images/                  # 图片资源
│   │   ├── algorithm.svg
│   │   ├── github.svg
│   │   ├── juejin.svg
│   │   ├── leetcode.png
│   │   └── me.jpg
│   ├── layouts/                 # 页面布局
│   │   └── BaseLayout.astro     # 基础布局
│   ├── pages/                   # 页面路由
│   │   ├── blog/
│   │   │   ├── [...slug].astro  # 博客详情页（动态路由）
│   │   │   └── index.astro      # 博客列表页
│   │   ├── projects/
│   │   │   ├── [project]/
│   │   │   │   └── [...path].astro  # 项目详情页（动态路由）
│   │   │   └── index.astro      # 项目列表页
│   │   ├── 404.astro            # 404 页面
│   │   ├── index.astro          # 首页
│   │   ├── robots.txt.ts        # Robots.txt 生成
│   │   └── rss.xml.js           # RSS 订阅源生成
│   ├── utils/
│   │   └── proxy.ts             # 代理工具函数
│   ├── app.css                  # 全局样式
│   ├── env.d.ts                 # TypeScript 环境类型定义
│   └── middleware.js            # 中间件（访问统计）
├── .env                         # 环境变量
├── .gitignore                   # Git 忽略文件
├── astro.config.mjs             # Astro 配置文件
├── package.json                 # 项目依赖配置
├── tailwind.config.mjs          # Tailwind CSS 配置
├── tsconfig.json                # TypeScript 配置
├── wrangler.jsonc               # Cloudflare Workers 配置
└── README.md                    # 项目说明文档
```

## � 核心功能详解

### 博客系统

博客系统基于 Astro 的 Content Collections 功能，提供类型安全的内容管理。

**内容集合配置** (`src/content/config.ts`):

```typescript
const blog = defineCollection({
    type: 'content',
    schema: z.object({
        author: z.string().default("ErpanOmer"),
        lastModified: z.coerce.date(),
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        cover: z.string().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
    }),
});
```

**博客路由**:
- `/blog` - 博客列表页
- `/blog/[slug]` - 博客详情页（动态路由）

### SEO 优化

项目包含完整的 SEO 优化配置：

- **Sitemap** - 自动生成 sitemap-index.xml
- **Robots.txt** - 动态生成 robots.txt
- **Open Graph** - 社交媒体分享优化
- **结构化数据** - JSON-LD 格式的结构化数据
- **Meta 标签** - 完整的 meta 标签配置

### 访问统计

使用 Cloudflare KV 存储网站访问量，通过中间件实现：

```javascript
// src/middleware.js
async function viewCounterMiddleware(context, next) {
    const { request, cookies, locals } = context;
    let viewCount = 0;
    const env = locals.runtime?.env || {};

    if (env && env.VIEWS) {
        const hasVisitedCookie = cookies.has("has_visited_today");
        const currentCountStr = await env.VIEWS.get("site_views");
        viewCount = currentCountStr ? parseInt(currentCountStr) : 0;

        if (!hasVisitedCookie) {
            viewCount++;
            await env.VIEWS.put("site_views", viewCount.toString());
            cookies.set("has_visited_today", "true", {
                maxAge: 86400,
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "lax",
            });
        }
    }

    locals.viewCount = viewCount;
    return next();
}
```

### 代理功能

支持静态资源代理和缓存策略，通过 `proxy.ts` 实现：

```typescript
export async function proxyRequest(
    request: Request,
    target: ProxyTarget,
    subPath: string
): Promise<ProxyResult> {
    // 根据响应 Content-Type 判断是否为静态资源
    const contentType = resp.headers.get('content-type') || '';
    const isStaticResource = 
        contentType.startsWith('text/css') ||
        contentType.startsWith('application/javascript') ||
        contentType.startsWith('image/') ||
        contentType.startsWith('font/');

    if (isStaticResource) {
        newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
        newHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }

    return {
        response: new Response(resp.body, {
            status: resp.status,
            headers: newHeaders
        })
    };
}
```

## 🚀 部署说明

### GitHub Pages 部署

项目已配置 GitHub Actions 自动部署，每次推送到 `master` 分支时自动触发部署。

**部署配置** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
```

### Cloudflare Workers 部署

1. 安装 Wrangler CLI：

```bash
npm install -g wrangler
```

2. 登录 Cloudflare：

```bash
wrangler login
```

3. 创建 KV 命名空间：

```bash
wrangler kv:namespace create "VIEWS"
```

4. 更新 `wrangler.jsonc` 中的 KV 命名空间 ID

5. 部署：

```bash
npm run build
wrangler deploy
```

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出改进建议！

### 如何贡献

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 代码规范

- 遵循现有的代码风格和格式
- 使用 TypeScript 进行类型检查
- 组件命名使用 PascalCase
- 文件命名使用 PascalCase（组件）或 kebab-case（工具函数）
- 提交信息使用清晰的描述

### 问题报告

如果您发现了 bug 或有功能建议，请在 GitHub Issues 中提交。

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

```
MIT License

Copyright (c) 2025 ErpanOmer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## � 联系方式

- **Email**: erpanomer@gmail.com
- **GitHub**: [ErpanOmer](https://github.com/ErpanOmer)
- **Website**: [https://erpanomer.nurverse.com](https://erpanomer.nurverse.com)

## 🙏 致谢

感谢以下开源项目和工具：

- [Astro](https://astro.build/) - 现代化的 Web 框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Cloudflare](https://www.cloudflare.com/) - 边缘计算平台
- [Cloudinary](https://cloudinary.com/) - 云端图片托管服务

---

如果这个项目对您有帮助，请给个 ⭐️ Star 支持一下！
