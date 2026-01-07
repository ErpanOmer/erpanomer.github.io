export interface ProxyTarget {
    /** 项目标识符，对应 URL 路径 /projects/{name}/ */
    name: string;
    /** 目标 origin，如 https://leetcode-3d8.pages.dev */
    origin: string;
    /** 静态资源后缀，用于设置长期缓存 */
    staticExtensions?: string[];
}

export interface CacheRule {
    /** 匹配类型：extension（扩展名）或 contentType（内容类型） */
    type: 'extension' | 'contentType';
    /** 匹配值 */
    value: string;
    /** 缓存时间（秒） */
    maxAge: number;
    /** 是否 immutable */
    immutable?: boolean;
}

export interface ProxyConfig {
    /** 请求超时时间（毫秒） */
    timeout: number;
    /** URL 最大长度 */
    maxUrlLength: number;
    /** 速率限制：每分钟请求数 */
    rateLimitPerMinute: number;
    /** 缓存规则（按优先级从高到低） */
    cacheRules: CacheRule[];
}

export const PROXY_TARGETS: ProxyTarget[] = [
    {
        name: 'leetcode',
        origin: 'https://leetcode-3d8.pages.dev',
        staticExtensions: ['js', 'css', 'woff2', 'woff', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'ico', 'gif', 'mp4', 'webm']
    },
    {
        name: 'learning',
        origin: 'https://learning-f2f.pages.dev',
        staticExtensions: ['js', 'css', 'woff2', 'woff', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'ico', 'gif', 'mp4', 'webm']
    }
];

export const PROXY_CONFIG: ProxyConfig = {
    timeout: 5000,
    maxUrlLength: 2000,
    rateLimitPerMinute: 30,
    cacheRules: [
        { type: 'extension', value: 'js', maxAge: 31536000, immutable: true },
        { type: 'extension', value: 'css', maxAge: 31536000, immutable: true },
        { type: 'extension', value: 'woff2', maxAge: 31536000, immutable: true },
        { type: 'extension', value: 'woff', maxAge: 31536000, immutable: true },
        { type: 'extension', value: 'ttf', maxAge: 31536000, immutable: true },
        { type: 'extension', value: 'eot', maxAge: 31536000, immutable: true },
        { type: 'extension', value: 'png', maxAge: 2592000 },
        { type: 'extension', value: 'jpg', maxAge: 2592000 },
        { type: 'extension', value: 'jpeg', maxAge: 2592000 },
        { type: 'extension', value: 'webp', maxAge: 2592000 },
        { type: 'extension', value: 'svg', maxAge: 2592000 },
        { type: 'extension', value: 'ico', maxAge: 2592000 },
        { type: 'extension', value: 'gif', maxAge: 2592000 },
        { type: 'extension', value: 'mp4', maxAge: 2592000 },
        { type: 'extension', value: 'webm', maxAge: 2592000 },
        { type: 'contentType', value: 'text/css', maxAge: 31536000, immutable: true },
        { type: 'contentType', value: 'application/javascript', maxAge: 31536000, immutable: true },
        { type: 'contentType', value: 'text/javascript', maxAge: 31536000, immutable: true },
        { type: 'contentType', value: 'application/json', maxAge: 300 },
        { type: 'contentType', value: 'application/xml', maxAge: 300 },
        { type: 'contentType', value: 'text/xml', maxAge: 300 },
        { type: 'contentType', value: 'image/', maxAge: 2592000 },
        { type: 'contentType', value: 'font/', maxAge: 31536000, immutable: true },
        { type: 'contentType', value: 'application/font-', maxAge: 31536000, immutable: true },
        { type: 'contentType', value: 'application/x-font-', maxAge: 31536000, immutable: true },
    ],
};

export function getProxyTarget(projectName: string): ProxyTarget | undefined {
    return PROXY_TARGETS.find(t => t.name === projectName);
}

export function getCacheRule(extension: string, contentType: string): CacheRule | null {
    for (const rule of PROXY_CONFIG.cacheRules) {
        if (rule.type === 'extension' && extension === rule.value) {
            return rule;
        }
        if (rule.type === 'contentType' && contentType.startsWith(rule.value)) {
            return rule;
        }
    }
    return null;
}
