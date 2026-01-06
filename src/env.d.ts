/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@astrojs/cloudflare" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type ENV = {
    VIEWS: KVNamespace;
    BLOG_DB: D1Database;
};

type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;

declare namespace App {
    interface Locals extends Runtime {
        viewCount?: number;
    }
}
