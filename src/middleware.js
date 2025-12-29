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
                // Truly new visitor (based on cookie)
                viewCount++;
                // Update global count
                await env.VIEWS.put("site_views", viewCount.toString());

                // Set cookie to avoid counting again today (24h)
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
