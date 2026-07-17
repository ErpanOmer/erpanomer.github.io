/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@astrojs/cloudflare" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type Fetcher = import("@cloudflare/workers-types").Fetcher;
type ENV = {
    VIEWS: KVNamespace;
    BLOG_DB: D1Database;
    JUEJIN_KV: KVNamespace;
    GET_FANS_WORKER: Fetcher;
    WEBSITE_ADMIN_TOKEN: any;
};

type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;

declare namespace App {
    interface Locals extends Runtime {
        viewCount?: number;
        visitorId?: string;
    }
}
