import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoute } from './routes/auth';
import { projectsRoute } from './routes/projects';
import { ordersRoute } from './routes/orders';
import { promosRoute } from './routes/promos';
import { feedbacksRoute } from './routes/feedbacks';
import { appsRoute, mcdwalletRoute } from './routes/apps';
import { dashboardRoute } from './routes/dashboard';
import { logsRoute } from './routes/logs';
import { profileRoute } from './routes/profile';
import { securityRoute } from './routes/security';
import { cryptRoute } from './routes/crypt';
import { backupRoute } from './routes/backup';
import { aiRoute } from './routes/ai';
import { clientsRoute } from './routes/clients';

export type Bindings = {
  DB: D1Database;
  ASSETS?: Fetcher;
  ADMIN_ACCESS_KEY?: string;
  AUTH_SECRET?: string;
  GROQ_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Global CORS Middleware for API
app.use('/api/*', cors({
  origin: (origin) => origin || '*',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// API Root & Health Check
const api = new Hono<{ Bindings: Bindings }>();

api.get('/health', (c) => {
  return c.json({
    status: 'ok',
    system: 'SukaMCD / McdHub v2 (Hono + Cloudflare D1)',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    d1_ready: !!c.env?.DB,
  });
});

// Mount All Domain Routes
api.route('/auth', authRoute);
api.route('/projects', projectsRoute);
api.route('/orders', ordersRoute);
api.route('/promos', promosRoute);
api.route('/feedbacks', feedbacksRoute);
api.route('/apps', appsRoute);
api.route('/mcdwallet', mcdwalletRoute);
api.route('/dashboard', dashboardRoute);
api.route('/logs', logsRoute);
api.route('/profile', profileRoute);
api.route('/security', securityRoute);
api.route('/mcdcrypt', cryptRoute);
api.route('/backup', backupRoute);
api.route('/ai', aiRoute);
api.route('/clients', clientsRoute);

app.route('/api', api);

// In production Cloudflare Workers runtime, fallback unmatched routes to static assets
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  app.all('*', async (c) => {
    if (c.env?.ASSETS) {
      return await c.env.ASSETS.fetch(c.req.raw);
    }
    return c.text('Not Found', 404);
  });
}

export default app;
