import { Hono } from 'hono';
import { query, queryOne } from '../db';
import { requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const dashboardRoute = new Hono<{ Bindings: Bindings }>();

// GET /api/dashboard/stats (Admin)
dashboardRoute.get('/stats', requireAuth('admin'), async (c) => {
  try {
    const backupRes = await queryOne<{ count: number }>(
      c.env.DB,
      'SELECT COUNT(*) as count FROM mcdbackup_backups'
    );

    const secRes = await queryOne<{ count: number }>(
      c.env.DB,
      "SELECT COUNT(*) as count FROM mcd_system_logs WHERE category = 'SECURITY' AND created_at > datetime('now', '-24 hours')"
    );

    const bugRes = await queryOne<{ count: number }>(
      c.env.DB,
      "SELECT COUNT(*) as count FROM feedbacks WHERE type = 'bug' AND status = 'open'"
    );

    const saranRes = await queryOne<{ count: number }>(
      c.env.DB,
      "SELECT COUNT(*) as count FROM feedbacks WHERE type = 'saran' AND status = 'open'"
    );

    const projRes = await queryOne<{ count: number }>(
      c.env.DB,
      'SELECT COUNT(*) as count FROM mcd_projects'
    );

    const orderRes = await queryOne<{ count: number; pending: number }>(
      c.env.DB,
      "SELECT COUNT(*) as count, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending FROM orders"
    );

    const recentFeedbacks = await query(
      c.env.DB,
      'SELECT * FROM feedbacks ORDER BY created_at DESC LIMIT 5'
    );

    const integrity = {
      d1: true,
      ai: !!c.env.GROQ_API_KEY,
    };

    return c.json({
      success: true,
      data: {
        totalBackups: backupRes?.count ?? 0,
        securityAlerts: secRes?.count ?? 0,
        bugCount: bugRes?.count ?? 0,
        saranCount: saranRes?.count ?? 0,
        totalProjects: projRes?.count ?? 0,
        totalOrders: orderRes?.count ?? 0,
        pendingOrders: orderRes?.pending ?? 0,
        systemStatus: 'Stable',
        integrityInfo: integrity,
        recentFeedbacks: recentFeedbacks || [],
      },
    });
  } catch (error: any) {
    console.error('Dashboard Stats Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});
