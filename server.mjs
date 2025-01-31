import express from 'express';
import adapter from './adapter.mjs';
import { handler as ssrHandler } from './dist/server/entry.mjs';

const app = express();
// 根据 astro.config.mjs 中的 `base` 选项进行更改。
// 它们应该匹配。默认值为"/"。
const base = '/';
app.use(base, express.static('./dist/client/'));
app.use(ssrHandler);

export const handler = adapter(app);