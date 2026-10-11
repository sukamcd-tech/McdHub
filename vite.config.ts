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
      exclude: [
        /^\/(src|node_modules|@vite|@react-refresh|index\.html|favicon\.ico|assets|\.well-known).*/,
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
