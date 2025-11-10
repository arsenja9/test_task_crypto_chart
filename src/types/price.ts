export type Ticker = 'BTC' | 'SOL';

export interface PricePoint {
    t: number;
    y: number;
}

export interface PriceSeries {
    ticker: Ticker;
    points: PricePoint[];
}

export interface ChartStats {
    first: number;
    last: number;
    high: number;
    low: number;
    change: number;
    changePct: number;
    fmt: {
        cf: Intl.NumberFormat;
    };
}
