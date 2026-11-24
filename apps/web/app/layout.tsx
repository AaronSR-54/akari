import type { Metadata } from 'next';
import { themeScript } from '@akari/ui';
import './globals.css';
import { Providers } from '../src/components/providers';

export const metadata: Metadata = {
  title: {
    default: 'akari · finanzas tranquilas',
    template: '%s · akari',
  },
  description:
    'akari organiza cuentas, movimientos y gastos compartidos con una experiencia local-first.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
