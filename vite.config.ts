import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import devServer from '@hono/vite-dev-server';
import adapter from '@hono/vite-dev-server/cloudflare';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    devServer({
      adapter,
      entry: 'src/server/index.ts',
      // Only let Hono handle /api routes in Vite dev mode, let Vite handle all SPA routes & assets
      exclude: [
        /^(?!\/api).*/,
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
