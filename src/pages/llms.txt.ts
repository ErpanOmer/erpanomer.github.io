import { getCollection } from "astro:content";
import { projects } from "@/data/projects";

export async function GET() {
    const blogEntries = await getCollection("blog", ({ data }) => {
        return !data.draft;
    });

    // projects is a static array imported from "@/data/projects"

    const sortedBlogEntries = blogEntries.sort(
        (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
    );

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
    if (sortedBlogEntries.length > 0) {
        for (const post of sortedBlogEntries) {
            content += `- [${post.data.title}](/blog/${post.slug})\n`;
            content += `  - ${post.data.description}\n`;
            if (post.data.pubDate) {
                content += `  - Published: ${post.data.pubDate.toISOString().split('T')[0]}\n`
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
