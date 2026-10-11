import { Hono } from 'hono';
import { query, queryOne, execute } from '../db';
import { getCurrentUser, requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const feedbacksRoute = new Hono<{ Bindings: Bindings }>();

// GET /api/feedbacks (Admin or personal)
feedbacksRoute.get('/', async (c) => {
  const user = await getCurrentUser(c);
  try {
    let sql = 'SELECT * FROM feedbacks ORDER BY created_at DESC';
    let params: any[] = [];

    if (!user || user.role !== 'admin') {
      if (!user?.email) return c.json({ error: 'Unauthorized' }, 401);
      sql = 'SELECT * FROM feedbacks WHERE user_email = ? ORDER BY created_at DESC';
      params = [user.email];
    }

    const feedbacks = await query(c.env.DB, sql, params);
    return c.json({ success: true, feedbacks });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/feedbacks (Public submit from contact page)
feedbacksRoute.post('/', async (c) => {
  const user = await getCurrentUser(c);
  try {
    const data = await c.req.json();
    const id = data.id || crypto.randomUUID();
    const {
      type = 'bug',
      priority = 'normal',
      description,
      user_email,
      device_info,
      app_version,
      error_log,
    } = data;

    if (!description) {
      return c.json({ error: 'Description is required' }, 400);
    }

    const email = user?.email || user_email || 'anonymous';

    await execute(
      c.env.DB,
      `INSERT INTO feedbacks (id, user_email, type, priority, description, device_info, app_version, error_log, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        id,
        email,
        type,
        priority,
        description,
        device_info || null,
        app_version || '2.0.0',
        error_log || null,
      ]
    );

    const created = await queryOne(c.env.DB, 'SELECT * FROM feedbacks WHERE id = ?', [id]);
    return c.json({ success: true, feedback: created });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PATCH /api/feedbacks/:id (Admin update status or priority)
feedbacksRoute.patch('/:id', requireAuth('admin'), async (c) => {
  const id = c.req.param('id');
  try {
    const { status, priority } = await c.req.json();
    const fields: string[] = [];
    const values: any[] = [];

    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }
    if (priority !== undefined) {
      fields.push('priority = ?');
      values.push(priority);
    }

    if (fields.length > 0) {
      values.push(id);
      await execute(
        c.env.DB,
        `UPDATE feedbacks SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updated = await queryOne(c.env.DB, 'SELECT * FROM feedbacks WHERE id = ?', [id]);
    return c.json({ success: true, feedback: updated });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /api/feedbacks/:id (Admin)
feedbacksRoute.delete('/:id', requireAuth('admin'), async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env.DB, 'DELETE FROM feedbacks WHERE id = ?', [id]);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
