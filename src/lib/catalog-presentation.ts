export const TOP_TAG_LIMIT = 10;

const compactCount = new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumSignificantDigits: 3 });

export function formatCatalogStat(value: number | null | undefined): string {
    if (value == null) return '—';
    return value >= 10_000 ? compactCount.format(value) : value.toLocaleString('zh-CN');
}
