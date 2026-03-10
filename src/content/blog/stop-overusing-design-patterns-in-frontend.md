---
title: "前端的设计模式？我觉得90%都是在过度设计！"
description: "设计模式曾经是软件工程的重要思想，但在 React 和 Vue 等现代前端框架中，很多经典模式已经不再适用。"
pubDate: 2026-03-10T19:16:00.000Z
lastModified: 2026-03-10T19:16:00.000Z
author: "ErpanOmer"
draft: false
tags: ["前端", "设计模式", "架构设计", "代码质量", "项目管理"]
cover: "https://res.cloudinary.com/dkh81cvyt/image/upload/w_1000/f_webp/v1773131231/effective-use-of-design-patterns-in-software-development-leading-1024x576_pkrkep.png"
---

最近Code Review的时候，我看到我们组一个很聪明的年轻同事，用观察者模式，写了一个极其复杂的全局状态订阅系统，就为了在一个组件里，响应另一个不相关的组件的点击事件。

比较常见的场景：点击 Button 组件，让 Panel 组件打印日志或显示提示，具体伪代码👇:

```js
// observer.js
class Observer {
  constructor() {
    this.subscribers = [];
  }

  subscribe(fn) {
    this.subscribers.push(fn);
  }

  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter(sub => sub !== fn);
  }

  notify(data) {
    this.subscribers.forEach(fn => fn(data));
  }
}

// 全局状态中心（相当于单例）
export const globalClickObserver = new Observer();
```

```jsx
// Button.jsx
import React from "react";
import { globalClickObserver } from "./observer";

export default function Button() {
  const handleClick = () => {
    console.log("Button clicked");
    globalClickObserver.notify({ source: "Button", payload: "Hello Panel" });
  };

  return <button onClick={handleClick}>Click</button>;
}
```

```jsx
// Panel.jsx
import React, { useEffect } from "react";
import { globalClickObserver } from "./observer";

export default function Panel() {
  useEffect(() => {
    const subscriber = (data) => {
      if (data.source === "Button") {
        console.log("event:", data.payload);
      }
    };

    globalClickObserver.subscribe(subscriber);
    return () => globalClickObserver.unsubscribe(subscriber);
  }, []);

  return <div>I'm Panel</div>;
}
```

我把他叫过来，问他为什么不直接用一个简单的Event Bus（比如`mitt`），或者干脆用`Zustand`这样的状态管理器。

他说：“我觉得用设计模式，代码的扩展性会更好，也显得更高级😂。”

这个瞬间，让我下定决心，想聊聊这个话题：

**在现代前端开发（尤其是React/Vue）中，我们挂在嘴边的那些经典设计模式，90%都是在过度设计。**

在我开喷之前，请允许我澄清：我反对的不是设计思想，比如 **高内聚低耦合**、**单一职责**。我反对的是，把那些20年前为Java/C++总结的、沉重的、面向对象的大招，生搬硬套到我们现代前端的开发范式里。

***

#### **我们为什么会陷入设计模式的陷阱？**

