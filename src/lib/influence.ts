import type { CatalogMeta } from './public-posts';
import type { SocialStatsResult } from './social-stats';

/** Include this website once, without mutating the external platform response. */
export function combineInfluenceStats(social: Pick<SocialStatsResult, 'totals' | 'coverage'>, website: CatalogMeta | null) {
    const totals = { ...social.totals };
    const coverage = { ...social.coverage };
    if (website) {
        for (const [metric, value] of [
            ['article_count', website.total],
            ['view_count', website.views],
            ['like_count', website.likes],
        ] as const) {
            if (value !== null) {
                totals[metric] += value;
                coverage[metric] += 1;
            }
        }
    }
    return { totals, coverage };
}
