export interface ProxyTarget {
    /** 项目标识符，对应 URL 路径 /projects/{name}/ */
    name: string;
    /** 目标 origin，如 https://leetcode-3d8.pages.dev */
    origin: string;
    /** 静态资源后缀，用于设置长期缓存 */
    staticExtensions?: string[];
}

export const PROXY_TARGETS: ProxyTarget[] = [
    {
        name: 'leetcode',
        origin: 'https://leetcode-3d8.pages.dev',
        staticExtensions: ['js', 'css', 'woff2', 'woff', 'png', 'jpg', 'webp', 'svg', 'ico']
    },
    // 未来添加更多项目:
    // {
    //     name: 'another-project',
    //     origin: 'https://another-project.pages.dev'
    // }
];

export function getProxyTarget(projectName: string): ProxyTarget | undefined {
    return PROXY_TARGETS.find(t => t.name === projectName);
}
