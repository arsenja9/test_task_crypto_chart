'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode
} from 'react';
import type { Ticker } from '@/src/types/price';
import { readLS, writeLS, debounce } from '@/src/utils/persist';

export type VisibleRange = [number, number];

type AppCtx = {
  ticker: Ticker;
  setTicker: (t: Ticker) => void;
  visibleRange: VisibleRange;
  setVisibleRange: (r: VisibleRange) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
};

const Ctx = createContext<AppCtx | null>(null);

const LS_KEYS = {
  ticker: 'app:ticker',
  visibleRange: 'app:visibleRange'
} as const;

function setTickerCookie(t: Ticker) {
  document.cookie = `ticker=${t}; path=/; max-age=${60 * 60 * 24 * 180}`;
}

export function AppProvider({
  children,
  initialTicker = 'BTC'
}: {
  children: ReactNode;
  initialTicker?: Ticker;
}) {
  const [ticker, _setTicker] = useState<Ticker>(initialTicker);
  const [visibleRangeState, _setVisibleRange] = useState<VisibleRange>(() =>
    readLS<VisibleRange>(LS_KEYS.visibleRange, [0, 0])
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const lsTicker = readLS<Ticker>(LS_KEYS.ticker, ticker);
    if (lsTicker !== ticker) {
      _setTicker(lsTicker);
      setTickerCookie(lsTicker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTicker = (t: Ticker) => {
    _setTicker(t);
    writeLS(LS_KEYS.ticker, t);
    setTickerCookie(t);
  };

  const persistRange = useMemo(
    () => debounce((r: VisibleRange) => writeLS(LS_KEYS.visibleRange, r), 120),
    []
  );
  const setVisibleRange = (r: VisibleRange) => {
    _setVisibleRange(r);
    persistRange(r);
  };

  const value = useMemo(
    () => ({
      ticker,
      setTicker,
      visibleRange: visibleRangeState,
      setVisibleRange,
      loading,
      setLoading
    }),
    [ticker, visibleRangeState, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within <AppProvider>');
  return v;
}
