"use server";

import { query, execute } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export type LogCategory = 'SYSTEM' | 'SECURITY' | 'USER_ACTION' | 'DATABASE' | 'AUTH';

/**
 * Merekam aktivitas sistem ke dalam mcd_system_logs
 */
export async function recordLog(
  action: string,
  category: LogCategory = 'SYSTEM',
  description?: string,
  metadata: any = {}
) {
  try {
    const user = await getCurrentUser();

    await execute(
      `INSERT INTO mcd_system_logs (user_id, action, category, description, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user?.id || null,
        action,
        category,
        description || '',
        JSON.stringify({
          ...metadata,
          ip: "Server-Side",
          timestamp: new Date().toISOString()
        })
      ]
    );

    return { success: true };
  } catch (error: any) {
    console.error("Critical Logger Failure:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Mendapatkan daftar log terbaru dari database
 */
export async function getSystemLogs(limit = 50) {
  try {
    const rows = await query(
      `SELECT l.*, p.profile_picture, p.name as user_name
       FROM mcd_system_logs l
       LEFT JOIN profiles p ON l.user_id = p.id
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [limit]
    );

    // Parse metadata JSON if returned as string
    const parsedLogs = rows.map((log: any) => ({
      ...log,
      metadata: typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata,
      profiles: log.profile_picture ? { profile_picture: log.profile_picture, name: log.user_name } : null
    }));

    return { success: true, logs: parsedLogs };
  } catch (error: any) {
    console.error("Failed to fetch logs:", error);
    return { success: false, error: error.message };
  }
}
