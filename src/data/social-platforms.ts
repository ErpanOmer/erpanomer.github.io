import type { ImageMetadata } from "astro";
import cto51Logo from "@/images/social/51cto.svg";
import cnblogsLogo from "@/images/social/cnblogs.svg";
import csdnLogo from "@/images/social/csdn.png";
import juejinLogo from "@/images/social/juejin.svg";
import segmentfaultLogo from "@/images/social/segmentfault.svg";
import wechatLogo from "@/images/social/wechat.svg";
import zhihuLogo from "@/images/social/zhihu.svg";

export const SOCIAL_STATS_PLATFORM_IDS = [
    "juejin",
    "zhihu",
    "segmentfault",
    "csdn",
    "51cto",
    "wechat",
    "cnblogs",
] as const;

export const SOCIAL_PLATFORM_IDS = [...SOCIAL_STATS_PLATFORM_IDS] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORM_IDS)[number];

export interface SocialPlatformConfig {
    id: SocialPlatformId;
    name: string;
    shortName: string;
    displayHandle: string;
    profileUrl: string | null;
    allowedDomains: readonly string[];
    logo: ImageMetadata | null;
    logoText?: string;
    brandColor: string;
    linkEnabled: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
}

export const SOCIAL_PLATFORM_CONFIGS: readonly SocialPlatformConfig[] = [
    {
        id: "juejin",
        name: "掘金",
        shortName: "Juejin",
        displayHandle: "ErpanOmer",
        profileUrl: "https://juejin.cn/user/3878732754331096/posts",
        allowedDomains: ["juejin.cn"],
        logo: juejinLogo,
        brandColor: "#1E80FF",
        linkEnabled: true,
    },
    {
        id: "zhihu",
        name: "知乎",
        shortName: "Zhihu",
        displayHandle: "前端技术官",
        profileUrl: "https://www.zhihu.com/people/erpan-30/posts",
        allowedDomains: ["zhihu.com"],
        logo: zhihuLogo,
        brandColor: "#1772F6",
        linkEnabled: true,
    },
    {
        id: "segmentfault",
        name: "SegmentFault 思否",
        shortName: "SegmentFault",
        displayHandle: "前端技术官",
        profileUrl: "https://segmentfault.com/blog/erpanomer",
        allowedDomains: ["segmentfault.com"],
        logo: segmentfaultLogo,
        brandColor: "#009A61",
        linkEnabled: true,
    },
    {
        id: "csdn",
        name: "CSDN",
        shortName: "CSDN",
        displayHandle: "前端技术官",
        profileUrl: "https://blog.csdn.net/weixin_38123604",
        allowedDomains: ["csdn.net"],
        logo: csdnLogo,
        brandColor: "#FC5531",
        linkEnabled: true,
    },
    {
        id: "51cto",
        name: "51CTO",
        shortName: "51CTO",
        displayHandle: "前端技术官",
        profileUrl: "https://blog.51cto.com/erpanomer",
        allowedDomains: ["51cto.com"],
        logo: cto51Logo,
        brandColor: "#E60012",
        linkEnabled: true,
        emptyTitle: "平台数据暂不可用",
        emptyDescription: "主页与历史内容仍可访问",
    },
    {
        id: "wechat",
        name: "微信公众号",
        shortName: "WeChat",
        displayHandle: "前端技术官",
        profileUrl: "https://mp.weixin.qq.com/s/ILhFqIykkPEb3vQEXXW0jQ",
        allowedDomains: ["mp.weixin.qq.com"],
        logo: wechatLogo,
        brandColor: "#07C160",
        linkEnabled: true,
        emptyTitle: "公众号数据暂不可用",
        emptyDescription: "扫码关注，或点击卡片查看内容",
    },
    {
        id: "cnblogs",
        name: "博客园",
        shortName: "CNBlogs",
        displayHandle: "前端技术官",
        profileUrl: "https://www.cnblogs.com/erpanomer",
        allowedDomains: ["cnblogs.com"],
        logo: cnblogsLogo,
        brandColor: "#1296DB",
        linkEnabled: true,
        emptyTitle: "平台数据暂不可用",
        emptyDescription: "文章内容仍可通过主页访问",
    },
] as const;

export const SOCIAL_PLATFORM_CONFIG_MAP = Object.fromEntries(
    SOCIAL_PLATFORM_CONFIGS.map((platform) => [platform.id, platform]),
) as Record<SocialPlatformId, SocialPlatformConfig>;

export const SOCIAL_PROFILE_URLS = SOCIAL_PLATFORM_CONFIGS.filter(
    (platform) => platform.linkEnabled && platform.profileUrl,
).map((platform) => platform.profileUrl as string);
