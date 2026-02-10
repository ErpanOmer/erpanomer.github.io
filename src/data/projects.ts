import algorithm from "@/images/algorithm.svg?raw";

export interface Project {
    title: string;
    description: string;
    tags: string[];
    image: string;
    link: string;
    type: string;
    icon: string;
    message?: string;
}

export const projects: Project[] = [
    {
        title: "🧑‍💻 基于 Astro 的个人官网",
        description: "使用 Gemeni 3 Pro 构建的个人官网，基于 Astro 框架，部署在 Cloudflare Workers 上，使用 Cloudinary 存储图片。 官网采用响应式设计，在不同设备上都能有良好的显示效果。",
        tags: ["Gemeni 3 Pro", "Astro", "Cloudflare Workers", "Cloudinary", "Markdown", "TailwindCSS", "TypeScript"],
        image: "https://res.cloudinary.com/dkh81cvyt/image/upload/c_limit,w_500/f_auto/q_auto/8b116889-af12-4694-afa0-08a9a5919a62_fezfxk",
        link: "https://github.com/ErpanOmer/erpanomer.github.io",
        type: "Personal Website",
        icon: algorithm
    },
    {
        title: "Leetcode 算法笔记",
        description: "Leetcode 算法题练习，包括 Top 100, Top 100, Sort ... 等类目, 每个类目都有详细的解题思路和代码实现, 帮助开发者提升算法能力和面试准备。",
        tags: ["Vitepress", "Leetcode", "Top 100", "Top 100", "Sort"],
        image: "https://res.cloudinary.com/dkh81cvyt/image/upload/c_limit,w_500/f_auto/q_auto/1_0HMd3UBqpu478hk_HbhEaA_zpijaz",
        link: "/projects/leetcode/",
        type: "algorithm",
        icon: algorithm
    },
    {
        title: "微信小游戏 (飞飞的小鸟 🐦)",
        description: "一款基于微信小游戏平台开发的 Flappy Bird 风格休闲小游戏，采用云开发技术，支持好友排行榜、月度赛季系统等社交功能",
        tags: ["微信小游戏", "Flappy Bird", "云开发", "社交功能"],
        image: "https://res.cloudinary.com/dkh81cvyt/image/upload/c_limit,w_500/f_auto/q_auto/logo_c7dz8c",
        link: "",
        type: "Wechat Mini Game",
        icon: algorithm,
        message: "微信小游戏正在开发中，敬请期待！"
    },
    {
        title: "📕学习笔记",
        description: "基于 Vitepress 的学习笔记，记录了前端开发、后端开发、数据库、云开发等技术栈的学习笔记，帮助开发者提升技术能力。",
        tags: ["Vitepress", "Markdown", "Cloudflare Workers"],
        image: "https://res.cloudinary.com/dkh81cvyt/image/upload/c_limit,w_500/f_auto/q_auto/65ef63f6bd30ab838939a4ae_Developer_productivity_tools_2024_qp8clt",
        link: "/projects/learning/",
        type: "Learning Notes",
        icon: algorithm
    },
    {
        title: "🗺 店铺地图搜索服务",
        description: "基于 Vue3 + Vite + TypeScript 开发的店铺地图服务, UI 选用 Ant Design Vue 组件库, Mapbox GL JS 实现店铺网点分布",
        tags: ["Vue3", "Mapbox GL", "Ant Design Vue", "Cloudflare Workers", "TailwindCSS"],
        image: "https://res.cloudinary.com/dkh81cvyt/image/upload/c_limit,w_500/f_auto/q_auto/screenshot-20260107-174003_rhnvjc",
        link: "https://urtopia-test-ride.pages.dev",
        type: "Map Store",
        icon: algorithm
    },
];

