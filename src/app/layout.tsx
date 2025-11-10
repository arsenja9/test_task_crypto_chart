import type { Metadata } from 'next';
import './globals.css';
import { cookies } from 'next/headers';
import type { Ticker } from '@/src/types/price';
import {AppProvider} from "@/src/context/AppProvider";

export const metadata: Metadata = {
  title: 'Crypto Chart — BTC/SOL',
  description: 'Next 16 • Tailwind • Motion • Server Actions • Context'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const ck = cookies();
  const initialTicker: Ticker = 'SOL' ? 'SOL' : 'BTC';

  return (
    <html lang='en'>
      <body className='min-h-dvh bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100'>
        <AppProvider initialTicker={initialTicker}>{children}</AppProvider>
      </body>
    </html>
  );
}
