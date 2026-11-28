'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, StatePage, cn } from '@akari/ui';
import { useData, useDataRetry } from '../providers';
import { useMarkNotificationsSeen, useNotifications, useSettings } from '../hooks';
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
import { NotificationsPanel } from './notifications-panel';
import { useNotificationPayments } from './use-notification-payments';
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
  const notifications = useNotifications();
  const markSeen = useMarkNotificationsSeen();
  const { pay, busyId } = useNotificationPayments();
  const router = useRouter();
  const pathname = usePathname();
  const flushContent = /^\/cuentas\/[^/]+$/.test(pathname ?? '');
  const { title, meta, titleAction } = usePageTitle();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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

  useEffect(() => {
    if (!notificationsOpen || !notifications) return;
    const unseen = notifications
      .filter((notification) => !notification.seen)
      .map((notification) => notification.id);
    if (unseen.length > 0) {
      void markSeen(unseen).catch(() => undefined);
    }
  }, [notificationsOpen, notifications, markSeen]);

  const sidebarMode = settings?.shellMode !== 'header';
  const showApp = ready && settings?.onboardingCompleted;
  const headerTitle = title || routeTitles[pathname ?? ''] || '';
  const displayName = settings?.displayName ?? defaultProfile.displayName;
  const notificationCount =
    notifications?.filter((notification) => !notification.seen).length ?? 0;
  const toggleNotifications = () => setNotificationsOpen((open) => !open);
  const notificationsPanel = notificationsOpen ? (
    <NotificationsPanel
      notifications={notifications}
      busyId={busyId}
      onPay={pay}
      onClose={() => setNotificationsOpen(false)}
    />
  ) : null;

  return (
    <div className="min-h-screen bg-surface-canvas lg:h-screen lg:overflow-clip lg:p-4 lg:pr-0">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-accent-default focus:px-4 focus:py-2 focus:text-ui-12-strong focus:text-accent-ink"
      >
        Saltar al contenido
      </a>
      <div className="flex min-h-screen gap-4 lg:h-[calc(100vh-2rem)] lg:min-h-0">
        {sidebarMode ? (
          <>
            <div
              className={cn('hidden shrink-0 lg:block', sidebarPinned ? 'w-60' : 'w-[76px]')}
              aria-hidden="true"
            />
            <Sidebar pinned={sidebarPinned} onPinnedChange={setSidebarPinned} displayName={displayName} />
          </>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col lg:min-h-0">
          {sidebarMode ? null : (
            <HeaderNav
              onOpenSearch={() => setSearchOpen(true)}
              displayName={displayName}
              onToggleNotifications={toggleNotifications}
              notificationCount={notificationCount}
              notificationsOpen={notificationsOpen}
              notificationsPanel={notificationsPanel}
            />
          )}
          <TabletHeader displayName={displayName} />
          <MobileTopBar onOpenSearch={() => setSearchOpen(true)} displayName={displayName} />
          {sidebarMode ? (
            <DesktopHeader
              title={headerTitle}
              meta={meta}
              titleAction={titleAction}
              pinned={sidebarPinned}
              onOpenSearch={() => setSearchOpen(true)}
              onToggleNotifications={toggleNotifications}
              notificationCount={notificationCount}
              notificationsOpen={notificationsOpen}
              notificationsPanel={notificationsPanel}
            />
          ) : null}
          <main
            id="contenido"
            data-shell-scroll
            className={cn(
              'flex-1 px-5 pb-24 pt-6 md:px-6 md:pb-8 lg:min-h-0 lg:overflow-y-auto lg:px-8',
              sidebarMode
                ? flushContent
                  ? 'lg:pt-[56px]'
                  : 'lg:pt-[80px]'
                : flushContent
                  ? 'lg:pt-0'
                  : null,
              flushContent && 'lg:pb-0',
            )}
          >
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
