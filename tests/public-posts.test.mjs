import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { queryPublicPosts, queryPublicPostMetadata, parseCatalogOptions, CatalogInputError } from '../src/lib/public-posts.ts';
import { renderPostCard } from '../src/lib/post-card.ts';

const options = (overrides={}) => ({ q:'',tag:'',sort:'latest',includeMeta:true,...overrides });
const summary = (slug, overrides={}) => ({ slug,title:`Static ${slug}`,description:'Static description',pubDate:'2026-01-01T00:00:00.123Z',lastModified:null,author:'Author',cover:null,tags:['前端','AI'],views:null,likes:null,...overrides });

function fixture() {
    const sqlite = new DatabaseSync(':memory:');
    sqlite.exec(`CREATE TABLE posts (slug TEXT PRIMARY KEY,title TEXT,description TEXT,pub_date INTEGER,last_modified INTEGER,author TEXT,cover TEXT,tags TEXT,draft INTEGER DEFAULT 1,views INTEGER DEFAULT 0,likes INTEGER DEFAULT 0,deleted_at INTEGER,content TEXT,html_content TEXT)`);
    const queries=[];
    const db={
        prepare(sql) { queries.push(sql);return { bind(...args){return {sql,args};} }; },
        async batch(statements){return statements.map(({sql,args})=>({results:sqlite.prepare(sql).all(...args),success:true}));},
    };
    const insert=(slug,values={})=>{
        const row={slug,title:`Database ${slug}`,description:'A practical article',pub_date:Date.UTC(2026,0,1)+123,last_modified:null,author:'Author',cover:null,tags:'["前端","AI"]',draft:0,views:10,likes:2,deleted_at:null,content:'PRIVATE BODY',html_content:'<p>PRIVATE HTML</p>',...values};
        sqlite.prepare(`INSERT INTO posts (${Object.keys(row).join(',')}) VALUES (${Object.keys(row).map(()=>'?').join(',')})`).run(...Object.values(row));
    };
    return {sqlite,db,insert,queries};
}

test('merges summaries, excludes unpublished/deleted articles and handles legacy statistics rows',async()=>{
    const {sqlite,db,insert,queries}=fixture();
    try {
        insert('merged',{title:'D1 title',tags:'["AI","AI","  前端  ",null,42]',views:25});
        insert('draft',{draft:1});insert('deleted',{deleted_at:1});
        insert('legacy',{title:null,draft:1,tags:null,views:8});
        insert('db-only',{tags:'broken json'});
        insert('db-object',{tags:'{"hidden":"not a tag"}'});
        const staticPosts=['static','merged','draft','deleted','legacy'].map(slug=>summary(slug));
        const page=await queryPublicPosts(db,staticPosts,options());
        assert.equal(page.meta.total,5);
        assert.deepEqual(new Set(page.items.map(post=>post.slug)),new Set(['static','merged','legacy','db-only','db-object']));
        assert.equal(page.items.find(post=>post.slug==='merged').title,'D1 title');
        assert.equal(page.items.find(post=>post.slug==='legacy').title,'Static legacy');
        assert.equal(page.items.find(post=>post.slug==='legacy').views,8);
        assert.deepEqual(page.items.find(post=>post.slug==='merged').tags,['AI','前端']);
        assert.deepEqual(page.items.find(post=>post.slug==='db-only').tags,[]);
        assert.equal(page.meta.tags.find(tag=>tag.name==='AI').count,3);
        assert.equal(page.meta.views,53);
        assert.equal(page.items[0].pubDate,'2026-01-01T00:00:00.123Z');
        assert.ok(queries.every(sql=>! /\b(content|html_content)\b/.test(sql)));
        assert.ok(page.items.every(post=>!('content' in post)&&!('htmlContent' in post)&&!('draft' in post)));
    } finally {sqlite.close();}
});

