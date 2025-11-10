'use client';

import { motion } from 'framer-motion';
import { FaBitcoin } from 'react-icons/fa6';
import { SiEthereum, SiBitcoin, SiDogecoin } from 'react-icons/si';
import { useEffect, useState } from 'react';

type Props = { label?: string };

export default function Preloader({ label = 'Loading crypto data...' }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const coins = [
    { Icon: SiEthereum, angle: 0, delay: 0, className: 'text-purple-500' },
    { Icon: SiBitcoin, angle: 120, delay: 0.3, className: 'text-orange-400' },
    { Icon: SiDogecoin, angle: 240, delay: 0.6, className: 'text-yellow-500' }
  ] as const;

  const radius = 70;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900'
      suppressHydrationWarning
    >
      <div className='relative flex flex-col items-center'>
        <div className='relative h-40 w-40'>
          <motion.div
            className='absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 opacity-20 blur-2xl'
            animate={
              mounted
                ? { scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }
                : undefined
            }
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className='absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-yellow-500'
            animate={mounted ? { rotate: 360 } : undefined}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />

          <motion.div
            className='absolute inset-3 rounded-full border-4 border-transparent border-b-orange-400 border-l-yellow-400 opacity-60'
            animate={mounted ? { rotate: -360 } : undefined}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          <motion.div
            className='absolute inset-0 flex items-center justify-center'
            animate={mounted ? { scale: [1, 1.08, 1] } : undefined}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className='relative'>
              <FaBitcoin className='h-16 w-16 text-orange-500 drop-shadow-lg' />
              <motion.div
                className='absolute inset-0 rounded-full bg-orange-500/30 blur-xl'
                animate={
                  mounted
                    ? { scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }
                    : undefined
                }
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {coins.map(({ Icon, angle, delay, className }, idx) => {
            const rad = (angle * Math.PI) / 180;
            const x = mounted ? radius * Math.cos(rad) : 0;
            const y = mounted ? radius * Math.sin(rad) : 0;
            return (
              <motion.div
                key={idx}
                className='absolute left-1/2 top-1/2 -ml-3 -mt-3'
                style={{ transformOrigin: '12px 12px' }}
                animate={mounted ? { rotate: 360 } : undefined}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                  delay
                }}
              >
                <motion.div
                  className={`h-6 w-6 ${className}`}
                  style={{ x, y }}
                  animate={mounted ? { scale: [1, 1.2, 1] } : undefined}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay
                  }}
                >
                  <Icon className='h-full w-full drop-shadow' />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className='mt-8 text-center'
          initial={{ opacity: 0, y: 10 }}
          animate={mounted ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.2 }}
        >
          <p className='text-lg font-semibold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent'>
            {label}
          </p>
          <div className='mt-2 flex justify-center space-x-1'>
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className='h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500'
                animate={
                  mounted
                    ? { scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }
                    : undefined
                }
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>

        <div className='mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800'>
          <motion.div
            className='h-full rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-[length:200%_100%]'
            animate={
              mounted
                ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }
                : undefined
            }
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
