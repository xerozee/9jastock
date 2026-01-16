export const MARKET_INDEX_BASE_VALUES = {
  'NGX All-Share Index': 99876.54,
  'NGX 30 Index': 3456.78,
  'NGX Banking Index': 876.32,
  'NGX Consumer Goods': 1234.56,
  'NGX Oil & Gas Index': 567.89,
  'NGX Industrial Index': 2345.67,
  'NGX Insurance Index': 234.56,
} as const;

export type MarketIndexName = keyof typeof MARKET_INDEX_BASE_VALUES;
