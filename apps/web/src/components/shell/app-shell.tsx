'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, StatePage, cn } from '@akari/ui';
import { useData, useDataRetry } from '../providers';
import { useSettings } from '../hooks';
import { PageTitleProvider, usePageTitle } from '../page-title';
import { routeTitles } from '../nav';
import { defaultProfile } from '../../lib/profile';
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
  return (
    <PageTitleProvider>
      <AppShellInner>{children}</AppShellInner>
    </PageTitleProvider>
  );
}

function AppShellInner({ children }: { children: ReactNode }) {
  const { ready, error } = useData();
  const retry = useDataRetry();
  const settings = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const { title, meta } = usePageTitle();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);

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
  const headerTitle = title || routeTitles[pathname ?? ''] || '';
  const displayName = settings?.displayName ?? defaultProfile.displayName;

  return (
    <div className="min-h-screen bg-surface-canvas lg:p-4">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-accent-default focus:px-4 focus:py-2 focus:text-ui-12-strong focus:text-accent-ink"
      >
        Saltar al contenido
      </a>
      <div className="flex min-h-screen gap-4 lg:min-h-[calc(100vh-2rem)]">
        {sidebarMode ? (
          <>
            <div
              className={cn('hidden shrink-0 lg:block', sidebarPinned ? 'w-60' : 'w-[76px]')}
              aria-hidden="true"
            />
            <Sidebar pinned={sidebarPinned} onPinnedChange={setSidebarPinned} displayName={displayName} />
          </>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          {sidebarMode ? null : (
            <HeaderNav onOpenSearch={() => setSearchOpen(true)} displayName={displayName} />
          )}
          <TabletHeader displayName={displayName} />
          <MobileTopBar onOpenSearch={() => setSearchOpen(true)} displayName={displayName} />
          {sidebarMode ? (
            <DesktopHeader title={headerTitle} meta={meta} onOpenSearch={() => setSearchOpen(true)} />
          ) : null}
          <main id="contenido" className="flex-1 px-5 pb-24 pt-6 md:px-6 md:pb-8 lg:px-8">
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
