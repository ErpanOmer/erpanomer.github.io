---
title: "当 Gemini 3 能写出完美 CSS 时，前端工程师剩下的核心竞争力是什么？"
description: "当 Gemini 3 能写出完美 CSS 时，前端工程师剩下的核心竞争力是什么？"
pubDate: 2025-12-29
lastModified: 2025-12-29T19:16:00.000Z
author: "ErpanOmer"
draft: false
tags: ["前端", "AI","CSS", "Gemeni"]
cover: "https://res.cloudinary.com/dkh81cvyt/image/upload/v1767013950/google-gemini-3-inc_nwi62g.webp"
---

### 兄弟们，咱们的护城河越来越窄了😭

Gemini 3 的发布会，大家看了没？

我是在被窝里看完的。看完之后，我直接失眠了。

以前我觉得 AI 写代码也就那样，写个 Todo List 还行，真要上业务逻辑，它就得幻觉给你看😒。

但 Google 秀的这一手，真的有点**不讲武德**。

```doc

我出于好奇心，用 [Google Al Studio](https://aistudio.google.com/apps) 试了一下几个经典的需求, 直接把飞书需求文档扔给它（纯文案）👇：

    Recall landing page
    1. 页脚的recalls跳转新的recall landing page
    [图片]
    2. 页面内容
    标题：Product Recalls

    两个内容模块，点击后跳转至各自详情页
    第一个：
    2025 Fat Tire Trike Recall Notice
    Pedego has issued a safety recall for Fat Tire Trikes due to a potential frame fracture near a weld that may pose fall or injury risks. Affected owners are eligible for a free repair, completed by a local Pedego dealer.
    Learn more （可点击，跳转至Fat Tire Trike Recall Page）

    第二个：
    2021 Cable Recall Notice
    Pedego is voluntarily recalling select e-bike models sold from January 2018 to August 2020 due to a cable issue that may cause unexpected acceleration. Affected owners should stop riding and register for a free safety repair.
    Learn more（可点击，跳转至https://www.pedegobikerecall.expertinquiry.com/?_gl=1*1hzkwd0*_gcl_au*MTkxNDc4ODEuMTc2MzM0NDUyMA..*_ga*MTM1MzU3NTAzOC4xNzQ1OTE1NTcz*_ga_4K15HG6FFG*czE3NjQ4MzQ5MDAkbzQyJGcwJHQxNzY0ODM0OTAxJGo1OSRsMCRoMA..*_ga_FGPZTS4D91*czE3NjQ4MzQ5MDAkbzQyJGcwJHQxNzY0ODM0OTAxJGo1OSRsMCRoMA..）
    [图片]



    Fat Tire Trike Recall Page
    标题：Pedego Recalls Fat Tire Trike Due to Fall and Laceration Hazards
    [插入几张Fat Tire Trike图片]
     
    页面主体内容
    Name of Product: Pedego Fat Tire Trike
    Hazard: The trike frame can develop a hairline fracture near a weld, which can cause the tube to break, posing fall and laceration hazards. 
    Units Affected: Serial Number Range: D2312050001 - D2312050522 
     
    按钮：REGISTER NOW （点击后跳转至页面下方注册表单）
      
    How is Pedego making this right? 
    Pedego is offering you a free repair of your Fat Tire Trike. We have reengineered and strengthened the section of the frame in question. Once you register, we will ship a repair part to a local Pedego dealer that you select using the registration form. 
    We will ship the part to the dealer. The Pedego dealer will repair the Fat Tire Trike free of charge. There are no charges or fees associated with this recall. 
    You will be contacted when your part is received at the Pedego store for installation.

    Make sure that other members of your household also know about the recall and immediately stop using it. Secure your Fat Tire Trike so that it cannot be ridden until it is repaired.
    We strongly encourage you to participate and contact us to obtain a free repair.
     
    Register for the free repair of your Fat Tire Trike
    First Name*
    Last Name*
    Email*
    Phone number*
    Dealer Where you’d like the repair to take place *  [Perhaps Preload options or provide location search for dealer（这里有没有可能提供选项让消费者选择？或者搜索地址？）]
    State* 
    Zip Code*
    Country*
     
    [] * I hereby affirm that the information I have provided is accurate and correct, and that I have complied with all requirements of the above-referenced recall for seeking a repair of my Fat Tire Trike.
     
     Submit(提交按钮)

    成功提交后显示：
    Thank you. Your registration has been submitted and is being processed. 
    We will notify you when the parts ship to the dealer. The dealer will install and repair your Fat Tire Trike free of charge. 

    [所提交信息在这里展示]
     
    Please print this page for your records. 

```

**我刚准备点根烟的工夫，页面 UI 就出来了👇。**

