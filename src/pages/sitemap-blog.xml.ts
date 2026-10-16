import { projects } from '@/data/projects';
import { getStaticSummaries } from '@/lib/blog-catalog';
import { queryPublicPosts, type PostSummary } from '@/lib/public-posts';

const SITE_URL = "https://erpanomer.nurverse.com";

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

export async function GET(context: any) {
    const staticPosts = await getStaticSummaries();
    const allPosts: PostSummary[] = [];
    let cursor: string | undefined;
    try {
        do {
            const page = await queryPublicPosts(context.locals.runtime?.env?.BLOG_DB, staticPosts,
                { q:'',tag:'',sort:'latest',includeMeta:false,cursor },
                { allowMissingTable:import.meta.env.DEV,limit:100 });
            allPosts.push(...page.items);
            cursor = page.nextCursor || undefined;
        } while (cursor);
    } catch (error) {
        console.error('Sitemap catalog query:',error);
        return new Response('Sitemap temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

    // Blog Posts
    for (const post of allPosts) {
        const lastmod = new Date(post.lastModified || post.pubDate);

        xml += `<url>`;
        xml += `<loc>${escapeXml(`${SITE_URL}/blog/${post.slug}`)}</loc>`;
        xml += `<lastmod>${lastmod.toISOString()}</lastmod>`;
        xml += `</url>`;
    }

    // Projects (Internal Links only, excluding learning and leetcode)
    if (projects.length > 0) {
        for (const project of projects) {
            if (project.link && project.link.startsWith("/")) {
                // Exclude specific project paths
                if (project.link === "/projects/learning/" || project.link === "/projects/leetcode/") {
                    continue;
                }

                xml += `<url>`;
                xml += `<loc>${escapeXml(`${SITE_URL}${project.link}`)}</loc>`;
                xml += `<lastmod>${new Date().toISOString()}</lastmod>`;
                xml += `</url>`;
            }
        }
    }

    xml += `</urlset>`;

    return new Response(xml.trim(), {
        status: 200,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
        },
    });
}
