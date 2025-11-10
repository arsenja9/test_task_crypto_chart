'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import type { PriceSeries } from '@/src/types/price';
import { calcStats } from '@/src/utils/stats';
import { FaBitcoin } from 'react-icons/fa6';
import { SiSolana } from 'react-icons/si';
import {
  generateOlderData,
  generateNewerData,
  mergeByTime
} from '@/src/utils/mock';
import {
  FaArrowLeft,
  FaArrowRight,
  FaExpand,
  FaCompress
} from 'react-icons/fa';

type Props = {
  series: PriceSeries;
  onLoadMore?: (dir: 'left' | 'right') => Promise<PriceSeries>;
};

export default function ScrollableChart({ series, onLoadMore }: Props) {
  const [allData, setAllData] = useState(series.points);
  const [visibleRange, setVisibleRange] = useState<[number, number]>([
    Math.max(0, series.points.length - 36),
    series.points.length - 1
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const clampRange = useCallback(
    (start: number, end: number, len: number): [number, number] => {
      if (len <= 0) return [0, 0];
      const size = Math.max(0, end - start);
      let s = Math.max(0, Math.min(start, Math.max(0, len - 1)));
      let e = Math.max(s, Math.min(end, len - 1));
      if (e - s < size) {
        e = Math.min(len - 1, Math.max(e, size));
        s = Math.max(0, e - size);
      }
      return [s, e];
    },
    []
  );

  const normalizedAll = useMemo(() => {
    const a = [...allData];
    a.sort((x, y) => x.t - y.t);
    return a;
  }, [allData]);

  useEffect(() => {
    setVisibleRange(prev => clampRange(prev[0], prev[1], normalizedAll.length));
  }, [normalizedAll.length, clampRange]);

  const visibleData = useMemo(
    () => normalizedAll.slice(visibleRange[0], visibleRange[1] + 1),
    [normalizedAll, visibleRange]
  );

  const stats = useMemo(
    () => calcStats({ ticker: series.ticker, points: visibleData }),
    [visibleData, series.ticker]
  );
  const isUp = stats.change >= 0;
  const Icon = series.ticker === 'BTC' ? FaBitcoin : SiSolana;

  const scrollLeft = useCallback(async () => {
    const step = 10;

    if (visibleRange[0] === 0) {
      setIsLoading(true);
      try {
        const older = onLoadMore
          ? await onLoadMore('left')
          : generateOlderData(
              { ticker: series.ticker, points: normalizedAll },
              20
            );

        setAllData(prev => {
          const merged = mergeByTime(older.points, prev);
          const added = merged.length - prev.length; // реально добавлено слева
          setVisibleRange(([s, e]) =>
            clampRange(s + added, e + added, merged.length)
          );
          return merged;
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      const size = visibleRange[1] - visibleRange[0];
      const newStart = Math.max(0, visibleRange[0] - step);
      setVisibleRange(
        clampRange(newStart, newStart + size, normalizedAll.length)
      );
    }
  }, [visibleRange, normalizedAll, onLoadMore, series.ticker, clampRange]);

  const scrollRight = useCallback(async () => {
    const step = 10;
    const size = visibleRange[1] - visibleRange[0];
    const atEnd = visibleRange[1] >= normalizedAll.length - 1;

    if (atEnd) {
      setIsLoading(true);
      try {
        const newer = onLoadMore
          ? await onLoadMore('right')
          : generateNewerData(
              { ticker: series.ticker, points: normalizedAll },
              20
            );

        setAllData(prev => {
          const merged = mergeByTime(prev, newer.points);
          const added = merged.length - prev.length;
          const move = Math.min(step, added);
          const baseStart = visibleRange[0] + move;
          setVisibleRange(
            clampRange(baseStart, baseStart + size, merged.length)
          );
          return merged;
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      const newEnd = Math.min(normalizedAll.length - 1, visibleRange[1] + step);
      setVisibleRange(clampRange(newEnd - size, newEnd, normalizedAll.length));
    }
  }, [visibleRange, normalizedAll, onLoadMore, series.ticker, clampRange]);

  const resetToLatest = useCallback(() => {
    const size = visibleRange[1] - visibleRange[0];
    const s = Math.max(0, normalizedAll.length - size - 1);
    const e = Math.max(0, normalizedAll.length - 1);
    setVisibleRange(clampRange(s, e, normalizedAll.length));
  }, [normalizedAll.length, visibleRange, clampRange]);

  const zoomIn = useCallback(() => {
    const center = Math.floor((visibleRange[0] + visibleRange[1]) / 2);
    const newSize = Math.max(
      10,
      Math.floor((visibleRange[1] - visibleRange[0]) * 0.7)
    );
    const newStart = Math.max(0, center - Math.floor(newSize / 2));
    const newEnd = newStart + newSize;
    setVisibleRange(clampRange(newStart, newEnd, normalizedAll.length));
  }, [visibleRange, normalizedAll.length, clampRange]);

  const zoomOut = useCallback(() => {
    const center = Math.floor((visibleRange[0] + visibleRange[1]) / 2);
    const newSize = Math.min(
      normalizedAll.length,
      Math.floor((visibleRange[1] - visibleRange[0]) * 1.3)
    );
    const newStart = Math.max(0, center - Math.floor(newSize / 2));
    const newEnd = newStart + newSize;
    setVisibleRange(clampRange(newStart, newEnd, normalizedAll.length));
  }, [visibleRange, normalizedAll.length, clampRange]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') scrollLeft();
      if (e.key === 'ArrowRight') scrollRight();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === 'Home') resetToLatest();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [scrollLeft, scrollRight, zoomIn, zoomOut, resetToLatest]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const canScrollLeft = visibleRange[0] > 0 || !!onLoadMore;
  const canScrollRight =
    visibleRange[1] < normalizedAll.length - 1 || !!onLoadMore;
  const isAtEnd = visibleRange[1] === normalizedAll.length - 1;

  const shownStart = Math.min(
    visibleRange[0] + 1,
    Math.max(1, normalizedAll.length)
  );
  const shownEnd = Math.min(
    visibleRange[1] + 1,
    Math.max(1, normalizedAll.length)
  );

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border shadow-sm dark:border-neutral-800 bg-white dark:bg-neutral-950 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      <div className='flex items-start justify-between border-b p-4 dark:border-neutral-800'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full border dark:border-neutral-700 bg-gradient-to-br from-orange-500/10 to-yellow-500/10'>
            {series.ticker === 'BTC' ? <FaBitcoin /> : <SiSolana />}
          </div>
          <div>
            <div className='text-lg font-semibold'>
              {series.ticker === 'BTC' ? 'Bitcoin' : 'Solana'}
            </div>
            <div className='text-xs text-neutral-500'>{series.ticker}/USD</div>
          </div>
        </div>
        <div className='text-right'>
          <div className='text-2xl font-bold leading-none'>
            {stats.fmt.cf.format(stats.last)}
          </div>
          <div
            className={`text-sm font-medium ${
              isUp ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isUp ? '↑' : '↓'} {stats.change >= 0 ? '+' : ''}
            {stats.fmt.cf.format(stats.change)} (
            {stats.changePct >= 0 ? '+' : ''}
            {stats.changePct.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between border-b px-4 py-2 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900'>
        <div className='flex items-center gap-2'>
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft || isLoading}
            className='p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed'
            title='Scroll left (←)'
          >
            <FaArrowLeft className='h-4 w-4' />
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight || isLoading}
            className='p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed'
            title='Scroll right (→)'
          >
            <FaArrowRight className='h-4 w-4' />
          </button>

          <div className='mx-1 h-6 w-px bg-neutral-300 dark:bg-neutral-700' />

          <button
            onClick={zoomIn}
            className='px-3 py-1.5 text-sm rounded-lg hover:bg-white dark:hover:bg-neutral-800'
            title='Zoom in (+)'
          >
            Zoom +
          </button>
          <button
            onClick={zoomOut}
            className='px-3 py-1.5 text-sm rounded-lg hover:bg-white dark:hover:bg-neutral-800'
            title='Zoom out (-)'
          >
            Zoom -
          </button>
        </div>

        <div className='flex items-center gap-2'>
          {!isAtEnd && (
            <button
              onClick={resetToLatest}
              className='px-3 py-1.5 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600'
              title='Go to latest (Home)'
            >
              Latest
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className='p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-800'
            title='Toggle fullscreen'
          >
            {isFullscreen ? (
              <FaCompress className='h-4 w-4' />
            ) : (
              <FaExpand className='h-4 w-4' />
            )}
          </button>

          <div className='ml-2 text-xs text-neutral-500'>
            {shownStart} - {shownEnd} of {normalizedAll.length}
          </div>
        </div>
      </div>

      <div
        className={`relative ${
          isFullscreen ? 'h-[calc(100vh-240px)]' : 'h-[400px]'
        } w-full`}
      >
        {isLoading && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-neutral-950/50'>
            <div className='flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400'>
              <div className='h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin' />
              Loading...
            </div>
          </div>
        )}

        <ResponsiveContainer
          width='100%'
          height='100%'
        >
          <LineChart
            data={visibleData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='currentColor'
              className='stroke-neutral-200 dark:stroke-neutral-800'
            />
            <XAxis
              dataKey='t'
              type='number'
              scale='time'
              domain={['dataMin', 'dataMax']}
              minTickGap={50}
              tick={{ fontSize: 12 }}
              tickFormatter={v => {
                const d = new Date(v as number);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              stroke='currentColor'
              className='stroke-neutral-400'
            />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={[
                (min: number) => Math.floor(min * 0.995),
                (max: number) => Math.ceil(max * 1.005)
              ]}
              tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
              stroke='currentColor'
              className='stroke-neutral-400'
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                padding: 8,
                color: 'black'
              }}
              formatter={(v: number) => [`$${v.toFixed(2)}`, 'Price']}
              labelFormatter={l => new Date(l as number).toLocaleString()}
            />
            <Line
              type='monotone'
              dataKey='y'
              stroke='#f97316'
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#f97316' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 border-t p-4 dark:border-neutral-800'>
        <div>
          <div className='text-xs text-neutral-500 uppercase tracking-wide'>
            24H High
          </div>
          <div className='mt-1 text-lg font-semibold'>
            {stats.fmt.cf.format(stats.high)}
          </div>
        </div>
        <div>
          <div className='text-xs text-neutral-500 uppercase tracking-wide'>
            24H Low
          </div>
          <div className='mt-1 text-lg font-semibold'>
            {stats.fmt.cf.format(stats.low)}
          </div>
        </div>
        <div>
          <div className='text-xs text-neutral-500 uppercase tracking-wide'>
            Range
          </div>
          <div className='mt-1 text-lg font-semibold'>
            {stats.fmt.cf.format(stats.high - stats.low)}
          </div>
        </div>
        <div>
          <div className='text-xs text-neutral-500 uppercase tracking-wide'>
            Points
          </div>
          <div className='mt-1 text-lg font-semibold'>{visibleData.length}</div>
        </div>
      </div>

      <div className='pb-2 text-center text-xs text-neutral-400'>
        Use ← → to scroll • +/- to zoom • Home for latest
      </div>
    </div>
  );
}
