'use client';

import { useEffect, useCallback } from 'react';
import { generateMockSeries, simulateDataLoad } from '@/src/utils/mock';
import type { PriceSeries } from '@/src/types/price';
import ScrollableChart from '@/src/components/ui/chart/ScrollableChart';
import { useApp } from '@/src/context/AppProvider';
import Preloader from "@/src/components/ui/preloader/Preloader";

export default function PageClient() {
  const { ticker, setTicker, loading, setLoading, setVisibleRange } = useApp();
  const series: PriceSeries = generateMockSeries(ticker, 120);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const len = series.points.length;
      setVisibleRange([Math.max(0, len - 36), len - 1]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  const handleLoadMore = useCallback(
    async (direction: 'left' | 'right') =>
      simulateDataLoad(series, direction, 500),
    [series]
  );

  return (
    <section className='mx-auto max-w-6xl px-4 py-8'>
      <div className='mb-4 flex items-center gap-8'>
        <h1 className='text-2xl font-semibold'>{ticker} / USD (mock)</h1>
        <button
          className='rounded-md border px-3 py-1 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800'
          onClick={() => setTicker(ticker === 'BTC' ? 'SOL' : 'BTC')}
          disabled={loading}
        >
          Switch to {ticker === 'BTC' ? 'SOL' : 'BTC'}
        </button>
      </div>

      {loading ? (
        <Preloader label={`Loading ${ticker} data...`} />
      ) : (
        <ScrollableChart
          series={series}
          onLoadMore={handleLoadMore}
        />
      )}
    </section>
  );
}
