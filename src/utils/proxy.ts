import type { ProxyTarget } from '@/config/proxyConfig';

export interface ProxyResponse {
    response: Response;
    error?: never;
}

export interface ProxyError {
    response?: never;
    error: string;
}

export type ProxyResult = ProxyResponse | ProxyError;

/**
 * 代理请求到目标服务器
 * @param request - 原始请求
 * @param target - 代理目标配置
 * @param subPath - 子路径 (如 /some/page)
 * @returns ProxyResult 包含响应或错误
 */
export async function proxyRequest(
    request: Request,
    target: ProxyTarget,
    subPath: string
): Promise<ProxyResult> {
    const url = new URL(request.url);
    const targetUrl = new URL(subPath + url.search, target.origin);

    const headers = new Headers(request.headers);
    headers.delete('host');
    // 告诉上游：我需要解压后的内容，方便处理或添加缓存头
    headers.set('Accept-Encoding', 'identity');

    try {
        const resp = await fetch(targetUrl.toString(), {
            method: request.method,
            headers,
            redirect: 'follow'
        });

        const newHeaders = new Headers(resp.headers);
        // 移除上游可能存在的压缩头，由 Cloudflare 边缘重新决定压缩
        newHeaders.delete('Content-Encoding');
        newHeaders.delete('Content-Length');

        // 根据响应 Content-Type 判断是否为静态资源
        const contentType = resp.headers.get('content-type') || '';
        const isStaticResource = 
            contentType.startsWith('text/css') ||
            contentType.startsWith('application/javascript') ||
            contentType.startsWith('text/javascript') ||
            contentType.startsWith('image/') ||
            contentType.startsWith('font/') ||
            contentType.includes('woff') ||
            contentType.includes('octet-stream');

        if (isStaticResource) {
            newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
            // HTML 等动态内容设置短缓存
            newHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
        }

        // 安全头标识
        newHeaders.set('X-Proxy-By', 'Astro-SSR');

        return {
            response: new Response(resp.body, {
                status: resp.status,
                headers: newHeaders
            })
        };
    } catch (e) {
        console.error('Proxy error:', e);
        return { error: 'Proxy Error' };
    }
}
