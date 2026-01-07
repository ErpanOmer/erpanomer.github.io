

/**
 * Middleware for View Counting logic
 */
async function viewCounterMiddleware(context, next) {
    const { request, cookies, locals } = context;
    let viewCount = 0;
    const env = locals.runtime?.env || {};

    // Visitor ID Logic
    let visitorId = cookies.get("visitor_id")?.value;

    if (!visitorId) {
        visitorId = crypto.randomUUID();
        cookies.set("visitor_id", visitorId, {
            path: "/",
            maxAge: 31536000, // 1 year
            httpOnly: true,
            secure: true,
            sameSite: "Lax"
        });
    }
    locals.visitorId = visitorId;

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

export const onRequest = viewCounterMiddleware;
