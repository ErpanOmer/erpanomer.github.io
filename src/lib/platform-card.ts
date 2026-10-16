import type { SocialMetric, SocialMetricValues } from './social-stats';
import type { SocialPlatformConfig } from '../data/social-platforms';

export type PlatformCardMetric = SocialMetric | 'site_visits';
export interface PlatformCardConfig extends Omit<SocialPlatformConfig, 'id'> {
    id: string;
    internal?: boolean;
    handlePrefix?: string;
}
export interface PlatformCardStats {
    stats: SocialMetricValues & { site_visits: number };
    availableMetrics: PlatformCardMetric[];
}
