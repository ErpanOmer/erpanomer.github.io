import {
    SOCIAL_PLATFORM_CONFIG_MAP,
    SOCIAL_PLATFORM_IDS,
    SOCIAL_STATS_PLATFORM_IDS,
    type SocialPlatformId,
} from "@/data/social-platforms";

export type { SocialPlatformId } from "@/data/social-platforms";

export const SOCIAL_METRICS = [
    "article_count",
    "follower_count",
    "view_count",
    "favorite_count",
    "like_count",
] as const;

export type SocialMetric = (typeof SOCIAL_METRICS)[number];
export type SocialStatsStatus = "available" | "partial" | "unavailable";

export interface SocialMetricValues {
    article_count: number;
    follower_count: number;
    view_count: number;
    favorite_count: number;
    like_count: number;
}

export interface SocialPlatformStats {
    platform: SocialPlatformId;
    accountId: string;
    accountUrl: string | null;
    stats: SocialMetricValues;
    availableMetrics: SocialMetric[];
    observedAt: string | null;
    lastAttempt: {
        status: string;
        attemptedAt: string | null;
        errorCode: string | null;
    };
    extra: Record<string, unknown>;
}

export interface SocialStatsResult {
    status: SocialStatsStatus;
    generatedAt: string | null;
    platforms: SocialPlatformStats[];
    totals: SocialMetricValues;
    coverage: Record<SocialMetric, number>;
}

export interface SocialStatsFetcher {
    fetch(request: Request): Promise<Response>;
}

export interface FetchSocialStatsOptions {
    transport?: "public" | "service";
    serviceBinding?: SocialStatsFetcher | null;
}

const SOCIAL_STATS_URL = "https://get-fans.nurverse.com/";
const REQUEST_TIMEOUT_MS = 3_000;

const emptyMetrics = (): SocialMetricValues => ({
    article_count: 0,
    follower_count: 0,
    view_count: 0,
    favorite_count: 0,
    like_count: 0,
});

const emptyCoverage = (): Record<SocialMetric, number> => ({
    article_count: 0,
    follower_count: 0,
    view_count: 0,
    favorite_count: 0,
    like_count: 0,
});

