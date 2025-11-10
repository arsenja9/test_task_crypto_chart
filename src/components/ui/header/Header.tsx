'use client';
import { FaBitcoin } from 'react-icons/fa6';

type Props = {
  title?: string;
};

export default function Header({
  title = 'Crypto Chart',
}: Props) {
  return (
    <header className='sticky top-0 z-10 border-b bg-white/80 backdrop-blur dark:bg-neutral-900/80 dark:border-neutral-800'>
      <div className='mx-auto flex max-w-5xl items-center justify-center px-4 py-3'>
        <div className='flex items-center gap-3 text-xl font-semibold'>
          <FaBitcoin className='h-6 w-6' />
          <span className='text-center'>{title}</span>
        </div>
      </div>
    </header>
  );
}
