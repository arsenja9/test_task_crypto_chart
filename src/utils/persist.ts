export function readLS<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        if (raw == null) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export function writeLS<T>(key: string, value: T) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms = 150) {
    let t: ReturnType<typeof setTimeout> | null = null;
    return ((...args: Parameters<T>) => {
        if (t) clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    }) as T;
}
