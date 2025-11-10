import type { PriceSeries, PricePoint, Ticker } from '@/src/types/price';

const H = 3600000;

export function generateMockSeries(
  ticker: Ticker,
  count: number,
  endAt: number = Date.now(),
  endPrice?: number
): PriceSeries {
  const base = ticker === 'BTC' ? 45_000 : 100;
  const vol = ticker === 'BTC' ? 2_000 : 5;

  const points: PricePoint[] = new Array(count);
  let price = endPrice ?? base;

  const startAt = endAt - (count - 1) * H;
  for (let i = 0; i < count; i++) {
    const t = startAt + i * H;
    const trend = Math.sin(i / 10) * vol * 0.1;
    const random = (Math.random() - 0.5) * vol;
    price = Math.max(base * 0.7, price + trend + random);
    points[i] = { t, y: Number(price.toFixed(2)) };
  }
  return { ticker, points };
}

export function generateOlderData(
  series: PriceSeries,
  count = 24
): PriceSeries {
  if (!series.points.length) return series;
  const first = series.points[0]!;
  const endAt = first.t - H;
  const endPrice = first.y;
  return {
    ticker: series.ticker,
    points: generateMockSeries(series.ticker, count, endAt, endPrice).points
  };
}

export function generateNewerData(
  series: PriceSeries,
  count = 24
): PriceSeries {
  if (!series.points.length) return series;
  const last = series.points[series.points.length - 1]!;
  const endAt = last.t + count * H;
  const endPrice = last.y;
  return {
    ticker: series.ticker,
    points: generateMockSeries(series.ticker, count, endAt, endPrice).points
  };
}

export function mergeByTime(left: PricePoint[], right: PricePoint[]) {
  const seen = new Set<number>();
  const res: PricePoint[] = [];
  for (const p of [...left, ...right]) {
    if (!seen.has(p.t)) {
      seen.add(p.t);
      res.push(p);
    }
  }
  res.sort((a, b) => a.t - b.t);
  return res;
}

export async function simulateDataLoad(
  series: PriceSeries,
  dir: 'left' | 'right',
  delay = 400
) {
  await new Promise(r => setTimeout(r, delay));
  return dir === 'left'
    ? generateOlderData(series, 20)
    : generateNewerData(series, 20);
}
