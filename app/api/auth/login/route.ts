import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { recordLog } from '@/lib/actions/log-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await queryOne<{
      id: string;
      email: string;
      password_hash: string;
      name?: string;
      role?: string;
      username?: string;
    }>(
      `SELECT u.id, u.email, u.password_hash, p.name, p.role, p.username
       FROM users u
       LEFT JOIN profiles p ON u.id = p.id
       WHERE u.email = ? LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role || 'client',
      name: user.name || '',
      username: user.username || '',
    };

    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    // Record login log
    try {
      await recordLog(
        'LOGIN_SUCCESS',
        'AUTH',
        `User ${user.email} logged in successfully`,
        { user_id: user.id, role: user.role }
      );
    } catch {
      // ignore log failure
    }

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