test('keyset pagination covers more than 200 records, including tied dates and metrics in every sort',async()=>{
    const {sqlite,db,insert}=fixture();
    try {
        for(let i=0;i<247;i++) insert(`post-${String(i).padStart(3,'0')}`,{views:i%7,likes:i%3,pub_date:Date.UTC(2026,0,1)+(i%5)*1000+123});
        for(const sort of ['latest','views','likes']) {
            const slugs=[];let cursor;
            do {
                const page=await queryPublicPosts(db,[summary('static-only')],options({sort,cursor,includeMeta:!cursor}));
                assert.ok(page.items.length<=12);
                if(!cursor)assert.equal(page.meta.total,248);
                else assert.equal(page.meta,undefined);
                slugs.push(...page.items.map(post=>post.slug));cursor=page.nextCursor||undefined;
            } while(cursor);
            assert.equal(slugs.length,248);assert.equal(new Set(slugs).size,248);
        }
    } finally {sqlite.close();}
});

test('search and exact tag filters share count rules and bind literal input',async()=>{
    const {sqlite,db,insert}=fixture();
    try {
        insert('one',{title:'AI 应用与 Cloudflare',tags:'["AI","前端"]'});
        insert('two',{title:'Other',description:'AI application',tags:'["AI Agent"]'});
        const page=await queryPublicPosts(db,[],options({q:'cloudflare',tag:'AI'}));
        assert.equal(page.meta.matchingTotal,1);assert.equal(page.items[0].slug,'one');
        assert.equal(page.meta.total,2);
        const injection=await queryPublicPosts(db,[],options({q:"' OR 1=1 --"}));
        assert.equal(injection.items.length,0);
        const literal=await queryPublicPosts(db,[],options({q:'%'}));
        assert.equal(literal.items.length,0);
        const exact=await queryPublicPosts(db,[],options({tag:'AI'}));assert.equal(exact.items.length,1);
    } finally {sqlite.close();}
});

test('validates cursor scope, query size, sort and corrupted cursors',async()=>{
    for(const params of [new URLSearchParams({cursor:'invalid'}),new URLSearchParams({sort:'random'}),new URLSearchParams({q:'a'.repeat(101)})]) {
        assert.throws(()=>parseCatalogOptions(params),CatalogInputError);
    }
    const posts=Array.from({length:25},(_,i)=>summary(`static-${i}`));
    const first=await queryPublicPosts(undefined,posts,options());
    await assert.rejects(()=>queryPublicPosts(undefined,posts,options({tag:'AI',cursor:first.nextCursor})),CatalogInputError);
});

test('static fallback paginates without invented statistics; missing-table and outage rules are distinct',async()=>{
    const posts=Array.from({length:25},(_,i)=>summary(`static-${String(i).padStart(2,'0')}`));
    const first=await queryPublicPosts(undefined,posts,options());
    assert.equal(first.items.length,12);assert.equal(first.meta.total,25);assert.equal(first.meta.views,null);
    assert.ok(first.items.every(post=>post.views===null));
    const second=await queryPublicPosts(undefined,posts,options({cursor:first.nextCursor}));
    assert.equal(second.items.length,12);assert.notEqual(second.items[0].slug,first.items[0].slug);
    const missing={prepare(sql){return{bind(){return sql;}};},async batch(){throw new Error('D1_ERROR: no such table: posts');}};
    const missingFirst=await queryPublicPosts(missing,posts,options(),{allowMissingTable:true});
    const missingNext=await queryPublicPosts(missing,posts,options({cursor:missingFirst.nextCursor}),{allowMissingTable:true});
    assert.equal(missingNext.items.length,12);
    await assert.rejects(()=>queryPublicPosts(missing,posts,options(),{allowMissingTable:false}),/no such table/);
    const outage={...missing,async batch(){throw new Error('Network down');}};
    await assert.rejects(()=>queryPublicPosts(outage,posts,options(),{allowMissingTable:true}),/Network down/);
    const {sqlite,db,insert}=fixture();
    try {
        for(let i=0;i<13;i++)insert(`live-${i}`);
        const combined=await queryPublicPosts(db,[],options());
        await assert.rejects(()=>queryPublicPosts(undefined,posts,options({cursor:combined.nextCursor})),/unavailable/);
        await assert.rejects(()=>queryPublicPosts(db,posts,options({cursor:first.nextCursor})),CatalogInputError);
    } finally {sqlite.close();}
});

