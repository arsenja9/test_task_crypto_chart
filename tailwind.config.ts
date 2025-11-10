import type { Config } from 'tailwindcss';

export default {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/context/**/*.{js,ts,jsx,tsx,mdx}',
        './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
        './src/types/**/*.{ts,tsx}',
        './src/utils/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
} satisfies Config;
