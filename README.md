# ErpanOmer's Personal Website

![Status](https://img.shields.io/badge/Status-Active-success)
![Astro](https://img.shields.io/badge/Astro-v5.16.6-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4.17-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)

欢迎来到我的个人网站源代码！这是一个基于 Astro 5.x（SSR 模式）构建的现代化个人网站，用于展示我的技能、项目和技术博客。

## 📖 项目简介

本项目是一个功能完整的个人网站，采用现代化的前端技术栈构建，主要面向前端开发者和技术爱好者。网站采用 SSR（服务端渲染）模式，部署在 Cloudflare Workers 上，提供出色的性能和全球边缘计算能力。

### 使用场景

- **个人品牌展示** - 为前端工程师和技术爱好者提供专业的个人品牌展示平台
- **技术博客分享** - 分享前端开发、算法学习、AI 编程等技术心得和经验
- **项目作品集** - 展示个人项目作品，包括 Shopify 独立站、算法笔记、微信小游戏等
- **技术社区互动** - 通过 RSS 订阅、社交媒体分享等方式与技术社区互动

### 核心定位

- **个人品牌展示** - 展示个人技能、技术栈和职业成就
- **技术博客** - 分享前端开发、算法学习、AI 编程等技术心得
- **项目展示** - 展示个人项目作品，包括 Shopify 独立站、算法笔记等
- **SEO 优化** - 完整的 SEO 配置，包括 sitemap、Open Graph、结构化数据

### 特色亮点

- 🚀 **极致性能** - 基于 Astro SSR 模式和 Cloudflare 边缘计算，提供毫秒级响应速度
- 🎨 **精美设计** - 采用 GitHub Dark 主题配色，响应式设计，完美适配各种设备
- 🔧 **智能代理** - 内置代理功能，支持静态资源代理和智能缓存策略
- 📊 **访问统计** - 基于 Cloudflare KV 的访问统计系统，实时追踪网站流量
- 📝 **博客系统** - 完整的博客系统，支持 Markdown、标签、封面图、阅读时间等
- 🎯 **SEO 优化** - 完整的 SEO 配置，包括 sitemap、robots.txt、Open Graph、结构化数据

### 目标用户群体

- 前端开发者 - 了解最新前端技术和最佳实践
- 技术爱好者 - 关注个人技术博客和项目分享
- 招聘者 - 通过项目展示了解技术能力和作品
- 技术社区 - 通过 RSS 订阅和社交媒体分享获取技术内容

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
- **智能链接** - 外部 URL 自动跳转，相对路径显示 alert 弹窗
- **自定义消息** - 支持为项目设置自定义提示消息
- **精选标记** - 支持标记精选项目

### 🔧 技术特性
- **SSR 模式** - 采用服务端渲染，提升首屏加载速度
- **边缘计算** - 部署在 Cloudflare Workers，全球边缘节点
- **访问统计** - 使用 Cloudflare KV 存储网站访问量
- **图片优化** - 集成 Cloudinary 图片托管和优化
- **代理功能** - 支持静态资源代理和智能缓存策略
- **SEO 优化** - 完整的 SEO 配置，包括 sitemap、robots.txt
- **响应式设计** - 完美适配桌面端和移动端
- **暗色主题** - 采用 GitHub Dark 主题配色

### 🔒 安全与性能
- **速率限制** - 基于 IP 的速率限制，每分钟最多 30 次请求
- **超时控制** - 请求超时设置为 5 秒，防止长时间挂起
- **URL 长度限制** - 限制 URL 最大长度为 2000 字符
- **智能缓存** - 根据文件类型和扩展名自动设置缓存策略
- **请求方法限制** - 代理功能只允许 GET 请求，提升安全性

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
- **lodash-es** - 现代 JavaScript 实用工具库，提供模块化的函数式编程工具
- **reading-time** - 自动计算文章阅读时间的工具库
- **@astrojs/rss** - RSS 订阅源生成
- **@astrojs/sitemap** - Sitemap 生成
- **@astrojs/cloudflare** - Cloudflare 适配器

### Markdown 插件
- **remark-modified-time** - 自动追踪文章最后修改时间的 Remark 插件
- **remark-reading-time** - 自动计算文章阅读时间的 Remark 插件

### 开发工具
- **Wrangler** - Cloudflare Workers CLI 工具
- **Express** - Node.js Web 框架（用于本地开发服务器）

## 📋 环境要求

在开始之前，请确保您的开发环境满足以下要求：

- **Node.js** - 推荐使用 Node.js 20.x 或更高版本
- **npm** - 包管理器（随 Node.js 安装）
- **Git** - 版本控制工具
- **Cloudflare 账户** - 用于部署到 Cloudflare Workers（可选）

### 开发环境

- **操作系统** - Windows、macOS、Linux 均可
- **代码编辑器** - 推荐 VS Code、WebStorm 等
- **浏览器** - Chrome、Firefox、Safari、Edge 等现代浏览器

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

**环境变量说明**：
- `PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary 云名称，用于图片托管和优化

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
    },
    {
      "binding": "RATE_LIMIT",
      "id": "your_rate_limit_namespace_id"
    }
  ]
}
```

**配置说明**：
- `name` - 项目名称
- `main` - Worker 入口文件
- `compatibility_date` - 兼容性日期
- `kv_namespaces` - KV 命名空间配置
  - `VIEWS` - 用于访问统计
  - `RATE_LIMIT` - 用于代理速率限制

### 5. 创建 KV 命名空间

如果使用 Cloudflare Workers 部署，需要创建以下 KV 命名空间：

```bash
# 创建访问统计 KV 命名空间
wrangler kv:namespace create "VIEWS"

# 创建速率限制 KV 命名空间
wrangler kv:namespace create "RATE_LIMIT"
```

创建后，将返回的 ID 更新到 `wrangler.jsonc` 中对应的 `id` 字段。

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
    link: "/projects/my-project/",  // 相对路径会显示 alert 弹窗
    type: "project-type",
    icon: "svg-icon-string",
    message: "该项目正在开发中，敬请期待！"  // 可选，自定义 alert 消息
}
```

**智能链接说明**：
- **外部 URL**（以 `http://` 或 `https://` 开头）：自动跳转到对应页面，在新标签页打开
- **相对路径**（普通字符串）：阻止默认跳转，显示 alert 弹窗，弹窗内容为 `message` 字段或默认消息

### 配置代理功能

如需添加新的代理目标，编辑 `src/config/proxyConfig.ts`：

```typescript
export const PROXY_TARGETS: ProxyTarget[] = [
    {
        name: 'project-name',
        origin: 'https://your-project.pages.dev',
        staticExtensions: ['js', 'css', 'woff2', 'woff', 'png', 'jpg', 'webp', 'svg', 'ico']
    },
];
```

### 常见问题排查

**开发服务器无法启动**：
```bash
# 检查端口是否被占用
# Windows
netstat -ano | findstr :4321

# macOS/Linux
lsof -i :4321

# 更换端口
npm run dev -- --port 4322
```

**构建失败**：
```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install

# 检查 Node.js 版本
node --version  # 确保是 20.x 或更高
```

**图片无法加载**：
- 检查 `.env` 文件中的 `PUBLIC_CLOUDINARY_CLOUD_NAME` 配置
- 确认 Cloudinary 账户状态正常
- 检查图片 URL 是否正确

## 📂 目录结构说明

```
erpanomer.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions 部署配置
├── .trae/                       # Trae IDE 配置目录
│   └── documents/               # 项目文档
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
│   │   └── proxyConfig.ts       # 代理配置（缓存策略、速率限制等）
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
├── .fcignore                    # Cloudflare 忽略文件
├── ABOUTME.md                   # 个人简介
├── README.md                    # 项目说明文档
├── astro.config.mjs             # Astro 配置文件
├── package.json                 # 项目依赖配置
├── remark-modified-time.mjs      # Remark 插件：文章最后修改时间
├── remark-reading-time.mjs       # Remark 插件：文章阅读时间计算
├── tailwind.config.mjs          # Tailwind CSS 配置
├── tsconfig.json                # TypeScript 配置
└── wrangler.jsonc               # Cloudflare Workers 配置
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
# 创建访问统计 KV 命名空间
wrangler kv:namespace create "VIEWS"

# 创建速率限制 KV 命名空间
wrangler kv:namespace create "RATE_LIMIT"
```

4. 更新 `wrangler.jsonc` 中的 KV 命名空间 ID

5. 部署：

```bash
npm run build
wrangler deploy
```

**部署验证**：
- 访问 `https://your-project.pages.dev` 检查部署是否成功
- 检查浏览器控制台是否有错误
- 验证访问统计和代理功能是否正常工作

**常见部署问题**：
- **KV 命名空间未找到**：确保已创建 KV 命名空间并更新 ID
- **部署失败**：检查 `wrangler.jsonc` 配置是否正确
- **路由错误**：检查 Astro 配置中的 `base` 路径设置

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

**提交问题时请包含**：
- 详细的复现步骤
- 预期行为 vs 实际行为
- 环境信息（Node.js 版本、操作系统等）
- 错误日志或截图

## ❓ 常见问题（FAQ）

### 开发相关

**Q: 开发服务器无法启动，提示端口被占用怎么办？**
A: 可以更换端口或关闭占用端口的进程：
```bash
# 更换端口
npm run dev -- --port 4322

# 或查找并关闭占用端口的进程
# Windows
netstat -ano | findstr :4321

# macOS/Linux
lsof -i :4321
```

**Q: 构建失败，提示依赖错误怎么办？**
A: 清除缓存重新安装依赖：
```bash
rm -rf node_modules package-lock.json
npm install
```

**Q: TypeScript 类型检查失败怎么办？**
A: 运行类型检查查看具体错误：
```bash
npx tsc --noEmit
```

### 部署相关

**Q: Cloudflare Workers 部署后访问 404 怎么办？**
A: 检查以下几点：
1. 确认 `wrangler.jsonc` 中的 `name` 配置正确
2. 检查 Astro 配置中的 `base` 路径设置
3. 确认路由配置正确
4. 查看 Cloudflare Workers 日志

**Q: 访问统计不工作怎么办？**
A: 检查以下几点：
1. 确认已创建 VIEWS KV 命名空间
2. 检查 `wrangler.jsonc` 中的 KV 命名空间 ID 正确
3. 查看浏览器控制台是否有 Cookie 相关错误
4. 确认部署环境支持 KV 存储

**Q: 代理功能不工作怎么办？**
A: 检查以下几点：
1. 确认已创建 RATE_LIMIT KV 命名空间
2. 检查 `proxyConfig.ts` 中的目标配置正确
3. 查看浏览器控制台是否有代理相关错误
4. 确认上游服务器可访问

### 功能相关

**Q: 博客文章的封面图不显示怎么办？**
A: 检查以下几点：
1. 确认 `cover` 字段的 URL 正确
2. 检查图片 URL 是否可访问
3. 检查 Cloudinary 配置是否正确
4. 清除浏览器缓存

**Q: 项目卡片的智能链接不工作怎么办？**
A: 检查以下几点：
1. 确认 `link` 字段格式正确（http:// 或相对路径）
2. 检查浏览器控制台是否有 JavaScript 错误
3. 确认 `message` 字段已正确设置
4. 测试点击事件是否正常触发

## ⚡ 性能优化建议

### 图片优化

- **使用 Cloudinary**：自动优化图片格式和大小
- **懒加载**：所有图片使用 `loading="lazy"` 属性
- **响应式图片**：使用 `srcset` 提供不同分辨率的图片
- **WebP 格式**：优先使用 WebP 格式，减少文件大小

### 代码优化

- **代码分割**：Astro 自动进行代码分割
- **按需加载**：只加载当前页面需要的代码
- **Tree Shaking**：移除未使用的代码
- **压缩**：生产构建自动压缩代码

### 缓存策略

- **静态资源**：JS、CSS、字体等设置长期缓存（1 年）
- **图片资源**：设置中期缓存（30 天）
- **动态内容**：HTML、JSON 等设置短缓存（5 分钟）
- **边缘缓存**：利用 Cloudflare Workers 的边缘缓存

### 网络优化

- **CDN 加速**：使用 Cloudflare CDN 加速静态资源
- **HTTP/2**：Cloudflare Workers 自动支持 HTTP/2
- **压缩传输**：启用 Brotli 和 Gzip 压缩
- **预连接**：预连接到常用域名

## 🔧 故障排查指南

### 开发环境问题

**问题：依赖安装失败**
```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

**问题：TypeScript 编译错误**
```bash
# 查看详细错误信息
npx tsc --noEmit

# 检查类型定义
npx tsc --showConfig
```

**问题：样式不生效**
```bash
# 检查 Tailwind 配置
npx tailwindcss -i ./src/app.css

# 清除构建缓存
rm -rf .astro dist

# 重新构建
npm run build
```

### 生产环境问题

**问题：部署后页面空白**
- 检查浏览器控制台是否有 JavaScript 错误
- 检查网络请求是否成功
- 查看源代码是否正确加载
- 检查环境变量是否正确配置

**问题：图片加载失败**
- 检查 Cloudinary 配置是否正确
- 检查图片 URL 是否正确
- 检查网络连接是否正常
- 查看浏览器控制台的网络请求

**问题：路由 404**
- 检查文件名和路由配置是否匹配
- 检查 Astro 的构建输出
- 检查部署配置是否正确
- 查看服务器日志

### 性能问题

**问题：页面加载慢**
- 使用浏览器开发者工具分析加载性能
- 检查是否有大文件阻塞渲染
- 优化图片和静态资源
- 启用代码分割和懒加载

**问题：内存占用高**
- 检查是否有内存泄漏
- 优化图片和资源大小
- 使用虚拟列表处理大数据
- 启用流式传输

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
