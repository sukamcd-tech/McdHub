import { Hono } from 'hono';
import { query, execute } from '../db';
import { getCurrentUser, requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const logsRoute = new Hono<{ Bindings: Bindings }>();

// GET /api/logs (Admin)
logsRoute.get('/', requireAuth('admin'), async (c) => {
  const limit = Number(c.req.query('limit')) || 50;
  try {
    const rows = await query(
      c.env.DB,
      `SELECT l.*, p.profile_picture, p.name as user_name
       FROM mcd_system_logs l
       LEFT JOIN profiles p ON l.user_id = p.id
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [limit]
    );

    const parsedLogs = rows.map((log: any) => ({
      ...log,
      metadata: typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata,
      profiles: log.profile_picture || log.user_name ? { profile_picture: log.profile_picture, name: log.user_name } : null,
    }));

    return c.json({ success: true, logs: parsedLogs });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/logs
logsRoute.post('/', async (c) => {
  const user = await getCurrentUser(c);
  try {
    const data = await c.req.json();
    const { action, category = 'SYSTEM', description = '', metadata = {} } = data;

    if (!action) {
      return c.json({ error: 'Action is required' }, 400);
    }

    await execute(
      c.env.DB,
      `INSERT INTO mcd_system_logs (user_id, action, category, description, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user?.id || null,
        action,
        category,
        description,
        JSON.stringify({
          ...metadata,
          ip: c.req.header('cf-connecting-ip') || '127.0.0.1',
          timestamp: new Date().toISOString(),
        }),
      ]
    );

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
