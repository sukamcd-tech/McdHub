import { Hono } from 'hono';
import { query, queryOne, execute } from '../db';
import { getCurrentUser, requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const ordersRoute = new Hono<{ Bindings: Bindings }>();

// GET /api/orders
ordersRoute.get('/', async (c) => {
  const user = await getCurrentUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    let sql = 'SELECT * FROM orders ORDER BY created_at DESC';
    let params: any[] = [];

    // If client, restrict to client orders
    if (user.role !== 'admin') {
      sql = 'SELECT * FROM orders WHERE user_id = ? OR user_email = ? ORDER BY created_at DESC';
      params = [user.id, user.email];
    }

    const rows = await query(c.env.DB, sql, params);
    const parsed = rows.map((order: any) => ({
      ...order,
      addons: typeof order.addons === 'string' ? JSON.parse(order.addons) : order.addons,
    }));

    return c.json({ success: true, orders: parsed });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/orders
ordersRoute.post('/', async (c) => {
  const user = await getCurrentUser(c);
  try {
    const data = await c.req.json();
    const id = data.id || crypto.randomUUID();
    const {
      package_id,
      package_name,
      price,
      whatsapp,
      specs,
      addons = [],
      description,
      promo_code = null,
      user_email,
    } = data;

    const email = user?.email || user_email;
    if (!email || !package_id || !whatsapp) {
      return c.json({ error: 'Package, email, and WhatsApp number are required' }, 400);
    }

    await execute(
      c.env.DB,
      `INSERT INTO orders (id, user_id, user_email, package_id, package_name, price, whatsapp, specs, addons, description, promo_code, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        id,
        user?.id || null,
        email,
        package_id,
        package_name || package_id,
        String(price),
        whatsapp,
        typeof specs === 'string' ? specs : JSON.stringify(specs),
        JSON.stringify(addons),
        description || '',
        promo_code,
      ]
    );

    const created = await queryOne(c.env.DB, 'SELECT * FROM orders WHERE id = ?', [id]);
    return c.json({ success: true, order: created });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PATCH /api/orders/:id (Admin status update)
ordersRoute.patch('/:id', requireAuth('admin'), async (c) => {
  const id = c.req.param('id');
  try {
    const { status } = await c.req.json();
    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    await execute(
      c.env.DB,
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    const updated = await queryOne(c.env.DB, 'SELECT * FROM orders WHERE id = ?', [id]);
    return c.json({ success: true, order: updated });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /api/orders/:id (Admin)
ordersRoute.delete('/:id', requireAuth('admin'), async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env.DB, 'DELETE FROM orders WHERE id = ?', [id]);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
