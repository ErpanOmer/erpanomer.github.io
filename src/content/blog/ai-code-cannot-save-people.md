---
title: "2026 年AI 能生成代码，但都是一坨屎😒"
description: "当 AI 能在 3 秒内生成 300 行完美代码，为什么我却删掉了它？"
pubDate: 2026-02-03T11:00:00.000Z
lastModified: 2026-02-03T11:00:00.000Z
author: "ErpanOmer"
draft: false
tags: ["前端", "AI 编程", "AI", "职业发展"]
cover: "https://res.cloudinary.com/dkh81cvyt/image/upload/w_768/v1770090004/featuredImage_p5e1io.webp"
---

现在的 IDE 已经进化到了不可思议的地步。昨天，产品经理在群里火急火燎地提了一个需求：给我们的 web 老年版 App ，要大按钮，要醒目，要快。

我把这句话喂给了最新的 Google Antigravity。

**3 秒**。真的只有 3.5 秒 😲。

它直接吐出了 300 行完美无瑕的 React 代码。Tailwind 样式美观，TypeScript 类型定义严丝合缝，甚至还贴心地自动补全了单元测试。

代码跑起来了，测试全绿，没有任何报错。

如果是三年前，我可能会惊叹自己要失业了。但现在，我看着屏幕上那个密密麻麻的按钮，内心毫无波澜，甚至想骂人。🤬🤬🤬

**这写的是一坨什么屎？？？？**

### 代码都是冷冰冰的

AI 生成的代码，从计算机科学的角度看是满分的。但它根本不知道，使用这个产品的用户，是一位 75 岁、患有白内障、手抖得厉害的独居老人。

试想一下，当他在深夜突发心脏不适，颤抖着手打开手机时，他会遭遇什么？

![2 (1).png](https://res.cloudinary.com/dkh81cvyt/image/upload/w_800/f_webp/v1770090006/2_1_yffugh.png)

在老人模糊且敏感的视野里，不是科技感，而是一团晃眼的光斑，甚至可能诱发眩晕。

那个严丝合缝的 **点击逻辑**，要求手指必须精准落在 40px 的圆心内。而老人在慌乱中，手指接触屏幕的面积往往是整个指腹，甚至是大鱼际。AI 写的代码会判定这是误触，然后无动于衷。

那个毫无报错的 **API 调用**，在老人那微弱的 2G 信号地下室里，会直接超时。AI 很负责任地弹出了一个标准的 Ant Design 风格提示框：**Error: 504 Gateway Timeout😖**。

这一刻，AI 完成了写代码的任务，但它彻底搞砸了救命这件事 🤦‍♂️。

我毫不犹豫地删掉了那 300 行所谓的完美代码。

我手写了 50 行最笨拙的 CSS。我去掉了所有特效，把按钮改成了高对比度的红黄配色，土是土了点，但能在黑暗里一眼看到。我把点击热区扩大到了半个屏幕，哪怕他用拳头砸都能触发。

<p align="center"><img src="https://res.cloudinary.com/dkh81cvyt/image/upload/f_webp/v1770090003/screenshot-20260203-110207_tvdcrh.png" alt="screenshot-20260203-110207.png" loading="lazy"></p>

```css
/* style.css */

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

body {
  background: #000; /* 纯黑，减少眩光 */
}

/* 整个屏幕就是一个按钮 */
#emergency-btn {
  width: 100vw;
  height: 100vh;

  background: #ff0000; /* 纯红 */
  color: #ffff00;      /* 纯黄 */

  font-size: 48px;
  font-weight: bold;
  line-height: 1.4;

  border: none;
  outline: none;

  /* 防止误操作带来的系统延迟 */
  touch-action: manipulation;
}

/* 防止手机系统点击闪烁 */
#emergency-btn:active {
  background: #cc0000;
}

```

```js
// main.js

const btn = document.getElementById('emergency-btn');

btn.addEventListener('click', () => {
  // 尝试先走“智能路径”
  trySendEmergencySignal();
});

function trySendEmergencySignal() {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 3000); // 3 秒，不能再多了

  fetch('https://example.com/api/emergency', {
    method: 'POST',
    signal: controller.signal,
  })
    .then(() => {
      // 成功也直接拨号，不等服务器“确认”
      dial120();
    })
    .catch(() => {
      // ⚠️ 任何错误，直接走最原始方案
      dial120();
    })
    .finally(() => {
      clearTimeout(timeout);
    });
}

function dial120() {
  // 不提示、不解释、不弹窗
  window.location.href = 'tel:120';
}

```

我还在 catch 语句里加了一段逻辑：**如果网络超时，不要弹窗报错，而是直接调用系统的电话拨号盘，填入 120。**

这段代码，没有任何设计模式，甚至有点丑。但它能在关键时刻，真的把求救信号发出去。

### 2026 年，我们缺的是代码吗？

完全不缺。GitHub 上的代码量早就指数级爆炸了。现在的初级程序员，或者说是 Prompt 工程师，最擅长的事情就是：生成、复制、粘贴。

只要跑得通，只要 UI 看起来一样，就提交上线。

于是，我们的项目里充斥着这种**屎代码**。它们没有明显的 Bug，但它们极其臃肿、逻辑割裂、毫无上下文关联。它们就像超市里的预制菜，看着像那么回事，吃起来全是工业糖精味 😮‍💨。

**什么叫正确的事？**

正确不是 Type Check Passed。

正确是知道这里为什么不能用无限滚动，因为用户需要到底部找联系我们。正确是知道在表单提交失败时，不要只红框提示，而是要自动保留用户刚才敲了 500 字的评论，别让他重写。

AI 永远学不会心疼用户。它没有痛觉，没有焦虑，没有爱。它不会因为页面白屏了 3 秒而感到愧疚，但你会。

### 程序员的护城河，是同理心

很多人问我，2026 年了，我还需要学写代码吗？

我的回答是：你不需要学怎么写代码，但你需要学**为什么写代码**。

以前，我们的价值是翻译——把人类的需求翻译成机器能懂的 JavaScript。现在，AI 把翻译的活儿干了。我们的价值变成了共情——去感受屏幕背后那个真实人类的喜怒哀乐。

当 AI 能够一键生成整个商城系统时，你能做的，是去思考：

在这个支付环节，用户会不会因为犹豫而流失？这个报错提示，会不会让用户觉得自己很蠢？如果是色弱用户，能不能看清这个图表？（比如我😭）

这些细微的、关乎人性的决策，才是 1 和 0 之间那道无法跨越的鸿沟。

***

在这个代码泛滥的年代，**克制**反而成了一种美德。

别因为 AI 能生成，你就疯狂堆砌功能。别因为 AI 能优化，你就忽略了真实的体感。

请停下来想一想：这行代码背后，是一个活生生的人。他可能是焦急的父亲，可能是疲惫的打工人，也可能是你年迈的父母。

AI 可以帮你建起万丈高楼，但只有你能决定，要不要在楼道里，为晚归的人留一盏温暖的灯 ❤️。

这才是我们程序员在 2026 年，依然无可替代的理由。
