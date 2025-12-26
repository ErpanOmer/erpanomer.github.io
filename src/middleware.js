export async function onRequest(context, next) {
    const { request, cookies, locals } = context;
    let viewCount = 0;
    const env = context.locals.runtime.env || {};

    if (env && env.VIEWS) {
        try {
            // Optimization: Check for session cookie first to avoid KV reads
            const hasVisitedCookie = cookies.has("has_visited_today");

            // Always need to read the current count to display it
            const currentCountStr = await env.VIEWS.get("site_views");
            const currentCount = currentCountStr ? parseInt(currentCountStr) : 0;
            viewCount = currentCount;

            if (!hasVisitedCookie) {
                const ip = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
                const visitorKey = `visitor:${ip}`;

                // Double check KV to be sure
                const hasVisitedKV = await env.VIEWS.get(visitorKey);

                if (!hasVisitedKV) {
                    // Truly new visitor
                    viewCount++;
                    // Update global count
                    await env.VIEWS.put("site_views", viewCount.toString());
                    // Mark IP in KV (24h)
                    await env.VIEWS.put(visitorKey, "1", { expirationTtl: 86400 });
                }

                // Set cookie to avoid KV IP check next time (24h)
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
            // Fallback
        }
    } else {
        // Local development fallback
        viewCount = 8888;
    }

    // Attach to locals so components can read it
    locals.viewCount = viewCount;

    return next();
}
