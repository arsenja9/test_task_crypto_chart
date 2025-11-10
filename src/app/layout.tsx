import type { Metadata } from 'next';
import './globals.css';
import { cookies } from 'next/headers';
import type { Ticker } from '@/src/types/price';
import {AppProvider} from "@/src/context/AppProvider";

export const metadata: Metadata = {
  title: 'Crypto Chart — BTC/SOL',
  description: 'Next 16 • Tailwind • Motion • Server Actions • Context'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const initialTicker: Ticker = 'SOL';

  return (
      <html lang='en'>
      <body className='...'>
      <AppProvider initialTicker={initialTicker}>{children}</AppProvider>
      </body>
      </html>
  );
}