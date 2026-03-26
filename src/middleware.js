/**
 * Middleware for site view counting:
 * - Count only HTML document requests on known content routes.
 * - Skip counting for non-200 responses.
 * - Return 404 immediately for blocked scanner/crawler user agents.
 */
const SITE_VIEW_KEY = "site_views";
const VISITOR_ID_COOKIE = "visitor_id";
const SITE_VIEW_COOKIE = "has_visited_today";

const VISITOR_ID_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const SITE_VIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 1; // 1 days

const CONTENT_ROUTE_PREFIXES = ["/about-me", "/blog", "/projects", "/tools"];
const STATIC_ASSET_EXT_RE =
    /\.(?:avif|bmp|css|gif|ico|jpe?g|js|json|map|mjs|png|svg|txt|webmanifest|webp|woff2?|xml)$/i;

// Compact deny-list: includes user-requested signatures + common scanner probes.
const BLOCKED_UA_KEYWORDS = [
    "curl",
    "wget",
    "python",
    "go-http-client",
    "libwww",
    "sqlmap",
    "nikto",
    "nmap",
    "masscan",
    "zgrab",
    "scrapy",
    "crawler",
    "acunetix",
    "nessus",
    "openvas",
    "dirbuster",
    "gobuster",
    "wpscan",
    "whatweb",
    "nuclei",
    "jaeles",
    "httprobe",
    "feroxbuster",
    "ffuf",
    "arachni",
];

function normalizePath(pathname) {
    if (pathname.length > 1 && pathname.endsWith("/")) {
        return pathname.slice(0, -1);
    }
    return pathname;
}

function isKnownContentPath(pathname) {
    const path = normalizePath(pathname);
    if (path === "/") return true;

    return CONTENT_ROUTE_PREFIXES.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    );
}

function isHtmlDocumentRequest(request, pathname) {
    if (request.method !== "GET") return false;
    if (pathname.startsWith("/api/")) return false;
    if (STATIC_ASSET_EXT_RE.test(pathname)) return false;

    const accept = request.headers.get("accept") || "";
    if (!accept.includes("text/html")) return false;

    const secFetchDest = request.headers.get("sec-fetch-dest");
    if (secFetchDest && secFetchDest !== "document") return false;

    const secFetchMode = request.headers.get("sec-fetch-mode");
    if (secFetchMode && secFetchMode !== "navigate") return false;

    return true;
}

function isBlockedUserAgent(userAgent) {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    return BLOCKED_UA_KEYWORDS.some((keyword) => ua.includes(keyword));
}

function getOrCreateVisitorId(cookies) {
    let visitorId = cookies.get(VISITOR_ID_COOKIE)?.value;
    if (visitorId) return visitorId;

    visitorId = crypto.randomUUID();
    cookies.set(VISITOR_ID_COOKIE, visitorId, {
        path: "/",
        maxAge: VISITOR_ID_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
    });

    return visitorId;
}

async function viewCounterMiddleware(context, next) {
    const { request, cookies, locals } = context;
    const env = locals.runtime?.env || {};
    const { pathname } = new URL(request.url);
    const userAgent = request.headers.get("user-agent") || "";
    const isBlockedUa = isBlockedUserAgent(userAgent);

    if (isBlockedUa) {
        return new Response("Not Found", {
            status: 404,
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }

    const isHtmlRequest = isHtmlDocumentRequest(request, pathname);
    const isKnownContentRequest = isHtmlRequest && isKnownContentPath(pathname);
    const isStatsApiRequest = pathname.startsWith("/api/stats/");

    locals.viewCount = 0;

    // visitorId is used by page render and /api/stats interactions.
    if (isKnownContentRequest || isStatsApiRequest) {
        locals.visitorId = getOrCreateVisitorId(cookies);
    }

    let currentViewCount = 0;
    let canWriteSiteView = false;

    if (env?.VIEWS && isKnownContentRequest) {
        try {
            const currentCountStr = await env.VIEWS.get(SITE_VIEW_KEY);
            const parsed = Number.parseInt(currentCountStr || "0", 10);
            currentViewCount = Number.isFinite(parsed) ? parsed : 0;
            locals.viewCount = currentViewCount;
            canWriteSiteView = true;
        } catch (error) {
            console.error("KV Error:", error);
        }
    } else if (!env?.VIEWS && isKnownContentRequest) {
        locals.viewCount = 8888; // Dev fallback
    }

    const response = await next();

    if (
        canWriteSiteView &&
        isKnownContentRequest &&
        response.status === 200 &&
        !cookies.has(SITE_VIEW_COOKIE)
    ) {
        try {
            await env.VIEWS.put(SITE_VIEW_KEY, String(currentViewCount + 1));
            cookies.set(SITE_VIEW_COOKIE, "true", {
                maxAge: SITE_VIEW_COOKIE_MAX_AGE,
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "lax",
            });
        } catch (error) {
            console.error("KV Error:", error);
        }
    }

    return response;
}

export const onRequest = viewCounterMiddleware;