![image.png](https://res.cloudinary.com/dkh81cvyt/image/upload/v1767014201/screenshot-20251229-211552_icwrb6.png)

![image.png](https://res.cloudinary.com/dkh81cvyt/image/upload/v1767014200/screenshot-20251229-211609_ugaeaq.png)

不是那种满屏 `div` 的垃圾代码，是语义化极好、组件拆分合理、甚至连 `dark mode` 都给配好了的成品，根本不需要改什么😖。

我看着屏幕上自己刚写了一半、还在纠结 `flex-basis` 该给多少的样式文件，突然觉得：**这几年的代码，好像白写了。**

我最新的 [个人主页也是用 Gemini 3 ](https://erpanomer.nurverse.com) 重写的，这审美，这效率，没得说！太强了👏

***

### 切图仔的时代正式终结了

以前咱总开玩笑说自己是切图仔，其实心里还是有点傲气的： *你以为 CSS 容易啊？BFC、层叠上下文、响应式断点、不同内核的兼容性...这玩意儿水深着呢！*

但 Gemini 3 这种级别的 AI 出来，直接把这层傲气给**降维打击**了。

*   **比速度？** 你调一个布局要半小时，它只要 3 秒。
*   **比审美？** 它学习了全球数亿个精美网页，配出的视觉UI 把你那程序员审美甩出几条街。
*   **比稳定性？** 它不会写错单词，也不会漏写分号，更不会因为下午跟产品经理吵了架就故意在代码里埋坑。

**说实话，在实现视觉稿这件事上，人类已经输了。彻底输了！！！😭**

如果你的核心竞争力就是能把 UI 图 1:1 还原成网页，那你的职业生涯确实已经进入倒计时了。

***

### 既然 CSS 成了废话，那我们还剩什么？

既然 AI 能写出完美的 CSS，甚至连交互动画都能一句话生成，那公司凭啥还花几万块招个前端？

我想了半宿，觉得咱们前端老哥的**保命牌**，其实正在从手艺转向上层建筑：

#### 培养自己的架构设计能力

AI 可以给你砌出一面完美的墙，但它不知道这面墙该立在什么位置。

一个大型项目里：

*   **组件怎么拆分**最利于复用？
*   **目录结构**怎么设计才不会让后来的人骂娘？
*   **全局状态**是用 Zustand 还是直接原生 Context 梭哈？

这些涉及到**工程化决策**的东西，AI 目前还是个弟弟。它只能给你局部的最优解，给不了你全局的架构观。

#### 处理那些只有人能理解的业务

AI 最怕的是什么？是**逻辑的混沌**。

> 用户如果连续点击三次，要触发一个彩蛋，但如果他是 VIP 且余额不足，这个彩蛋要换成充值提醒，顺便还得防止接口重放。

这种只有人类产品经理拍脑袋想出来的、逻辑转了十八道弯的边缘 Case，AI 极其容易写出 Bug。

搞定复杂的异步流，搞定恶心的竞态条件，搞定各种各样的降级策略——这才是你领工资的真正理由。

#### 驾驭 AI 的能力（这应该是 2026 年的高频面试题）

以前面试问：CSS 怎么实现三角形？

以后面试可能问：如何用一句 Prompt，让 Gemini 3 输出一个符合公司私有 UI 规范、且通过了 E2E 测试的复杂组件？

AI 不是你的敌人，它可是你的好伙伴。

别人还在用手敲代码时，你已经学会利用AI 提升工作效率。你的核心竞争力，就是你 **调教 AI** 的水平。

***

### 没必要焦虑，这是超级个体的开始

咱们有木有可能换一种思路🤔。

以前我们想做个自己的副业项目，最头疼的是什么？UI 和 CSS。

对于我们这种逻辑强、审美弱的后端型前端，调样式简直是要了亲命。

现在 Gemini 3 这种东西出来了，简直是送福利。

*   **后端：** 让 AI 帮你生成 Schema 和基础 CRUD。
*   **UI/CSS：** 丢张草图给 Gemini 3。
*   **前端框架：** 让 AI 帮你写好骨架。

**你一个人，就是一个超级个体。**

以前我们需要在大厂里卷，是因为大厂有资源、有配套。

现在 AI 把资源门槛抹平了。在这个代码非常廉价的时代，你的创意、你的产品意识、你的解决问题能力，反而变得更值钱了。

***

Gemini 3 确实很猛，猛到让人怀疑人生，猛得一塌糊涂！😖

但我相信，只要互联网还需要服务，前端这个角色就不会消失。它只是从体力活进化成了脑力活。

别纠结那几个 `margin` 和 `padding` 了，去研究架构，去深挖性能，去学习怎么让 AI 给你当牛马。

**只要你跑得比 AI 进化的速度快，你就不是被淘汰的那一个。**

最后默默的问大家一句🤣：

如果明天你的老板让你裁掉团队一半的前端，只留下那些会用 AI 的，你会是在名单里的那个人吗？

欢迎👏顺便说说你被 Gemini 3 惊吓到的瞬间😁。