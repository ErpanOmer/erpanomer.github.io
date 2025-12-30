import { sequence } from "astro:middleware";

const PROXY_CONFIG = [
    {
        prefix: '/projects/leetcode/',
        origin: 'https://leetcode-3d8.pages.dev'
    }
];

async function proxyMiddleware({ request }, next) {
    const url = new URL(request.url);

    for (const { prefix, origin } of PROXY_CONFIG) {
        if (url.pathname.startsWith(prefix)) {
            const pathname = url.pathname.slice(prefix.length) || '/';
            const targetUrl = new URL(pathname + url.search, origin);

            const headers = new Headers(request.headers);
            headers.delete('host');
            // 告诉上游：我（Worker）需要解压后的内容，方便我处理或添加缓存头
            headers.set('Accept-Encoding', 'identity');

            try {
                const resp = await fetch(targetUrl.toString(), {
                    method: request.method,
                    headers,
                    redirect: 'follow'
                });

                // 创建新的 Headers，保留上游的 Content-Type 等关键信息
                const newHeaders = new Headers(resp.headers);

                // 🔥 移除上游可能存在的压缩头，由当前的 Cloudflare 边缘重新决定压缩
                newHeaders.delete('Content-Encoding');
                newHeaders.delete('Content-Length');

                // 优化 1：更精准的静态资源缓存控制
                if (pathname.match(/\.(js|css|woff2?|png|jpg|webp)$/)) {
                    newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
                } else {
                    // HTML 建议设置短缓存或不缓存
                    newHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
                }

                // 优化 2：安全头
                newHeaders.set('X-Proxy-By', 'Astro-Worker');

                return new Response(resp.body, {
                    status: resp.status,
                    headers: newHeaders
                });

            } catch (e) {
                return new Response('Proxy Error', { status: 502 });
            }
        }
    }
    return next();
}

/**
 * Middleware for View Counting logic
 */
async function viewCounterMiddleware(context, next) {
    const { request, cookies, locals } = context;
    let viewCount = 0;
    const env = locals.runtime?.env || {};

    if (env && env.VIEWS) {
        try {
            const hasVisitedCookie = cookies.has("has_visited_today");
            const currentCountStr = await env.VIEWS.get("site_views");
            viewCount = currentCountStr ? parseInt(currentCountStr) : 0;

            if (!hasVisitedCookie) {
                viewCount++;
                await env.VIEWS.put("site_views", viewCount.toString());
                cookies.set("has_visited_today", "true", {
                    maxAge: 86400,
                    path: "/",
                    httpOnly: true,
                    secure: true,
                    sameSite: "lax",
                });
            }
        } catch (e) {
            console.error("KV Error:", e);
        }
    } else {
        viewCount = 8888; // Dev fallback
    }

    locals.viewCount = viewCount;
    return next();
}

export const onRequest = sequence(proxyMiddleware, viewCounterMiddleware);
