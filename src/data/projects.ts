import { getCldImageUrl } from "astro-cloudinary/helpers";
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
        title: "Leetcode 算法笔记",
        description: "Leetcode 算法题练习，包括 Top 100, Top 100, Sort ... 等类目, 每个类目都有详细的解题思路和代码实现, 帮助开发者提升算法能力和面试准备。",
        tags: ["Vitepress", "Leetcode", "Top 100", "Top 100", "Sort"],
        image: getCldImageUrl({
            src: "1_0HMd3UBqpu478hk_HbhEaA_zpijaz",
            width: 600
        }),
        link: "/projects/leetcode/",
        type: "algorithm",
        icon: algorithm
    },
    {
        title: "基于 Astro 的个人官网",
        description: "使用 Gemeni 3 Pro 构建的个人官网，基于 Astro 框架，部署在 Cloudflare Workers 上，使用 Cloudinary 存储图片。 官网采用响应式设计，在不同设备上都能有良好的显示效果。",
        tags: ["Gemeni 3 Pro", "Astro", "Cloudflare Workers", "Cloudinary", "Markdown", "TailwindCSS", "TypeScript"],
        image: getCldImageUrl({
            src: "8b116889-af12-4694-afa0-08a9a5919a62_fezfxk",
            width: 600
        }),
        link: "https://github.com/ErpanOmer/erpanomer.github.io",
        type: "Personal Website",
        icon: algorithm
    },
    {
        title: "微信小游戏 (飞飞的小鸟 🐦)",
        description: "一款基于微信小游戏平台开发的 Flappy Bird 风格休闲小游戏，采用云开发技术，支持好友排行榜、月度赛季系统等社交功能",
        tags: ["微信小游戏", "Flappy Bird", "云开发", "社交功能"],
        image: getCldImageUrl({
            src: "8b116889-af12-4694-afa0-08a9a5919a62_fezfxk",
            width: 600
        }),
        link: "",
        type: "Wechat Mini Game",
        icon: algorithm,
        message: "微信小游戏正在开发中，敬请期待！"
    }
];
