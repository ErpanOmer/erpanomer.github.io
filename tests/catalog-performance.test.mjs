import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { Miniflare } from 'miniflare';

test('native D1 catalog reads grow linearly and a Workers cache hit performs no SQL', async () => {
    const bundle = await build({
        stdin: { resolveDir: process.cwd(), sourcefile: 'catalog-performance-worker.ts', contents: `
            import { queryPublicPosts } from './src/lib/public-posts.ts';
            import { readCatalogCache } from './src/lib/catalog-cache.ts';
            export default { async fetch(request, env) {
                const url = new URL(request.url);
                const size = Number(url.searchParams.get('static') || 20);
                const staticPosts = Array.from({ length: size }, (_, i) => ({
                    slug: i < 10 ? 'post-' + i : 'static-' + i, title: 'Static ' + i,
                    description: 'Static summary', pubDate: '2025-01-01T00:00:00.000Z',
                    lastModified: null, author: 'Author', cover: null, tags: ['Static'], views: null, likes: null,
                }));
                let rowsRead = 0, statements = 0;
                const db = { prepare: sql => env.DB.prepare(sql), async batch(batch) {
                    const results = await env.DB.batch(batch);
                    statements += batch.length;
                    rowsRead += results.reduce((sum, result) => sum + result.meta.rows_read, 0);
                    return results;
                } };
                const page = await readCatalogCache({ origin: url.origin, open: () => caches.open('catalog-test') },
                    ['page', staticPosts], () => queryPublicPosts(db, staticPosts,
                        { q: '', tag: '', sort: 'latest', includeMeta: true }));
                return Response.json({ page, rowsRead, statements });
            } };
        ` },
        bundle: true, format: 'esm', platform: 'browser', write: false,
    });
    const mf = new Miniflare({ modules: true, script: bundle.outputFiles[0].text, d1Databases: { DB: 'catalog-performance-test' } });
    try {
        const db = await mf.getD1Database('DB');
        await db.exec(`CREATE TABLE posts (slug TEXT PRIMARY KEY,title TEXT,description TEXT,pub_date INTEGER,last_modified INTEGER,author TEXT,cover TEXT,tags TEXT,draft INTEGER DEFAULT 1,views INTEGER DEFAULT 0,likes INTEGER DEFAULT 0,deleted_at INTEGER,content TEXT,html_content TEXT); CREATE INDEX recent ON posts(draft,deleted_at,pub_date DESC); CREATE INDEX popular ON posts(draft,deleted_at,views DESC,pub_date DESC);`);
        await db.batch(Array.from({ length: 250 }, (_, i) => db.prepare(
            'INSERT INTO posts (slug,title,description,pub_date,tags,draft,views,likes,content) VALUES (?,?,?,?,?,0,?,?,?)'
        ).bind(`post-${i}`, `Post ${i}`, 'Cloudflare and AI', Date.UTC(2026, 0, 1) + i * 1000,
            JSON.stringify(['AI', `tag-${i % 20}`]), i % 31, i % 7, 'PRIVATE ARTICLE BODY')));

        const cold = await (await mf.dispatchFetch('https://test.example/catalog')).json();
        assert.equal(cold.page.items.length, 12);
        assert.equal(cold.page.meta.total, 260);
        assert.equal(cold.statements, 2);
        assert.ok(cold.rowsRead < 5000, `Cold catalog read ${cold.rowsRead} rows; correlated JSON scans have returned`);
        assert.ok(!JSON.stringify(cold.page).includes('PRIVATE ARTICLE BODY'));
        const warm = await (await mf.dispatchFetch('https://test.example/catalog')).json();
        assert.deepEqual(warm.page, cold.page);
        assert.equal(warm.rowsRead, 0);
        assert.equal(warm.statements, 0);

        const larger = await (await mf.dispatchFetch('https://test.example/catalog?static=200')).json();
        assert.equal(larger.page.meta.total, 440);
        assert.ok(larger.rowsRead < cold.rowsRead * 3, `10x static input read ${larger.rowsRead} rows; expected linear growth`);
        console.log(`D1 rows read: cold=${cold.rowsRead}, cached=${warm.rowsRead}, 10x static summaries=${larger.rowsRead}`);
    } finally {
        await mf.dispose();
    }
});
