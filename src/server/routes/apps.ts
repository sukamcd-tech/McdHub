import { Hono } from 'hono';
import { query, queryOne, execute } from '../db';
import { requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const appsRoute = new Hono<{ Bindings: Bindings }>();

// GET /api/apps/releases (Public or admin)
appsRoute.get('/releases', async (c) => {
  const appName = c.req.query('app') || 'McdWallet';
  try {
    const rows = await query(
      c.env.DB,
      'SELECT * FROM app_releases WHERE app_name = ? ORDER BY created_at DESC',
      [appName]
    );

    const parsed = rows.map((r: any) => ({
      ...r,
      changelog: typeof r.changelog === 'string' ? JSON.parse(r.changelog) : r.changelog,
      is_latest: Boolean(r.is_latest),
      force_update: Boolean(r.force_update),
    }));

    return c.json({ success: true, releases: parsed });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/apps/releases (Admin)
appsRoute.post('/releases', requireAuth('admin'), async (c) => {
  try {
    const data = await c.req.json();
    const id = data.id || crypto.randomUUID();
    const {
      app_name = 'McdWallet',
      version,
      release_date = new Date().toISOString().split('T')[0],
      size_label = '15 MB',
      apk_path,
      apk_size_bytes = 0,
      changelog = [],
      is_latest = true,
      force_update = false,
    } = data;

    if (!version || !apk_path) {
      return c.json({ error: 'Version and APK path are required' }, 400);
    }

    // Reset previous latest tag
    if (is_latest) {
      await execute(
        c.env.DB,
        'UPDATE app_releases SET is_latest = 0 WHERE app_name = ?',
        [app_name]
      );
    }

    await execute(
      c.env.DB,
      `INSERT INTO app_releases (id, app_name, version, release_date, size_label, apk_path, apk_size_bytes, changelog, is_latest, force_update)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        app_name,
        version,
        release_date,
        size_label,
        apk_path,
        Number(apk_size_bytes),
        JSON.stringify(changelog),
        is_latest ? 1 : 0,
        force_update ? 1 : 0,
      ]
    );

    const created = await queryOne(c.env.DB, 'SELECT * FROM app_releases WHERE id = ?', [id]);
    return c.json({ success: true, release: created });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /api/apps/releases/:id (Admin)
appsRoute.put('/releases/:id', requireAuth('admin'), async (c) => {
  const id = c.req.param('id');
  try {
    const data = await c.req.json();
    const fields: string[] = [];
    const values: any[] = [];

    const keys = ['version', 'release_date', 'size_label', 'apk_path', 'apk_size_bytes', 'changelog', 'is_latest', 'force_update'];
    for (const key of keys) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        let val = data[key];
        if (key === 'changelog') val = JSON.stringify(val);
        if (key === 'is_latest' || key === 'force_update') val = val ? 1 : 0;
        values.push(val);
      }
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      await execute(
        c.env.DB,
        `UPDATE app_releases SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updated = await queryOne(c.env.DB, 'SELECT * FROM app_releases WHERE id = ?', [id]);
    return c.json({ success: true, release: updated });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /api/apps/releases/:id (Admin)
appsRoute.delete('/releases/:id', requireAuth('admin'), async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env.DB, 'DELETE FROM app_releases WHERE id = ?', [id]);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ── McdWallet Specific Endpoints ──

// GET /api/mcdwallet/download
export const mcdwalletRoute = new Hono<{ Bindings: Bindings }>();

mcdwalletRoute.get('/download', async (c) => {
  const appName = c.req.query('app') || 'McdWallet';
  try {
    const release = await queryOne<{ apk_path: string; version: string }>(
      c.env.DB,
      'SELECT apk_path, version FROM app_releases WHERE app_name = ? AND is_latest = 1 ORDER BY created_at DESC LIMIT 1',
      [appName]
    );

    if (!release?.apk_path) {
      return c.json({ error: 'APK not available', message: 'No active release found.' }, 404);
    }

    // Auto record download stat
    try {
      await execute(
        c.env.DB,
        'INSERT INTO mcdwallet_download_stats (app_name, ip_address, user_agent) VALUES (?, ?, ?)',
        [appName, c.req.header('cf-connecting-ip') || 'unknown', c.req.header('user-agent') || '']
      );
    } catch {
      // ignore stat error
    }

    return c.json({ success: true, url: release.apk_path, version: release.version });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// GET /api/mcdwallet/download-count
mcdwalletRoute.get('/download-count', async (c) => {
  const appName = c.req.query('app') || 'McdWallet';
  try {
    const res = await queryOne<{ count: number }>(
      c.env.DB,
      'SELECT COUNT(*) as count FROM mcdwallet_download_stats WHERE app_name = ?',
      [appName]
    );
    return c.json({ count: res?.count ?? 0 });
  } catch {
    return c.json({ count: 0 });
  }
});
