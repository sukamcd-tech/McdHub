import { Hono } from 'hono';
import { query, queryOne, execute } from '../db';
import { requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const promosRoute = new Hono<{ Bindings: Bindings }>();

// GET /api/promos/verify/:code (Public promo verification)
promosRoute.get('/verify/:code', async (c) => {
  const code = c.req.param('code').trim().toUpperCase();
  try {
    const promo = await queryOne<{
      id: string;
      code: string;
      benefit: string;
      is_active: number;
      start_date: string | null;
      end_date: string | null;
      discount_type: string;
      discount_value: number;
    }>(
      c.env.DB,
      'SELECT * FROM promo_codes WHERE UPPER(code) = ? AND is_active = 1 LIMIT 1',
      [code]
    );

    if (!promo) {
      return c.json({ valid: false, message: 'Kode promo tidak valid atau sudah tidak aktif.' }, 404);
    }

    // Date validity check
    const now = new Date();
    if (promo.start_date && new Date(promo.start_date) > now) {
      return c.json({ valid: false, message: 'Kode promo belum mulai berlaku.' }, 400);
    }
    if (promo.end_date && new Date(promo.end_date) < now) {
      return c.json({ valid: false, message: 'Kode promo sudah kedaluwarsa.' }, 400);
    }

    return c.json({
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        benefit: promo.benefit,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
      },
    });
  } catch (error: any) {
    return c.json({ valid: false, message: error.message }, 500);
  }
});

// GET /api/promos (Admin)
promosRoute.get('/', requireAuth('admin'), async (c) => {
  try {
    const promos = await query(
      c.env.DB,
      'SELECT * FROM promo_codes ORDER BY created_at DESC'
    );
    return c.json({
      success: true,
      promos: promos.map((p: any) => ({
        ...p,
        is_active: Boolean(p.is_active),
      })),
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/promos (Admin)
promosRoute.post('/', requireAuth('admin'), async (c) => {
  try {
    const data = await c.req.json();
    const id = data.id || crypto.randomUUID();
    const {
      code,
      benefit,
      is_active = true,
      start_date = null,
      end_date = null,
      discount_type = 'none',
      discount_value = 0,
    } = data;

    if (!code || !benefit) {
      return c.json({ error: 'Code and benefit are required' }, 400);
    }

    await execute(
      c.env.DB,
      `INSERT INTO promo_codes (id, code, benefit, is_active, start_date, end_date, discount_type, discount_value)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        code.trim().toUpperCase(),
        benefit,
        is_active ? 1 : 0,
        start_date,
        end_date,
        discount_type,
        Number(discount_value) || 0,
      ]
    );

    const created = await queryOne(c.env.DB, 'SELECT * FROM promo_codes WHERE id = ?', [id]);
    return c.json({ success: true, promo: created });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /api/promos/:id (Admin)
promosRoute.put('/:id', requireAuth('admin'), async (c) => {
  const id = c.req.param('id');
  try {
    const data = await c.req.json();
    const fields: string[] = [];
    const values: any[] = [];

    const keys = ['code', 'benefit', 'is_active', 'start_date', 'end_date', 'discount_type', 'discount_value'];
    for (const key of keys) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        let val = data[key];
        if (key === 'code') val = String(val).trim().toUpperCase();
        if (key === 'is_active') val = val ? 1 : 0;
        values.push(val);
      }
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      await execute(
        c.env.DB,
        `UPDATE promo_codes SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updated = await queryOne(c.env.DB, 'SELECT * FROM promo_codes WHERE id = ?', [id]);
    return c.json({ success: true, promo: updated });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /api/promos/:id (Admin)
promosRoute.delete('/:id', requireAuth('admin'), async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env.DB, 'DELETE FROM promo_codes WHERE id = ?', [id]);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
