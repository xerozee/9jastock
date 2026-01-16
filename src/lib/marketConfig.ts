/**
 * Market configuration for NGX indices
 * These base values represent the starting point for index calculations
 * In production, these should ideally be fetched from an API
 */

export const MARKET_INDEX_CONFIG = {
  allShare: {
    name: 'NGX All-Share Index',
    baseValue: 99876.54,
  },
  ngx30: {
    name: 'NGX 30 Index',
    baseValue: 3456.78,
  },
  banking: {
    name: 'NGX Banking Index',
    baseValue: 876.32,
  },
  consumerGoods: {
    name: 'NGX Consumer Goods',
    baseValue: 1234.56,
  },
  oilGas: {
    name: 'NGX Oil & Gas Index',
    baseValue: 567.89,
  },
  industrial: {
    name: 'NGX Industrial Index',
    baseValue: 2345.67,
  },
  insurance: {
    name: 'NGX Insurance Index',
    baseValue: 234.56,
  },
} as const;

export const SECTOR_MAPPINGS = {
  financial: 'Financial Services',
  consumer: 'Consumer Goods',
  oilGas: 'Oil & Gas',
  industrial: 'Industrial Goods',
  insurance: 'Insurance',
} as const;

export const REFRESH_INTERVALS = {
  authenticated: 5 * 60 * 1000,  // 5 minutes
  guest: 6 * 60 * 60 * 1000,     // 6 hours
} as const;
