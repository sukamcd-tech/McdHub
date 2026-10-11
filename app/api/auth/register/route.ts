import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { queryOne, execute } from '@/lib/db';
import { hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { recordLog } from '@/lib/actions/log-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await queryOne('SELECT id FROM users WHERE email = ? LIMIT 1', [cleanEmail]);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const userId = crypto.randomUUID();
    const pwdHash = hashPassword(password);
    const username = cleanEmail.split('@')[0] + Math.floor(1000 + Math.random() * 9000);

    await execute(
      `INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)`,
      [userId, cleanEmail, pwdHash]
    );

    await execute(
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

    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    try {
      await recordLog(
        'USER_REGISTERED',
        'AUTH',
        `New user registered: ${cleanEmail}`,
        { user_id: userId }
      );
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
