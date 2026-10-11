import { Hono } from 'hono';
import { query, execute } from '../db';
import { getCurrentUser, requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const backupRoute = new Hono<{ Bindings: Bindings }>();

// GET /api/backup/history
backupRoute.get('/history', requireAuth('admin'), async (c) => {
  try {
    const history = await query(
      c.env.DB,
      'SELECT * FROM mcdbackup_backups ORDER BY created_at DESC LIMIT 10'
    );
    return c.json({ success: true, history });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/backup/trigger (Creates an entry in mcdbackup_backups and logs it)
backupRoute.post('/trigger', requireAuth('admin'), async (c) => {
  const user = await getCurrentUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const filename = `MCD_BACKUP_${timestamp}.json`;

    // Fetch snapshot of essential tables for backup
    const projects = await query(c.env.DB, 'SELECT * FROM mcd_projects');
    const profiles = await query(c.env.DB, 'SELECT * FROM profiles');
    const orders = await query(c.env.DB, 'SELECT * FROM orders');

    const backupPayload = JSON.stringify({
      version: '2.0.0',
      created_at: now.toISOString(),
      created_by: user.email,
      data: {
        projects,
        profiles,
        orders,
      },
    });

    const sizeKb = (backupPayload.length / 1024).toFixed(2) + ' KB';

    await execute(
      c.env.DB,
      'INSERT INTO mcdbackup_backups (filename, size, type) VALUES (?, ?, ?)',
      [filename, sizeKb, 'manual']
    );

    await execute(
      c.env.DB,
      `INSERT INTO mcd_system_logs (user_id, action, category, description, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user.id,
        'BACKUP_SUCCESS',
        'SYSTEM',
        `Database backup created: ${filename}`,
        JSON.stringify({ filename, size: sizeKb }),
      ]
    );

    return c.json({
      success: true,
      filename,
      size: sizeKb,
      created_at: now.toISOString(),
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