![image.png](https://res.cloudinary.com/dkh81cvyt/image/upload/f_auto/v1773131795/design_pattern_wbkgsg.jpg)

曾几何时，我也曾是设计模式的忠实信徒。热衷于在代码里寻找应用工厂模式、策略模式的场景。

我们之所以会这样，我觉得原因有二：

**为了应对面试**

设计模式是前端面试八股文里的重灾区。为了通过面试，我们不得不去背诵它们的定义和用法，这就导致了一种为了应考的惯性思维。

**看起来牛皮🤷‍♂️**

我们总觉得，能说出几个设计模式的名字，能把它们用在代码里，就代表自己的水平更高。仿佛不说个单例、不聊个装饰器，就体现不出自己的资深。

***

#### **有哪些水土不服的设计模式？**

我们来看几个在前端领域最常被滥用的经典模式。

##### **单例模式**

**经典写法**：搞一个`class`，一个私有构造函数，再加一个`getInstance`的静态方法，防止被多次`new`。

**我的吐槽点**：**别闹了，我们有ES6模块！！！**

**前端的原生模式**：JavaScript的`import/export`机制，天生就是单例的。你`export`一个实例，在所有地方`import`它，它从始至终就是同一个实例。

```javascript
// a.js
class MyService { /* ... */ }
// 导出一个实例
export const myServiceInstance = new MyService();

// b.js
import { myServiceInstance } from './a.js';
// c.js
import { myServiceInstance } from './a.js';
// b.js和c.js里的myServiceInstance，是同一个东西
```

为了实现单例，而去手写一个`Singleton`类，在现代前端里，属于（省略一万字...）。

##### **工厂模式**

**写法**：写一个`create`函数，根据传入的`type`，`new`出不同的类的实例 ?。

在React/Vue里，我们有比工厂更强大、更直观的武器——**组件**。你根本不需要一个`create`函数，你只需要一个**组件**，通过`props`来决定它的形态和行为。

```jsx
// 你不需要一个 createButton 的工厂
// 你只需要一个 Button 组件
function Button({ kind, ...props }) {
  if (kind === 'icon') {
    return <IconButton {...props} />;
  }
  if (kind === 'text') {
    return <TextButton {...props} />;
  }
  return <PrimaryButton {...props} />;
}
```

用组件思维去思考，比工厂思维更符合现代前端的直觉。

##### **观察者模式**

<p align="center"><img src="https://res.cloudinary.com/dkh81cvyt/image/upload/f_auto/v1773131890/data_aiytdx.png" alt="image.png"></p>

**写法**：维护一个订阅者列表（`subscribers`），提供`subscribe`、`unsubscribe`和`notify`方法？

**我的吐槽点是**：**你的框架自带的响应式系统，比你手写的强一百倍。**

React的`useState`/`useEffect`，Vue的`ref`/`watch`，它们本身就是**更高阶、更强大的响应式系统**，是观察者模式的终极体现。状态（被观察者）变化，UI（观察者）自动更新。你为什么要去手写一个简陋版的伪响应式，而不用框架自带的、经过千锤百炼的完整经验呢？

***

#### **那剩下 10%有用的，是什么？**

我喷了90%，那剩下10%依然有价值的是什么？在我看来，是一些**设计思想**，而不是具体的什么大招。

**发布/订阅模式 (Pub/Sub)**：

它和观察者模式很像，但更解耦。当两个完全不相关的组件需要通信，而你又不想为此引入一个全局状态库时，一个轻量级的**事件总线**（Event Bus）或者 `mitt`，就非常有用。

```javascript
// pubsub.js
class PubSub {
  constructor() {
    this.events = {}; // 存储事件和对应的订阅者回调
  }

  // 订阅
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => this.unsubscribe(event, callback); // 返回取消订阅函数
  }

  // 取消订阅
  unsubscribe(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  // 发布
  publish(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

// 导出一个全局单例
export const pubsub = new PubSub();
```

**策略模式**：
这个模式的核心思想——将不同的算法封装起来，使它们可以互相替换——在前端依然非常闪光。它能帮助我们写出更优雅、更易扩展的代码，用来代替冗长的`if/else`或`switch`。

```javascript
// 比如，处理不同类型的用户折扣
const strategies = {
  'normal': (price) => price,
  'vip': (price) => price * 0.8,
  'svip': (price) => price * 0.6,
};

function calculatePrice(userType, price) {
  return strategies[userType](price);
}
```

你看，这里没有`class`，没有那么复杂的逻辑，但它蕴含了策略模式的思想。

***

作为组长，当我在Code Review 里看到一个同事用了工厂模式时，我不会觉得他很牛逼。我反而会警惕：他是不是为了炫技？而选择了一个更复杂的方案？我们能不能用一个简单的React组件，就把这事儿给干了？

现代前端框架，已经为我们内建了一套非常优秀、非常自洽的设计模式。**组件是工厂，Hooks是装饰器/策略，响应式系统是观察者。**

你的目标，不是写出能套上某个设计模式名字的代码，而是写出**简单、清晰、易于维护**的代码。在前端，后者往往比前者重要得多🤷‍♂️。
