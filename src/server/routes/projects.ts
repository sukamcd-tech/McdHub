import { Hono } from 'hono';
import { query, queryOne, execute } from '../db';
import { getCurrentUser, requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const projectsRoute = new Hono<{ Bindings: Bindings }>();

// GET /api/projects (Public)
projectsRoute.get('/', async (c) => {
  try {
    const projects = await query(
      c.env.DB,
      'SELECT * FROM mcd_projects ORDER BY display_order ASC, created_at DESC'
    );
    return c.json({ success: true, projects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return c.json({ success: false, error: error.message, projects: [] }, 500);
  }
});

// POST /api/projects (Admin)
projectsRoute.post('/', requireAuth('admin'), async (c) => {
  const user = await getCurrentUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const data = await c.req.json();
    const id = data.id || crypto.randomUUID();
    const {
      title,
      description = '',
      category = 'Web Development',
      status = 'active',
      url = '',
      display_order = 0,
      icon = null,
    } = data;

    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    await execute(
      c.env.DB,
      `INSERT INTO mcd_projects (id, user_id, title, description, category, status, url, display_order, icon)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user.id, title, description, category, status, url, display_order, icon]
    );

    // Record system log
    await execute(
      c.env.DB,
      `INSERT INTO mcd_system_logs (user_id, action, category, description, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, 'PROJECT_CREATED', 'USER_ACTION', `Created project: ${title}`, JSON.stringify({ id })]
    );

    const created = await queryOne(c.env.DB, 'SELECT * FROM mcd_projects WHERE id = ?', [id]);
    return c.json({ success: true, project: created });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /api/projects/:id (Admin)
projectsRoute.put('/:id', requireAuth('admin'), async (c) => {
  const user = await getCurrentUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  try {
    const data = await c.req.json();
    const fields: string[] = [];
    const values: any[] = [];

    const allowedKeys = ['title', 'description', 'category', 'status', 'url', 'display_order', 'icon'];
    for (const key of allowedKeys) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      await execute(
        c.env.DB,
        `UPDATE mcd_projects SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updated = await queryOne(c.env.DB, 'SELECT * FROM mcd_projects WHERE id = ?', [id]);
    return c.json({ success: true, project: updated });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /api/projects/:id (Admin)
projectsRoute.delete('/:id', requireAuth('admin'), async (c) => {
  const user = await getCurrentUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  try {
    await execute(c.env.DB, 'DELETE FROM mcd_projects WHERE id = ?', [id]);

    await execute(
      c.env.DB,
      `INSERT INTO mcd_system_logs (user_id, action, category, description, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, 'PROJECT_DELETED', 'USER_ACTION', `Deleted project ID: ${id}`, JSON.stringify({ id })]
    );

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
