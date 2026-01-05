import type { ProxyTarget } from '@/config/proxyConfig';
import { PROXY_CONFIG, getCacheRule } from '@/config/proxyConfig';

export interface ProxyResponse {
    response: Response;
    error?: never;
}

export interface ProxyError {
    response?: never;
    error: string;
    statusCode: number;
}

export type ProxyResult = ProxyResponse | ProxyError;

interface RateLimitInfo {
    count: number;
    resetTime: number;
}

const ERROR_MESSAGES = {
    METHOD_NOT_ALLOWED: 'Only GET requests are allowed',
    URI_TOO_LONG: 'Request URI too long',
    RATE_LIMITED: 'Too many requests, please try again later',
    TIMEOUT: 'Request timeout',
    NETWORK_ERROR: 'Network error',
    PROXY_ERROR: 'Proxy error',
    INVALID_TARGET: 'Invalid proxy target',
};

async function getRateLimitInfo(env: any, clientIP: string): Promise<RateLimitInfo> {
    const key = `rate_limit:${clientIP}`;
    const now = Date.now();
    
    try {
        const data = await env.RATE_LIMIT?.get(key);
        if (data) {
            const info = JSON.parse(data) as RateLimitInfo;
            if (now > info.resetTime) {
                return { count: 0, resetTime: now + 60000 };
            }
            return info;
        }
    } catch (e) {
        console.error('Failed to get rate limit info:', e);
    }
    
    return { count: 0, resetTime: now + 60000 };
}

async function checkRateLimit(env: any, clientIP: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const info = await getRateLimitInfo(env, clientIP);
    const now = Date.now();
    
    if (now > info.resetTime) {
        info.count = 0;
        info.resetTime = now + 60000;
    }
    
    if (info.count >= PROXY_CONFIG.rateLimitPerMinute) {
        const retryAfter = Math.ceil((info.resetTime - now) / 1000);
        return { allowed: false, retryAfter };
    }
    
    info.count++;
    
    try {
        await env.RATE_LIMIT?.put(
            `rate_limit:${clientIP}`,
            JSON.stringify(info),
            { expirationTtl: 60 }
        );
    } catch (e) {
        console.error('Failed to update rate limit info:', e);
    }
    
    return { allowed: true };
}

function getClientIP(request: Request): string {
    const cfIP = request.headers.get('CF-Connecting-IP');
    if (cfIP) return cfIP;
    
    const xForwardedFor = request.headers.get('X-Forwarded-For');
    if (xForwardedFor) {
        return xForwardedFor.split(',')[0].trim();
    }
    
    return 'unknown';
}

function getFileExtension(url: string): string {
    const pathname = new URL(url).pathname;
    const lastDot = pathname.lastIndexOf('.');
    if (lastDot === -1) return '';
    return pathname.slice(lastDot + 1).toLowerCase();
}

function buildCacheControlHeaders(extension: string, contentType: string): string {
    const rule = getCacheRule(extension, contentType);
    
    if (rule) {
        const parts = [`public, max-age=${rule.maxAge}`];
        if (rule.immutable) {
            parts.push('immutable');
        }
        return parts.join(', ');
    }
    
    return 'public, max-age=0, must-revalidate';
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (e) {
        clearTimeout(timeoutId);
        if (e instanceof Error && e.name === 'AbortError') {
            throw new Error(ERROR_MESSAGES.TIMEOUT);
        }
        throw e;
    }
}

export async function proxyRequest(
    request: Request,
    target: ProxyTarget,
    subPath: string,
    env?: any
): Promise<ProxyResult> {
    try {
        if (request.method !== 'GET') {
            return {
                error: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
                statusCode: 405
            };
        }

        const url = new URL(request.url);
        const targetUrl = new URL(subPath + url.search, target.origin);

        if (targetUrl.href.length > PROXY_CONFIG.maxUrlLength) {
            return {
                error: ERROR_MESSAGES.URI_TOO_LONG,
                statusCode: 414
            };
        }

        if (env && env.RATE_LIMIT) {
            const clientIP = getClientIP(request);
            const rateLimitResult = await checkRateLimit(env, clientIP);
            
            if (!rateLimitResult.allowed) {
                console.log(`Rate limit exceeded for IP: ${clientIP}`);
                return {
                    error: ERROR_MESSAGES.RATE_LIMITED,
                    statusCode: 429
                };
            }
        }

        const headers = new Headers(request.headers);
        headers.delete('host');
        headers.set('Accept-Encoding', 'identity');

        const resp = await fetchWithTimeout(
            targetUrl.toString(),
            {
                method: request.method,
                headers,
            },
            PROXY_CONFIG.timeout
        );

        const newHeaders = new Headers(resp.headers);
        newHeaders.delete('Content-Encoding');
        newHeaders.delete('Content-Length');

        const contentType = resp.headers.get('content-type') || '';
        const extension = getFileExtension(targetUrl.href);
        const cacheControl = buildCacheControlHeaders(extension, contentType);
        newHeaders.set('Cache-Control', cacheControl);

        newHeaders.set('X-Proxy-By', 'Astro-SSR');

        console.log(`Proxy request: ${request.method} ${targetUrl.href} -> ${resp.status} (${cacheControl})`);

        return {
            response: new Response(resp.body, {
                status: resp.status,
                headers: newHeaders
            })
        };
    } catch (e) {
        console.error('Proxy error:', e);
        
        if (e instanceof Error) {
            if (e.message === ERROR_MESSAGES.TIMEOUT) {
                return {
                    error: ERROR_MESSAGES.TIMEOUT,
                    statusCode: 504
                };
            }
            
            if (e.message.includes('fetch failed') || e.message.includes('network')) {
                return {
                    error: ERROR_MESSAGES.NETWORK_ERROR,
                    statusCode: 502
                };
            }
        }
        
        return {
            error: ERROR_MESSAGES.PROXY_ERROR,
            statusCode: 502
        };
    }
}
