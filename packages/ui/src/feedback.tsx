'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from './cn.js';
import { Button } from './buttons.js';
import { acquireScrollLock, isTopOverlay, popOverlay, pushOverlay } from './overlay-stack.js';

export type ModalPlacement = 'center' | 'bottom';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'default' | 'wide';
  className?: string;
  placement?: ModalPlacement;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'default',
  className,
  placement = 'center',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const overlayId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusables = panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
    (panel?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables[0] ?? panel)?.focus();
    pushOverlay(overlayId);
    const releaseScroll = acquireScrollLock();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (!isTopOverlay(overlayId)) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (items.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      popOverlay(overlayId);
      releaseScroll();
      previous?.focus();
    };
  }, [open, overlayId]);

  if (!open) return null;

  const bottom = placement === 'bottom';

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex justify-center bg-overlay-scrim/50 backdrop-blur-sm',
        bottom ? 'items-end p-0' : 'items-center p-4',
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={
          bottom ? { paddingBottom: 'env(safe-area-inset-bottom)' } : undefined
        }
        className={cn(
          'flex w-full flex-col overflow-hidden border border-border-subtle bg-surface-raised elevation-3',
          bottom
            ? 'max-h-[90dvh] max-w-sheet rounded-t-xl border-x-0 border-b-0'
            : cn(
                'max-h-[90vh] rounded-xl',
                width === 'wide' ? 'max-w-2xl' : 'max-w-modal',
              ),
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <h2 id={titleId} className="text-ui-20-bold text-text-primary">
            {title}
          </h2>
          <Button variant="tertiary" size="sm" onClick={onClose} aria-label="Cerrar">
            ✕
          </Button>
        </div>
        <div className="mr-1.5 min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <div className="text-ui-13 text-text-secondary">{children}</div>
          {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function BottomSheet(props: ModalProps) {
  return <Modal {...props} placement="bottom" />;
}

export type ToastTone = 'success' | 'error' | 'info' | 'neutral';

export type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastItem = ToastInput & { id: string };

type ToastContextValue = { toast: (input: ToastInput) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);
  const toast = useCallback((input: ToastInput) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((current) => [...current, { ...input, id }]);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notificaciones"
        className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-80 max-w-[calc(100vw-40px)] flex-col gap-2"
      >
        {items.map((item) => (
          <Toast key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast debe usarse dentro de ToastProvider');
  return value;
}

const toastTone: Record<ToastTone, string> = {
  success: 'border-status-positive bg-status-positive-soft text-status-positive-text',
  error: 'border-status-danger bg-status-danger-soft text-status-danger-text',
  info: 'border-status-info bg-status-info-soft text-status-info-text',
  neutral: 'border-border-strong bg-surface-raised text-text-primary',
};

function Toast({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-ui-12 elevation-2',
        toastTone[item.tone ?? 'neutral'],
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-ui-12-strong">{item.title}</p>
        {item.description ? <p className="mt-0.5 text-ui-10">{item.description}</p> : null}
      </div>
      {item.actionLabel ? (
        <button
          type="button"
          className="shrink-0 text-ui-11-strong underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          onClick={() => {
            item.onAction?.();
            onClose();
          }}
        >
          {item.actionLabel}
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Cerrar notificación"
        className="shrink-0 text-ui-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );
}

export type BannerTone = 'warning' | 'error' | 'success' | 'info';

const bannerTone: Record<BannerTone, string> = {
  warning: 'border-status-warning bg-status-warning-soft text-status-warning-text',
  error: 'border-status-danger bg-status-danger-soft text-status-danger-text',
  success: 'border-status-positive bg-status-positive-soft text-status-positive-text',
  info: 'border-status-info bg-status-info-soft text-status-info-text',
};

export function Banner({
  tone = 'info',
  title,
  children,
  action,
  className,
}: {
  tone?: BannerTone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5 rounded-xl border px-4 py-3.5 text-ui-12', bannerTone[tone], className)}>
      <p className="text-ui-13-strong">{title}</p>
      {children ? <div className="text-ui-12">{children}</div> : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
