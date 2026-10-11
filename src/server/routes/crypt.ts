import { Hono } from 'hono';
import { query, queryOne, execute } from '../db';
import { getCurrentUser, requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const cryptRoute = new Hono<{ Bindings: Bindings }>();

// GET /api/mcdcrypt/files
cryptRoute.get('/files', requireAuth('admin'), async (c) => {
  const user = await getCurrentUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const parentId = c.req.query('parent_id');
  try {
    let sql: string;
    let params: any[];

    if (parentId && parentId !== 'null') {
      sql = 'SELECT * FROM mcdcrypt_files WHERE parent_id = ? ORDER BY is_folder DESC, original_name ASC';
      params = [Number(parentId)];
    } else {
      sql = 'SELECT * FROM mcdcrypt_files WHERE parent_id IS NULL ORDER BY is_folder DESC, original_name ASC';
      params = [];
    }

    const data = await query(c.env.DB, sql, params);
    const parsed = data.map((item: any) => ({
      ...item,
      is_folder: Boolean(item.is_folder),
      storage_path: item.encrypted_path,
    }));

    return c.json({ success: true, files: parsed });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/mcdcrypt/folders
cryptRoute.post('/folders', requireAuth('admin'), async (c) => {
  const user = await getCurrentUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { name, parent_id } = await c.req.json();
    if (!name) return c.json({ error: 'Folder name is required' }, 400);

    await execute(
      c.env.DB,
      `INSERT INTO mcdcrypt_files (user_id, original_name, is_folder, parent_id)
       VALUES (?, ?, 1, ?)`,
      [user.id, name, parent_id ? Number(parent_id) : null]
    );

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /api/mcdcrypt/rename/:id
cryptRoute.put('/rename/:id', requireAuth('admin'), async (c) => {
  const id = c.req.param('id');
  try {
    const { name } = await c.req.json();
    if (!name) return c.json({ error: 'New name is required' }, 400);

    await execute(
      c.env.DB,
      'UPDATE mcdcrypt_files SET original_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, Number(id)]
    );

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /api/mcdcrypt/move/:id
cryptRoute.put('/move/:id', requireAuth('admin'), async (c) => {
  const id = c.req.param('id');
  try {
    const { parent_id } = await c.req.json();
    const newParent = parent_id ? Number(parent_id) : null;

    if (Number(id) === newParent) {
      return c.json({ error: 'Cannot move item into itself' }, 400);
    }

    await execute(
      c.env.DB,
      'UPDATE mcdcrypt_files SET parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newParent, Number(id)]
    );

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /api/mcdcrypt/items/:id
cryptRoute.delete('/items/:id', requireAuth('admin'), async (c) => {
  const id = c.req.param('id');
  try {
    // Delete item & any children
    await execute(c.env.DB, 'DELETE FROM mcdcrypt_files WHERE id = ? OR parent_id = ?', [Number(id), Number(id)]);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /api/mcdcrypt/breadcrumbs
cryptRoute.get('/breadcrumbs', requireAuth('admin'), async (c) => {
  const folderId = c.req.query('folder_id');
  if (!folderId || folderId === 'null') return c.json({ breadcrumbs: [] });

  try {
    const breadcrumbs: { id: string; original_name: string }[] = [];
    let currentId: any = Number(folderId);

    while (currentId) {
      const data = await queryOne<{ id: number; original_name: string; parent_id: number | null }>(
        c.env.DB,
        'SELECT id, original_name, parent_id FROM mcdcrypt_files WHERE id = ?',
        [currentId]
      );
      if (!data) break;

      breadcrumbs.unshift({ id: String(data.id), original_name: data.original_name });
      currentId = data.parent_id;
    }

    return c.json({ breadcrumbs });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
