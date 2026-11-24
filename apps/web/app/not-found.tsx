import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-canvas p-5">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-xl border border-border-subtle bg-surface-default p-8 text-center">
        <p className="text-ui-11-strong uppercase tracking-wide text-text-tertiary">Error 404</p>
        <h1 className="text-ui-24-bold text-text-primary">Esta página no existe</h1>
        <p className="text-ui-12 text-text-secondary">
          Puede que el enlace haya cambiado o que la cuenta ya no esté disponible.
        </p>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent-default px-5 text-ui-14-strong text-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          Volver al resumen
        </Link>
      </div>
    </main>
  );
}
