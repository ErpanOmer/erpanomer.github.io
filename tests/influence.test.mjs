import { test } from 'node:test';
import assert from 'node:assert/strict';
import { combineInfluenceStats } from '../src/lib/influence.ts';

const social = () => ({
    totals:{view_count:1000,follower_count:50,article_count:30,like_count:80,favorite_count:15},
    coverage:{view_count:7,follower_count:7,article_count:7,like_count:7,favorite_count:6},
});
test('adds website article reads, likes and articles exactly once without changing other metrics or the platform response',()=>{
    const original=social();
    const snapshot=structuredClone(original);
    const result=combineInfluenceStats(original,{total:12,views:345,likes:23});
    assert.deepEqual(result.totals,{view_count:1345,follower_count:50,article_count:42,like_count:103,favorite_count:15});
    assert.equal(result.coverage.view_count,8);
    assert.deepEqual(original,snapshot);
    assert.deepEqual(combineInfluenceStats(original,{total:12,views:345,likes:23}),result);
});
test('unavailable website metrics do not invent counts; existing external totals remain usable',()=>{
    const original=social();
    assert.deepEqual(combineInfluenceStats(original,null),original);
    const partial=combineInfluenceStats(original,{total:12,views:null,likes:null});
    assert.equal(partial.totals.article_count,42);
    assert.equal(partial.totals.view_count,1000);
    assert.equal(partial.coverage.like_count,7);
});
test('website totals remain available when external platforms are unavailable',()=>{
    const zero={view_count:0,follower_count:0,article_count:0,like_count:0,favorite_count:0};
    const result=combineInfluenceStats({totals:zero,coverage:zero},{total:12,views:345,likes:23});
    assert.equal(result.totals.view_count,345);
    assert.equal(result.coverage.view_count,1);
    assert.equal(result.coverage.follower_count,0);
});
