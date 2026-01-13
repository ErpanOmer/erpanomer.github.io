---
title: "我用 Gemini 3 Pro 手搓了一个并发邮件群发神器"
description: "我用 Gemini 3 Pro 手搓了一个并发邮件群发神器"
pubDate: 2026-01-13
lastModified: 2026-01-13T19:16:00.000Z
author: "ErpanOmer"
draft: false
tags: ["Turbo Mail Sender", "Gemeni 3 Pro", "AI", "Antigravity", "SSR", "Node JS"]
cover: "https://res.cloudinary.com/dkh81cvyt/image/upload/w_1000/f_webp/v1768272184/ChatGPT_Image_2026%E5%B9%B41%E6%9C%8813%E6%97%A5_10_42_36_xrtug0.png"
---

这个周末我失业了🤣。

起因很简单：公司项目原因，我需要给订阅列表里的几千个用户发一封更新通知。
市面上的邮件营销工具（Mailchimp 之类）死贵，还要一个个导入联系人；自己写脚本吧，以前得折腾半天 SMTP 协议、搞定并发限制、处理失败重试……想想就头秃😖。

正好有 Gemini 3 Pro ，代码能力逆天。我就想试探一下它的底线。
结果这一试，我后背发凉。

我本来只想要个 Demo，**它直接给了我一个带 连接池 (Connection Pool)、任务队列 (Task Queue)、甚至还顺手写了 服务端渲染 (SSR) 的完整全栈应用。**

