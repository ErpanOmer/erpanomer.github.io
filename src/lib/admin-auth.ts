/**
 * Admin API authentication utility.
 * Validates Bearer token from Authorization header against WEBSITE_ADMIN_TOKEN secret.
 * In local dev (localhost), allows a fallback dev token if no secret is configured.
 */

const DEV_TOKEN = 'dev-website-admin-token';

interface AdminAuthEnv {
    WEBSITE_ADMIN_TOKEN?: any;
}

/**
 * Validates admin authentication.
 * Returns a Response (401) if auth fails, or null if auth succeeds.
 */
export async function requireAdmin(request: Request, env: AdminAuthEnv): Promise<Response | null> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
            JSON.stringify({ success: false, message: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const token = authHeader.slice(7).trim();
    // Check if we are in local development environment (Astro dev server)
    const isDevEnv = import.meta.env.DEV;
    const WEBSITE_ADMIN_TOKEN = isDevEnv ? DEV_TOKEN : (await env.WEBSITE_ADMIN_TOKEN.get());

    // Check against configured secret
    if (WEBSITE_ADMIN_TOKEN && token === WEBSITE_ADMIN_TOKEN) {
        return null; // Auth success
    }

    // Fallback: allow dev token on localhost only
    if (!WEBSITE_ADMIN_TOKEN || isLocalhost(request)) {
        if (token === DEV_TOKEN && isLocalhost(request)) {
            return null; // Auth success with dev token
        }
    }

    return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
}

function isLocalhost(request: Request): boolean {
    const url = new URL(request.url);
    const host = url.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}
