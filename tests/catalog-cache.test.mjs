import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readCatalogCache, CATALOG_CACHE_TTL } from '../src/lib/catalog-cache.ts';

function fixture() {
    const entries = new Map();
    const cache = {
        async match(key) { return entries.get(String(key))?.clone(); },
        async put(key, response) { entries.set(String(key), response.clone()); },
    };
    return { entries, context: { origin: 'https://example.com', open: async () => cache } };
}

test('shared public query results avoid repeat database work; filters, pages and content revisions stay isolated', async () => {
    const { context, entries } = fixture();
    let calls = 0;
    const load = async () => ({ source: 'combined', result: ++calls });
    const key = ['metadata', 'static-revision', '', ''];
    assert.equal((await readCatalogCache(context, key, load)).result, 1);
    assert.equal((await readCatalogCache(context, key, load)).result, 1);
    assert.equal(calls, 1);
    for (const descriptor of [
        ['metadata', 'static-revision', 'AI', ''],
        ['metadata', 'static-revision', '', 'AI'],
        ['metadata', 'new-static-revision', '', ''],
        ['page', 'static-revision', '', '', 'views', '', 12],
        ['page', 'static-revision', '', '', 'latest', 'cursor', 12],
    ]) await readCatalogCache(context, descriptor, load);
    assert.equal(calls, 6);
    assert.equal(entries.size, 6);
    for (const response of entries.values()) assert.equal(response.headers.get('Cache-Control'), `public, max-age=${CATALOG_CACHE_TTL}`);
    await readCatalogCache({ ...context, origin: 'https://other.example.com' }, key, load);
    assert.equal(calls, 7);
});

test('expired entries refresh; errors, static fallbacks and uncached development reads are never retained', async () => {
    const { context, entries } = fixture();
    let calls = 0;
    const load = async () => ({ source: 'combined', result: ++calls });
    await readCatalogCache(context, 'expires', load);
    const [key] = entries.keys();
    entries.set(key, Response.json({ expiresAt: Date.now() - 1, value: { source: 'combined', result: 999 } }));
    assert.equal((await readCatalogCache(context, 'expires', load)).result, 2);
    assert.equal((await readCatalogCache(context, 'expires', load)).result, 2);
    await assert.rejects(() => readCatalogCache(context, 'outage', async () => { throw new Error('D1 unavailable'); }), /D1 unavailable/);
    assert.equal(entries.size, 1);
    let fallbacks = 0;
    const fallback = async () => ({ source: 'static', calls: ++fallbacks });
    await readCatalogCache(context, 'fallback', fallback);
    await readCatalogCache(context, 'fallback', fallback);
    assert.equal(fallbacks, 2);
    assert.equal(entries.size, 1);
    await readCatalogCache(undefined, 'dev', load);
    await readCatalogCache(undefined, 'dev', load);
    assert.equal(calls, 4);
});

test('cache failures bypass the cache while database failures still propagate', async t => {
    t.mock.method(console, 'warn', () => {});
    let calls = 0;
    const load = async () => ({ source: 'combined', result: ++calls });
    const unavailable = { origin: 'https://example.com', open: async () => { throw new Error('Cache unavailable'); } };
    assert.equal((await readCatalogCache(unavailable, 'key', load)).result, 1);
    const { context, entries } = fixture();
    await readCatalogCache(context, 'malformed', load);
    const [key] = entries.keys();
    entries.set(key, new Response('malformed json'));
    assert.equal((await readCatalogCache(context, 'malformed', load)).result, 3);
    const badWriter = { origin: 'https://example.com', open: async () => ({
        async match() {}, async put() { throw new Error('Cache full'); },
    }) };
    assert.equal((await readCatalogCache(badWriter, 'key', load)).result, 4);
    await assert.rejects(() => readCatalogCache(unavailable, 'outage', async () => { throw new Error('D1 failed'); }), /D1 failed/);
});