function unavailableResult(): SocialStatsResult {
    return {
        status: "unavailable",
        generatedAt: null,
        platforms: [],
        totals: emptyMetrics(),
        coverage: emptyCoverage(),
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDate(value: unknown): value is string {
    return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isMetric(value: unknown): value is SocialMetric {
    return (
        typeof value === "string" &&
        (SOCIAL_METRICS as readonly string[]).includes(value)
    );
}

function isPlatformId(value: unknown): value is SocialPlatformId {
    return (
        typeof value === "string" &&
        (SOCIAL_PLATFORM_IDS as readonly string[]).includes(value)
    );
}

function parseNonNegativeNumber(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) && value >= 0
        ? value
        : null;
}

function sanitizeAccountUrl(
    platform: SocialPlatformId,
    value: unknown,
): string | null {
    const config = SOCIAL_PLATFORM_CONFIG_MAP[platform];

    if (typeof value === "string") {
        try {
            const url = new URL(value);
            const isAllowedHost = config.allowedDomains.some(
                (domain) =>
                    url.hostname === domain ||
                    url.hostname.endsWith(`.${domain}`),
            );

            if (url.protocol === "https:" && isAllowedHost) {
                return url.toString();
            }
        } catch {
            // Fall through to the reviewed static profile URL.
        }
    }

    return config.profileUrl;
}

function parsePlatform(value: unknown): SocialPlatformStats | null {
    if (!isRecord(value) || !isPlatformId(value.platform)) return null;
    if (typeof value.account_id !== "string" || !value.account_id.trim()) {
        return null;
    }
    if (!isRecord(value.stats)) return null;

    const stats = emptyMetrics();
    for (const metric of SOCIAL_METRICS) {
        const parsedValue = parseNonNegativeNumber(value.stats[metric]);
        if (parsedValue === null) return null;
        stats[metric] = parsedValue;
    }

    if (
        !Array.isArray(value.available_metrics) ||
        !value.available_metrics.every(isMetric)
    ) {
        return null;
    }
    const availableMetrics = [...new Set(value.available_metrics)];
    if (value.observed_at !== null && !isValidDate(value.observed_at)) {
        return null;
    }
    const observedAt = value.observed_at;

    if (
        !isRecord(value.last_attempt) ||
        typeof value.last_attempt.status !== "string" ||
        (value.last_attempt.attempted_at !== null &&
            !isValidDate(value.last_attempt.attempted_at)) ||
        (value.last_attempt.error_code !== null &&
            typeof value.last_attempt.error_code !== "string")
    ) {
        return null;
    }
    const lastAttempt = {
        status: value.last_attempt.status,
        attemptedAt: value.last_attempt.attempted_at,
        errorCode: value.last_attempt.error_code,
    };

    return {
        platform: value.platform,
        accountId: value.account_id,
        accountUrl: sanitizeAccountUrl(value.platform, value.account_url),
        stats,
        availableMetrics,
        observedAt,
        lastAttempt,
        extra: isRecord(value.extra) ? value.extra : {},
    };
}

function aggregate(platforms: SocialPlatformStats[]) {
    const totals = emptyMetrics();
    const coverage = emptyCoverage();

    for (const platform of platforms) {
        for (const metric of platform.availableMetrics) {
            totals[metric] += platform.stats[metric];
            coverage[metric] += 1;
        }
    }

    return { totals, coverage };
}

export function buildSocialStatsResult(payload: unknown): SocialStatsResult {
    if (
        !isRecord(payload) ||
        !isValidDate(payload.generated_at) ||
        !Array.isArray(payload.platforms) ||
        payload.platforms.length !== SOCIAL_STATS_PLATFORM_IDS.length
    ) {
        return unavailableResult();
    }

    const parsedPlatforms = payload.platforms.map(parsePlatform);
    if (parsedPlatforms.some((platform) => platform === null)) {
        return unavailableResult();
    }

    const validPlatforms = parsedPlatforms as SocialPlatformStats[];
    const platformMap = new Map(
        validPlatforms.map((platform) => [platform.platform, platform]),
    );
    if (
        platformMap.size !== SOCIAL_STATS_PLATFORM_IDS.length ||
        SOCIAL_STATS_PLATFORM_IDS.some((platform) => !platformMap.has(platform))
    ) {
        return unavailableResult();
    }

    const platforms = SOCIAL_STATS_PLATFORM_IDS.map(
        (platform) => platformMap.get(platform) as SocialPlatformStats,
    );
    const { totals, coverage } = aggregate(platforms);
    const isPartial = platforms.some(
        (platform) =>
            platform.availableMetrics.length === 0 ||
            platform.lastAttempt.status !== "ok",
    );

    return {
        status: isPartial ? "partial" : "available",
        generatedAt: payload.generated_at,
        platforms,
        totals,
        coverage,
    };
}

export async function fetchSocialStats(
    options: FetchSocialStatsOptions = {},
): Promise<SocialStatsResult> {
    const transport = options.transport ?? "public";
    if (transport === "service" && !options.serviceBinding) {
        return unavailableResult();
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const request = new Request(SOCIAL_STATS_URL, {
            headers: { Accept: "application/json" },
            signal: controller.signal,
        });
        const response =
            transport === "service"
                ? await options.serviceBinding!.fetch(request)
                : await fetch(request);

        if (!response.ok) return unavailableResult();

        const payload: unknown = await response.json();
        return buildSocialStatsResult(payload);
    } catch {
        return unavailableResult();
    } finally {
        clearTimeout(timeout);
    }
}

export function formatCompactCount(value: number): string {
    if (value >= 10_000) {
        const compact = (value / 10_000)
            .toFixed(1)
            .replace(/\.0$/, "");
        return `${compact}w`;
    }

    return formatExactCount(value);
}

export function formatExactCount(value: number): string {
    return new Intl.NumberFormat("zh-CN").format(value);
}

export function formatSocialDate(value: string | null): string | null {
    if (!value) return null;

    return new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(value));
}

export function findPlatformStats(
    result: SocialStatsResult,
    platform: SocialPlatformId,
): SocialPlatformStats | null {
    return (
        result.platforms.find((item) => item.platform === platform) ?? null
    );
}

export function sortSocialPlatformsByViews<
    T extends { id: SocialPlatformId },
>(platforms: readonly T[], result: SocialStatsResult): T[] {
    return platforms
        .map((platform, index) => {
            const stats = findPlatformStats(result, platform.id);
            const hasViewCount = Boolean(
                stats?.availableMetrics.includes("view_count"),
            );

            return {
                platform,
                index,
                hasViewCount,
                viewCount: hasViewCount ? stats?.stats.view_count ?? 0 : 0,
            };
        })
        .sort((a, b) => {
            if (a.hasViewCount !== b.hasViewCount) {
                return a.hasViewCount ? -1 : 1;
            }

            if (a.viewCount !== b.viewCount) {
                return b.viewCount - a.viewCount;
            }

            return a.index - b.index;
        })
        .map(({ platform }) => platform);
}
