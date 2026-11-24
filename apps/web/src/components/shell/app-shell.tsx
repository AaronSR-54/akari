'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button, StatePage } from '@akari/ui';
import { useData, useDataRetry } from '../providers';
import { useSettings } from '../hooks';
import {
  DesktopHeader,
  HeaderNav,
  MobileNav,
  MobileTopBar,
  Sidebar,
  TabletHeader,
} from './sidebar';
import { SearchDialog } from './search-dialog';
import { PageSkeleton } from '../page-skeleton';

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, error } = useData();
  const retry = useDataRetry();
  const settings = useSettings();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (settings && !settings.onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [settings, router]);

  const sidebarMode = settings?.shellMode !== 'header';
  const showApp = ready && settings?.onboardingCompleted;

  return (
    <div className="min-h-screen bg-surface-canvas lg:p-4">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-accent-default focus:px-4 focus:py-2 focus:text-ui-12-strong focus:text-accent-ink"
      >
        Saltar al contenido
      </a>
      <div className="flex min-h-screen gap-4 lg:min-h-[calc(100vh-2rem)]">
        {sidebarMode ? <Sidebar /> : null}
        <div className="flex min-w-0 flex-1 flex-col">
          {sidebarMode ? null : <HeaderNav onOpenSearch={() => setSearchOpen(true)} />}
          <TabletHeader />
          <MobileTopBar onOpenSearch={() => setSearchOpen(true)} />
          <DesktopHeader
            onOpenSearch={() => setSearchOpen(true)}
            showActions={sidebarMode}
          />
          <main id="contenido" className="flex-1 px-5 pb-24 md:px-6 md:pb-8 lg:px-8">
            {error ? (
              <StatePage
                type="error"
                title="No se puede abrir el almacenamiento local"
                description={error}
                primaryAction={<Button onClick={retry}>Reintentar</Button>}
              />
            ) : !showApp ? (
              <PageSkeleton />
            ) : (
              children
            )}
          </main>
        </div>
      </div>
      <MobileNav />
      {ready ? <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} /> : null}
    </div>
  );
}
