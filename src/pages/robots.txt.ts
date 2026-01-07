import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
Sitemap: https://erpanomer.nurverse.com/projects/leetcode/sitemap.xml
Sitemap: https://erpanomer.nurverse.com/projects/learning/sitemap.xml
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  return new Response(getRobotsTxt(sitemapURL));
};