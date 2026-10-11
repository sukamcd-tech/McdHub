import { Hono } from 'hono';
import { queryOne, execute } from '../db';
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  removeSessionCookie,
  getCurrentUser,
  ensureDefaultAdmin,
} from '../lib/auth';
import type { Bindings } from '../index';

export const authRoute = new Hono<{ Bindings: Bindings }>();

// POST /api/auth/login
authRoute.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    if (!c.env?.DB) {
      return c.json({ error: 'Database binding unavailable' }, 500);
    }

    // Auto-seed default admin if first time
    await ensureDefaultAdmin(c.env.DB);

    const cleanEmail = email.trim().toLowerCase();
    const user = await queryOne<{
      id: string;
      email: string;
      password_hash: string;
      name?: string;
      role?: string;
      username?: string;
      profile_picture?: string;
    }>(
      c.env.DB,
      `SELECT u.id, u.email, u.password_hash, p.name, p.role, p.username, p.profile_picture
       FROM users u
       LEFT JOIN profiles p ON u.id = p.id
       WHERE u.email = ? LIMIT 1`,
      [cleanEmail]
    );

    if (!user || !user.password_hash) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role || 'client',
      name: user.name || '',
      username: user.username || '',
      profile_picture: user.profile_picture || '',
    };

    const token = await createSessionToken(
      sessionUser,
      c.env.AUTH_SECRET || c.env.ADMIN_ACCESS_KEY
    );
    setSessionCookie(c, token);

    // Record system log
    try {
      await execute(
        c.env.DB,
        `INSERT INTO mcd_system_logs (user_id, action, category, description, metadata)
         VALUES (?, ?, ?, ?, ?)`,
        [
          user.id,
          'LOGIN_SUCCESS',
          'AUTH',
          `User ${user.email} logged in successfully`,
          JSON.stringify({ ip: c.req.header('cf-connecting-ip') || '127.0.0.1' }),
        ]
      );
    } catch {
      // ignore log failure
    }

    return c.json({ success: true, user: sessionUser });
  } catch (error: any) {
    console.error('Login Error:', error);
    return c.json({ error: error.message || 'Login failed' }, 500);
  }
});

// POST /api/auth/register
authRoute.post('/register', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    if (!c.env?.DB) {
      return c.json({ error: 'Database binding unavailable' }, 500);
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await queryOne(
      c.env.DB,
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (existing) {
      return c.json({ error: 'An account with this email already exists' }, 400);
    }

    const userId = crypto.randomUUID();
    const pwdHash = await hashPassword(password);
    const username = cleanEmail.split('@')[0] + Math.floor(1000 + Math.random() * 9000);

    await execute(
      c.env.DB,
      `INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)`,
      [userId, cleanEmail, pwdHash]
    );

    await execute(
      c.env.DB,
      `INSERT INTO profiles (id, name, username, role) VALUES (?, ?, ?, ?)`,
      [userId, name || cleanEmail.split('@')[0], username, 'client']
    );

    const sessionUser = {
      id: userId,
      email: cleanEmail,
      role: 'client',
      name: name || '',
      username,
    };

    const token = await createSessionToken(
      sessionUser,
      c.env.AUTH_SECRET || c.env.ADMIN_ACCESS_KEY
    );
    setSessionCookie(c, token);

    return c.json({ success: true, user: sessionUser });
  } catch (error: any) {
    console.error('Register Error:', error);
    return c.json({ error: error.message || 'Registration failed' }, 500);
  }
});

// GET /api/auth/session
authRoute.get('/session', async (c) => {
  const user = await getCurrentUser(c);
  return c.json({ user, session: user ? { user } : null });
});

// POST /api/auth/logout
authRoute.post('/logout', (c) => {
  removeSessionCookie(c);
  return c.json({ success: true });
});
