import { projects } from '@/data/projects';
import { getStaticSummaries } from '@/lib/blog-catalog';
import { queryPublicPosts, type PostSummary } from '@/lib/public-posts';

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
        console.error('LLMs index catalog query:',error);
        return new Response('Index temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});
    }

    // projects is a static array imported from "@/data/projects"

    const aboutMeContent = `<p align="center">
  <image width="350" src="https://cdn.shopify.com/s/files/1/0583/5810/4213/files/8b116889-af12-4694-afa0-08a9a5919a62.webp?v=1766544591&width=600" />
</p>

## 👨‍💻 About Me

我是一名 **资深 Web 前端工程师**，长期深耕于前端工程体系，目前主要方向是 **Shopify 独立站开发**。 
同时，我持续跟进 **AI 编程** 与 **Serverless（尤其是 Cloudflare 生态）**，将其视为下一代工程效率与系统边界的核心变量。


### **Frontend / Shopify / Cloudflare / AI Programming**

- 🔭 React / Vue / Electron / WeChat Mini Games
- ⚙️ Shopify (Themes / Apps / Custom Integrations)
- 🧠 Cloudflare Workers / Pages
- 🤖 AI-assisted Development / Frontend Productivity


<img src="https://skillicons.dev/icons?i=html,css,js,react,remix,vue,nodejs,electron,cloudflare,workers,docker,linux,ai" />


<image src="https://readmestats.999857.xyz/api/top-langs/?username=ErpanOmer&layout=compact" />


### **📫 How to reach me:**

- **E-mail：** erpanomer@gmail.com
- **WebSite：** [https://erpanomer.nurverse.com](https://erpanomer.nurverse.com)`;

    const siteTitle = "ErpanOmer's Corner";
    const siteDescription =
        "ErpanOmer's personal website containing blog posts and projects.";

    let content = `# ${siteTitle}\n\n`;
    content += `> ${siteDescription}\n\n`;

    content += `## About Me\n\n`;
    content += `${aboutMeContent}\n\n`;

    content += `## Projects\n\n`;
    if (projects.length > 0) {
        for (const project of projects) {
            content += `- [${project.title}](${project.link || "#"})\n`;
            content += `  - ${project.description}\n`;
            if (project.tags && project.tags.length > 0) {
                content += `  - Tags: ${project.tags.join(", ")}\n`;
            }
        }
    } else {
        content += "No projects listed.\n";
    }
    content += `\n`;

    content += `## Blog Posts\n\n`;
    if (allPosts.length > 0) {
        for (const post of allPosts) {
            content += `- [${post.title}](/blog/${post.slug})\n`;
            content += `  - ${post.description}\n`;
            if (post.pubDate) {
                content += `  - Published: ${post.pubDate}\n`
            }
        }
    } else {
        content += "No blog posts found.\n";
    }

    return new Response(content, {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}
