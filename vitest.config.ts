import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@akari/tokens': path.resolve(root, 'packages/tokens/src/tokens.ts'),
      '@akari/domain': path.resolve(root, 'packages/domain/src/index.ts'),
      '@akari/data': path.resolve(root, 'packages/data/src/index.ts'),
      '@akari/ui': path.resolve(root, 'packages/ui/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(root, 'vitest.setup.ts')],
    include: ['packages/**/*.{test,spec}.{ts,tsx}', 'apps/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'e2e/**', '**/.next/**'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['packages/domain/src/**/*.ts', 'packages/data/src/**/*.ts'],
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
  },
});
