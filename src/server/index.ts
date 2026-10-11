import { Hono } from 'hono';

export type Bindings = {
  DB: D1Database;
  ASSETS?: Fetcher;
  ADMIN_ACCESS_KEY?: string;
  AUTH_SECRET?: string;
  GROQ_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// API Routes prefix
const api = new Hono<{ Bindings: Bindings }>();

api.get('/health', (c) => {
  return c.json({
    status: 'ok',
    system: 'SukaMCD / McdHub v2',
    timestamp: new Date().toISOString(),
    d1_ready: !!c.env?.DB,
  });
});

app.route('/api', api);

export default app;
