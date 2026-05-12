/**
 * Admin API authentication utility.
 * Validates Bearer token from Authorization header against WEBSITE_ADMIN_TOKEN secret.
 * In local dev (localhost), allows a fallback dev token if no secret is configured.
 */

const DEV_TOKEN = 'dev-website-admin-token';

interface AdminAuthEnv {
    WEBSITE_ADMIN_TOKEN?: string;
}

/**
 * Validates admin authentication.
 * Returns a Response (401) if auth fails, or null if auth succeeds.
 */
export function requireAdmin(request: Request, env: AdminAuthEnv): Response | null {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
            JSON.stringify({ success: false, message: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const token = authHeader.slice(7).trim();

    // Check against configured secret
    if (env.WEBSITE_ADMIN_TOKEN && token === env.WEBSITE_ADMIN_TOKEN) {
        return null; // Auth success
    }

    // Fallback: allow dev token on localhost only
    if (!env.WEBSITE_ADMIN_TOKEN || isLocalhost(request)) {
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
