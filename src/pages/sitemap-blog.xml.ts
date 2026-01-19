import { getCollection } from "astro:content";
import { projects } from "@/data/projects";

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

export async function GET() {
    const blogEntries = await getCollection("blog", ({ data }) => {
        return !data.draft;
    });

    const sortedBlogEntries = blogEntries.sort(
        (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

    // Blog Posts
    for (const post of sortedBlogEntries) {
        xml += `<url>`;
        xml += `<loc>${escapeXml(`${SITE_URL}/blog/${post.slug}`)}</loc>`;
        xml += `<lastmod>${(post.data.updatedDate || post.data.pubDate).toISOString()}</lastmod>`;
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
