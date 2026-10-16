import type { PostSummary } from './public-posts';

export function escapeHtml(value: unknown): string {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
export function getPostCoverUrl(value: string | null): string | null {
    if (!value) return null;
    try {
        const url = new URL(value, 'https://erpanomer.nurverse.com');
        return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
}
export function renderPostCard(post: PostSummary, withCover = true): string {
    const date = new Date(post.pubDate);
    const displayDate = Number.isNaN(date.getTime()) ? '未知日期' : date.toLocaleDateString('zh-CN', { year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Shanghai' });
    const href = `/blog/${encodeURIComponent(post.slug)}`;
    const cover = withCover ? getPostCoverUrl(post.cover) : null;
    const count = (value: number | null) => value === null ? '—' : new Intl.NumberFormat('zh-CN').format(value);
    return `<article class="post-row" data-post-slug="${escapeHtml(post.slug)}">
        <div class="post-copy">
            <div class="post-date"><time datetime="${escapeHtml(post.pubDate)}">${displayDate}</time><span>${escapeHtml(post.author)}</span></div>
            <h3><a class="post-title" href="${href}">${escapeHtml(post.title)}</a></h3>
            <p class="post-description">${escapeHtml(post.description)}</p>
            <div class="post-bottom"><div class="post-tags">${post.tags.slice(0,3).map(tag=>`<a href="/blog?tag=${encodeURIComponent(tag)}">${escapeHtml(tag)}</a>`).join('')}</div>
            <div class="post-counts"><span>${count(post.views)} 阅读</span><span>${count(post.likes)} 点赞</span></div></div>
        </div>${cover ? `<a class="post-cover" href="${href}" tabindex="-1" aria-hidden="true"><img src="${escapeHtml(cover)}" alt="" width="320" height="180" loading="lazy" decoding="async" /></a>` : ''}
    </article>`;
}
