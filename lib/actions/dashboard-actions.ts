"use server";

import { query, queryOne } from "@/lib/db";

export async function getDashboardStats(): Promise<{
  success: boolean;
  data?: {
    totalBackups: number;
    securityAlerts: number;
    systemStatus: string;
    integrityInfo: {
      mysql: boolean;
      gdrive: boolean;
      ai: boolean;
    };
    bugCount: number;
    saranCount: number;
    recentFeedbacks: any[];
  };
  error?: string;
}> {
  try {
    // 1. Get Total Backups count
    const backupRes = await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM mcdbackup_backups"
    );

    // 2. Get Security Events in last 24h
    const secRes = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM mcd_system_logs
       WHERE category = 'SECURITY' AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    // 3. Feedback counts
    const bugRes = await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM feedbacks WHERE type = 'bug' AND status = 'open'"
    );

    const saranRes = await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM feedbacks WHERE type = 'saran' AND status = 'open'"
    );

    const recentFeedbacks = await query(
      "SELECT * FROM feedbacks ORDER BY created_at DESC LIMIT 4"
    );

    // 4. System Integrity Check
    const integrity = {
      mysql: true,
      gdrive: !!process.env.GOOGLE_DRIVE_FOLDER_ID && !!process.env.GOOGLE_DRIVE_CLIENT_ID,
      ai: !!process.env.GROQ_API_KEY,
    };

    const isHealthy = Object.values(integrity).every(Boolean);

    return {
      success: true,
      data: {
        totalBackups: backupRes?.count || 0,
        securityAlerts: secRes?.count || 0,
        systemStatus: isHealthy ? 'Stable' : 'Degraded',
        integrityInfo: integrity,
        bugCount: bugRes?.count || 0,
        saranCount: saranRes?.count || 0,
        recentFeedbacks: recentFeedbacks || [],
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      error: "Failed to aggregate system statistics",
    };
  }
}
