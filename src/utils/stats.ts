import type { PriceSeries, ChartStats, PricePoint } from '@/src/types/price';

export function calcStats(series: PriceSeries): ChartStats {
  const prices = series.points.map(p => p.y);
  const cf = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (prices.length === 0) {
    return {
      first: 0,
      last: 0,
      high: 0,
      low: 0,
      change: 0,
      changePct: 0,
      fmt: { cf }
    };
  }
  const first = prices[0]!;
  const last = prices[prices.length - 1]!;
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const change = last - first;
  const changePct = first !== 0 ? (change / first) * 100 : 0;

  return { first, last, high, low, change, changePct, fmt: { cf } };
}

export const nCompact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1
});

export function calcStatsSlice(points: PricePoint[]) {
  return calcStats({ ticker: 'BTC', points });
}