test('normalizes second, millisecond and ISO dates without dropping time precision',async()=>{
    const {sqlite,db,insert}=fixture();
    try {
        insert('seconds',{pub_date:1767225600});
        insert('milliseconds',{pub_date:1767225600123});
        insert('iso',{pub_date:'2026-01-01T00:00:00.456Z'});
        const page=await queryPublicPosts(db,[],options());
        assert.deepEqual(page.items.map(post=>post.slug),['iso','milliseconds','seconds']);
        assert.equal(page.items[0].pubDate,'2026-01-01T00:00:00.456Z');
    } finally {sqlite.close();}
});

test('searches decoded JSON tags, not JSON escape sequences or non-string tag values',async()=>{
    const {sqlite,db,insert}=fixture();
    try {
        insert('escaped',{title:'Example',tags:'["\\u4e2d\\u6587",42,null]'});
        const found=await queryPublicPosts(db,[],options({q:'中文'}));
        assert.equal(found.items.length,1);
        const hiddenValue=await queryPublicPosts(db,[],options({q:'42'}));
        assert.equal(hiddenValue.items.length,0);
    } finally {sqlite.close();}
});

test('renders untrusted summary text safely and rejects script image URLs',()=>{
    const html=renderPostCard(summary('example',{title:'<script>alert(1)</script>',description:'" onmouseover="bad',cover:'javascript:alert(1)',tags:['<b>AI</b>']}));
    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(!html.includes('src="javascript:'));
    assert.ok(html.includes('&lt;b&gt;AI&lt;/b&gt;'));
});

test('UTF-8 cursors support maximum-length Chinese searches, tags and long slugs',async()=>{
    const q='文'.repeat(100),tag='签'.repeat(100);
    const posts=Array.from({length:13},(_,i)=>summary('文'.repeat(490)+i,{title:q,tags:[tag]}));
    const first=await queryPublicPosts(undefined,posts,options({q,tag}));
    assert.ok(first.nextCursor.length<4096);
    const parsed=parseCatalogOptions(new URLSearchParams({q,tag,cursor:first.nextCursor}));
    const next=await queryPublicPosts(undefined,posts,parsed);
    assert.equal(next.items.length,1);
});


test('metadata-only reads match listing aggregates without selecting article summaries', async () => {
    const { sqlite, db, insert, queries } = fixture();
    try {
        insert('published'); insert('draft', { draft: 1 }); insert('deleted', { deleted_at: 1 });
        const posts = [summary('static-only'), summary('draft'), summary('deleted')];
        const opts = options({ q: 'practical', tag: 'AI' });
        const page = await queryPublicPosts(db, posts, opts);
        queries.length = 0;
        const metadata = await queryPublicPostMetadata(db, posts, opts);
        assert.deepEqual(metadata.meta, page.meta);
        assert.equal(metadata.source, 'combined');
        assert.equal(queries.length, 1);
        assert.ok(!queries[0].includes('LIMIT'));
        assert.equal((await queryPublicPostMetadata(db, [], options({ q: 'no-match' }))).meta.matchingTotal, 0);
    } finally { sqlite.close(); }
    const fallback = await queryPublicPostMetadata(undefined, [summary('static')], options());
    assert.equal(fallback.source, 'static');
    assert.equal(fallback.meta.total, 1);
    assert.equal(fallback.meta.views, null);
    const missing = { prepare(sql) { return { bind() { return sql; } }; }, async batch() { throw new Error('no such table: posts'); } };
    assert.equal((await queryPublicPostMetadata(missing, [], options(), { allowMissingTable: true })).source, 'static');
    await assert.rejects(() => queryPublicPostMetadata(missing, [], options()), /no such table/);
});
