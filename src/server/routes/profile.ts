import { Hono } from 'hono';
import { queryOne, execute } from '../db';
import { getCurrentUser, hashPassword, requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const profileRoute = new Hono<{ Bindings: Bindings }>();

// PUT /api/profile
profileRoute.put('/', requireAuth(), async (c) => {
  const user = await getCurrentUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const data = await c.req.json();
    const { name, username, phone_number, bio, profile_picture } = data;

    const fields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (username !== undefined) {
      // Check if username taken by another user
      const existing = await queryOne(
        c.env.DB,
        'SELECT id FROM profiles WHERE username = ? AND id != ? LIMIT 1',
        [username, user.id]
      );
      if (existing) {
        return c.json({ error: 'Username is already taken' }, 400);
      }
      fields.push('username = ?');
      values.push(username);
    }
    if (phone_number !== undefined) {
      fields.push('phone_number = ?');
      values.push(phone_number);
    }
    if (bio !== undefined) {
      fields.push('bio = ?');
      values.push(bio);
    }
    if (profile_picture !== undefined) {
      fields.push('profile_picture = ?');
      values.push(profile_picture);
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(user.id);
      await execute(
        c.env.DB,
        `UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updatedProfile = await queryOne(c.env.DB, 'SELECT * FROM profiles WHERE id = ?', [user.id]);
    return c.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /api/profile/password
profileRoute.put('/password', requireAuth(), async (c) => {
  const user = await getCurrentUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { password, password_confirmation } = await c.req.json();
    if (!password || password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }
    if (password !== password_confirmation) {
      return c.json({ error: 'Passwords do not match' }, 400);
    }

    const hashed = await hashPassword(password);
    await execute(
      c.env.DB,
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashed, user.id]
    );

    return c.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