![image.png](https://res.cloudinary.com/dkh81cvyt/image/upload/f_webp/v1768272312/screenshot-20260112-115716_ur2ywb.png)

以前我写这套东西起码得两天，这次连写带调，**2 小时收工**。

今天复盘一下我是怎么压榨 [Antigravity - Gemini 3 Pro](https://antigravity.google/) 开发出这个 **Turbo Mail Sender** 的。源码我已经[开源到 GitHub](https://github.com/ErpanOmer/turbo-mail-sender) 了，文末自取，记得给个 Star😁！

***

### 不仅要看得下去，还要骚气点🤔

我给第一个 Prompt 很简单，但也很刁钻：

> 我要做一个邮件群发工具的单页 UI。要求：
>
> 1.  写邮件（集成 Quill 富文本编辑器）。
>
> 2.  包含监控发送进度（要有一个骚气的进度条和实时日志）。
>
> 3.  用 Tailwind CSS，设计风格要轻色单栏，带点微交互动画。
>
> 4.  直接给我 HTML 单文件就行。

**它思考了大概几分钟（网络环境有点差😥）。**
它没有给我堆砌 `div`，它直接甩出了基于 Tailwind 的完整布局，甚至贴心地加上了 `@keyframes fadeInUp` 入场动画。

看看这个生成的 UI 代码片段，它连 `backdrop-filter` 和 `shadow` 的细节都处理好了：

```html
<style>
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(6px);} to { opacity:1; transform: translateY(0); } }
    .log-entry { opacity:0; transform:translateY(6px); animation: fadeInUp 420ms ease forwards; }
    /* 进度条的光泽动画，这审美绝了 */
    @keyframes shimmer { 0% { background-position: -200px 0 } 100% { background-position: 200px 0 } }
</style>

```

![screenshot-20260112-115836.png](https://res.cloudinary.com/dkh81cvyt/image/upload/f_webp/v1768272619/screenshot-20260112-114801_fnzsb7.png)

最骚的是，它连 JS 里的富文本编辑器初始化都帮我写好了，甚至考虑到了 SSR 的数据回填逻辑。这哪里是 AI，这简直就是自带 3 年经验的前端同事。

***

### 从普通的脚本到工程化

UI 画好了，接下来是后端。这里才是见真章的地方。
很多新手写发邮件脚本，就是写个 `for` 循环调用 `sendMail`。结果就是发 100 封后 IP 被封，或者内存溢出。

我给 Gemini 的 Prompt 是：

> 后端用 Express + Nodemailer。注意，我要发送几万封邮件。
>
> 1.  必须有 **连接池 (Connection Pooling)**，不能每次发送都握手。
>
> 2.  必须有 **生产者-消费者队列**，控制并发数（Concurrency）。
>
> 3.  失败要自动重试。
>
> 4.  给我写出架构级的代码。

如果是以前的 AI，大概率会给我瞎编一个队列。
但它给出的 `server.js`，让我这个老前端都挑不出毛病。🤔

#### 自动实现了连接池缓存

它自己封装了一个 `TransporterCache` 类，防止重复创建 SMTP 连接。这波操作直接把性能拉满了。

```javascript
// server.js 核心片段：连接池
class TransporterCache {
    constructor() {
        this.cache = new Map();
    }
    get(host, port, user, pass) {
        const key = `${user}@${host}`;
        if (this.cache.has(key)) return this.cache.get(key);

        // Gemini 居然知道开启 pool: true 选项
        const transporter = nodemailer.createTransport({
            pool: true, 
            host: host,
            port: Number(port),
            secure: Number(port) === 465,
            auth: { user, pass },
            maxConnections: 3, // 自动限制最大连接数
            rateLimit: 5       // 还有速率限制，讲究
        });
        this.cache.set(key, transporter);
        return transporter;
    }
}

```

#### 像模像样的任务队列

它没有引入 Redis（因为我要轻量级），而是手搓了一个内存版的 `TaskManager` 和 `Worker`。

```javascript
// server.js 核心片段：消费者 Worker
class Worker {
    constructor() { setInterval(() => this.tick(), 500); }

    tick() {
        // 经典的消费逻辑：控制并发数
        while (taskManager.running < CONFIG.CONCURRENCY && taskManager.queue.length > 0) {
            const id = taskManager.queue.shift();
            const task = taskManager.getTask(id);
            if (task) this.processTask(task);
        }
    }
    // ...发送与重试逻辑
}

```

看到这段代码时，我意识到：**Gemini 不仅仅是在翻译需求，它更懂架构。**

![20260112-120211.jpg](https://res.cloudinary.com/dkh81cvyt/image/upload/f_webp/v1768272750/20260112-120211_yyifwk.jpg)

***

### 最后的细节修改

做到这里，工具已经能用了。但我故意刁难了一下 Gemini：

> 现在的配置（SMTP服务器、端口）每次刷新页面就没了，体验太差。但我不想用数据库。你想办法解决一下。

Gemini 3 Pro 给出的方案是：**SSR (服务端渲染) + LocalStorage 双重兜底**。

它直接修改了 `server.js` 的 `/` 路由，在返回 HTML 之前，把 URL 参数里的配置通过正则替换注入到 HTML 中。不用数据库，却实现了配置持久化的错觉。

```javascript
// server.js：极其暴力的正则替换 SSR，简单粗暴但有效
if (host) {
    html = html.replace(/id="smtpHost"\s+type="text"\s+value="[^"]*"/,
        `id="smtpHost" type="text" value="${host}"`);
}

```

说实话，这种正则替换虽然看起来很脏，但在这种微型工具里，**不仅省事，而且性能极高**。AI 这种能力（知道是小工具就不上重型框架），才是最可怕的。

***

### 成果与开源

最终，这个 **Turbo Mail Sender** 具备了以下能力：

*   🚀 **高并发发送**：连接池 + 异步队列。
*   📊 **实时可视化**：能看到每一封邮件的发送状态、耗时。
*   🛡️ **智能重试**：遇到网络抖动自动重发。
*   📂 **CSV 导入**：支持批量导入收件人。

我把整个项目打包开源了。如果你也需要一个**免费、私有、无限制**的邮件群发工具，或者你想研究一下 **Gemini 3 Pro 生成的代码到底有多工整**，[欢迎来 GitHub 提 👉 Issue](https://github.com/ErpanOmer/turbo-mail-sender)。

![screenshot-20260112-120615.png](https://res.cloudinary.com/dkh81cvyt/image/upload/f_webp/v1768273034/screenshot-20260112-120615_ozx4wk.png)

***

以前我们常说全栈工程师。
做完这个项目我觉得，以后可能只有一种工程师，叫 **Prompt 工程师**。

这个项目里，CSS 是 AI 写的，后端逻辑是 AI 写的，重试算法是 AI 写的。
**我做了什么？**
我负责**定义问题**，负责**Code Review**，负责**把它们组装起来**。怎么利用 AI，在 2 小时内搞定别人 2 天的工作量。

好了，今天就分享到这儿吧😁

**在线体验：**
👉 [Turbo Mail Sender](https://erpanomer.nurverse.com/tools/turbo-mail-sender)
*(觉得好用记得点个 Star，孩子想上热榜🤣)*

