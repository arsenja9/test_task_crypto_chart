import Header from '@/src/components/ui/header/Header';

import PageClient from './pageClient';

export default function Page() {
    return (
        <main className="min-h-dvh bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
            <Header title="Crypto Chart" />
            <PageClient />
        </main>
    );
}
