import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { query, queryOne, execute } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_ACCESS_KEY || process.env.AUTH_SECRET || 'mcdhub-super-secret-key-32chars-minimum-prod'
);

const SESSION_COOKIE_NAME = 'mcdhub_session';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  username?: string;
  profile_picture?: string;
}

// ── Password Hashing using Node.js Native crypto (Scrypt) ──
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    return crypto.timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}

// ── JWT Session Management (Edge & Node compatible via jose) ──
export async function createSessionToken(user: SessionUser): Promise<string> {
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
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
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

// ── Cookie Helpers (Server-Side) ──
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  // Verify user still exists in database and fetch latest profile
  const user = await queryOne<{
    id: string;
    email: string;
    role: string;
    name: string;
    username: string;
    profile_picture: string;
  }>(
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
}

// ── Seed Initial Admin if no users exist ──
export async function ensureDefaultAdmin(): Promise<void> {
  try {
    const existingUsers = await query<any>('SELECT id FROM users LIMIT 1');
    if (existingUsers.length === 0) {
      const adminId = crypto.randomUUID();
      const adminEmail = 'admin@sukamcd.dev';
      const adminPasswordHash = hashPassword('fabian2009');

      await execute(
        `INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)`,
        [adminId, adminEmail, adminPasswordHash]
      );

      await execute(
        `INSERT INTO profiles (id, name, username, role) VALUES (?, ?, ?, ?)`,
        [adminId, 'SukaMCD Admin', 'admin', 'admin']
      );

      console.log('✅ Default admin user created: admin@sukamcd.dev / fabian2009');
    }
  } catch (err) {
    console.error('Error ensuring default admin:', err);
  }
}
