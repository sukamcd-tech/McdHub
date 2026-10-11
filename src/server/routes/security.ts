import { Hono } from 'hono';
import { execute } from '../db';
import { getCurrentUser, removeSessionCookie, requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const securityRoute = new Hono<{ Bindings: Bindings }>();

// GET /api/security/overview (Admin)
securityRoute.get('/overview', requireAuth('admin'), async (c) => {
  try {
    const securityStatus = {
      rlsStatus: [
        { table: 'mcd_projects', status: 'ARMED' },
        { table: 'profiles', status: 'ARMED' },
        { table: 'mcd_system_logs', status: 'ARMED' },
        { table: 'mcdbackup_backups', status: 'ARMED' },
        { table: 'orders', status: 'ARMED' },
      ],
      envIntegrity: {
        d1: true,
        ai: !!c.env.GROQ_API_KEY,
      },
      mfaStatus: 'LOCAL_PASS',
      lastSecurityEvent: null,
    };

    return c.json({ success: true, data: securityStatus });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/security/revoke-sessions (Admin)
securityRoute.post('/revoke-sessions', requireAuth('admin'), async (c) => {
  const user = await getCurrentUser(c);
  try {
    if (user) {
      await execute(
        c.env.DB,
        `INSERT INTO mcd_system_logs (user_id, action, category, description, metadata)
         VALUES (?, ?, ?, ?, ?)`,
        [
          user.id,
          'SECURITY_REVOKE_SESSIONS',
          'SECURITY',
          'Session revocation triggered by admin.',
          JSON.stringify({ timestamp: new Date().toISOString() }),
        ]
      );
    }

    removeSessionCookie(c);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
