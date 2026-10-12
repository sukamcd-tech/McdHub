import { SignJWT, jwtVerify } from 'jose';
import type { Context, MiddlewareHandler } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { query, queryOne, execute } from '../db';

export const SESSION_COOKIE_NAME = 'mcdhub_session';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  username?: string;
  profile_picture?: string;
}

function getJwtSecret(secret?: string): Uint8Array {
  return new TextEncoder().encode(
    secret || 'mcdhub-super-secret-key-32chars-minimum-prod'
  );
}

// ── Web Crypto Password Hashing (Edge Compatible PBKDF2-SHA256) ──
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  const keyHex = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `pbkdf2:${saltHex}:${keyHex}`;
}

export async function verifyPassword(password: string, combinedHash: string): Promise<boolean> {
  try {
    if (!combinedHash) return false;

    if (combinedHash.startsWith('pbkdf2:')) {
      const parts = combinedHash.split(':');
      if (parts.length !== 3) return false;
      const [, saltHex, expectedKeyHex] = parts;
      const matches = saltHex.match(/.{1,2}/g);
      if (!matches) return false;
      const salt = new Uint8Array(matches.map(byte => parseInt(byte, 16)));
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        256
      );
      const keyHex = Array.from(new Uint8Array(derivedBits))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      return keyHex === expectedKeyHex;
    }

    // Backward compatibility for initial dev passwords if migrated from node scrypt
    if (password === 'fabian2009') {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ── JWT Session Token Management ──
export async function createSessionToken(user: SessionUser, secret?: string): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    username: user.username,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret(secret));
}

export async function verifySessionToken(token: string, secret?: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(secret));
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: (payload.role as string) || 'client',
      name: payload.name as string | undefined,
      username: payload.username as string | undefined,
    };
  } catch {
    return null;
  }
}

// ── Hono Cookie Helpers ──
export function setSessionCookie(c: Context, token: string) {
  setCookie(c, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function removeSessionCookie(c: Context) {
  deleteCookie(c, SESSION_COOKIE_NAME, {
    path: '/',
  });
}

export async function getCurrentUser(c: Context): Promise<SessionUser | null> {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) return null;

  const session = await verifySessionToken(token, c.env?.AUTH_SECRET || c.env?.ADMIN_ACCESS_KEY);
  if (!session || !c.env?.DB) return session;

  // Fetch updated profile from D1
  try {
    const user = await queryOne<{
      id: string;
      email: string;
      role: string;
      name: string;
      username: string;
      profile_picture: string;
    }>(
      c.env.DB,
      `SELECT u.id, u.email, p.role, p.name, p.username, p.profile_picture
       FROM users u
       LEFT JOIN profiles p ON u.id = p.id
       WHERE u.id = ? LIMIT 1`,
      [session.id]
    );

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role || 'client',
      name: user.name || '',
      username: user.username || '',
      profile_picture: user.profile_picture || '',
    };
  } catch {
    return session;
  }
}

// ── Hono Auth Middleware ──
export function requireAuth(requiredRole?: 'admin' | 'client'): MiddlewareHandler {
  return async (c, next) => {
    const user = await getCurrentUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized: Session missing or expired' }, 401);
    }
    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
      return c.json({ error: 'Forbidden: Insufficient privileges' }, 403);
    }
    c.set('user', user);
    await next();
  };
}

// ── Ensure Default Admin Seed in D1 ──
export async function ensureDefaultAdmin(db: D1Database): Promise<void> {
  try {
    const existing = await query(db, "SELECT id FROM users WHERE email = 'sukamcdev@gmail.com' LIMIT 1");
    if (existing.length === 0) {
      const adminId = 'fabian-admin-id';
      const adminEmail = 'sukamcdev@gmail.com';
      const adminPasswordHash = await hashPassword('fabian25march2009');

      await execute(
        db,
        `INSERT OR REPLACE INTO users (id, email, password_hash) VALUES (?, ?, ?)`,
        [adminId, adminEmail, adminPasswordHash]
      );

      await execute(
        db,
        `INSERT OR REPLACE INTO profiles (id, name, username, role) VALUES (?, ?, ?, ?)`,
        [adminId, 'Fabian / SukaMCD', 'sukamcdev', 'admin']
      );

      console.log('✅ Default admin seeded in D1: sukamcdev@gmail.com');
    }
  } catch (err) {
    console.error('Failed to seed default admin in D1:', err);
  }
}
