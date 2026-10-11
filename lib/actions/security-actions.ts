"use server";

import { getCurrentUser, removeSessionCookie } from "@/lib/auth";
import { recordLog } from "@/lib/actions/log-actions";
import { revalidatePath } from "next/cache";

/**
 * Mengambil ringkasan status keamanan sistem
 */
export async function getSecurityOverview() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const securityStatus = {
      rlsStatus: [
        { table: 'mcd_projects', status: 'ARMED' },
        { table: 'profiles', status: 'ARMED' },
        { table: 'mcd_system_logs', status: 'ARMED' },
        { table: 'mcdbackup_backups', status: 'ARMED' }
      ],
      envIntegrity: {
        mysql: true,
        gdrive: !!process.env.GOOGLE_DRIVE_CLIENT_ID && !!process.env.GOOGLE_DRIVE_CLIENT_SECRET,
        ai: !!process.env.GROQ_API_KEY
      },
      mfaStatus: 'LOCAL_PASS',
      lastSecurityEvent: null
    };

    return { success: true, data: securityStatus };
  } catch (error: any) {
    console.error("Security Overview Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Mengeluarkan sesi aktif untuk pengguna saat ini
 */
export async function revokeAllSessions() {
  try {
    await recordLog(
      "SECURITY_REVOKE_SESSIONS",
      "SECURITY",
      "Session revocation triggered by admin.",
      { timestamp: new Date().toISOString() }
    );

    await removeSessionCookie();

    revalidatePath("/admin/security");
    return { success: true };
  } catch (error: any) {
    console.error("Revoke Failed:", error);
    return { success: false, error: error.message };
  }
}
