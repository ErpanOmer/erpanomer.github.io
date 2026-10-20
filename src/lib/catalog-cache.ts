// Cache public query results, never HTML, cookies, drafts or visitor-specific state.
// Workers Cache API is per data center; no KV reads/writes or database migration are needed.
export const CATALOG_CACHE_TTL = 60;
const CACHE_VERSION = 'public-catalog-v2';

export interface CatalogCacheContext {
    origin: string;
    open: () => Promise<Pick<Cache, 'match' | 'put'>>;
}

export async function readCatalogCache<T extends { source: 'combined' | 'static' }>(
    context: CatalogCacheContext | undefined,
    descriptor: unknown,
    load: () => Promise<T>,
): Promise<T> {
    if (!context) return load();
    let store: Pick<Cache, 'match' | 'put'> | undefined;
    let key: string | undefined;
    try {
        const bytes = new TextEncoder().encode(JSON.stringify([CACHE_VERSION, descriptor]));
        const hash = await crypto.subtle.digest('SHA-256', bytes);
        const digest = Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('');
        key = new URL(`/_catalog-cache/${CACHE_VERSION}/${digest}`, context.origin).href;
        store = await context.open();
        const hit = await store.match(key);
        if (hit?.ok) {
            const entry = await hit.json() as { expiresAt: number; value: T };
            if (entry.expiresAt > Date.now() && entry.value?.source === 'combined') return entry.value;
        }
    } catch (error) {
        // A cache outage must not make a healthy database unavailable.
        console.warn('Public catalog cache read failed:', error);
    }

    const value = await load(); // Database failures propagate; errors/fallbacks are never cached.
    if (store && key && value.source === 'combined') {
        try {
            await store.put(key, Response.json({ expiresAt: Date.now() + CATALOG_CACHE_TTL * 1000, value }, {
                headers: { 'Cache-Control': `public, max-age=${CATALOG_CACHE_TTL}` },
            }));
        } catch (error) {
            console.warn('Public catalog cache write failed:', error);
        }
    }
    return value;
}
