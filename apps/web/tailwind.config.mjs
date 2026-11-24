/** @type {import('tailwindcss').Config} */
import preset from '@akari/tokens/preset';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  presets: [preset],
  theme: {
    extend: {
      maxWidth: {
        content: '1296px',
      },
    },
  },
  plugins: [],
};
