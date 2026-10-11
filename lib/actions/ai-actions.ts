"use server";

import { query, queryOne, execute } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getConversations() {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const data = await query(
      "SELECT * FROM mcdai_conversations WHERE user_id = ? ORDER BY created_at DESC",
      [user.id]
    );
    return data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

export async function getMessages(conversationId: string | number) {
  try {
    const data = await query(
      "SELECT * FROM mcdai_messages WHERE conversation_id = ? ORDER BY created_at ASC",
      [conversationId]
    );
    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export async function deleteConversation(conversationId: string | number) {
  try {
    await execute("DELETE FROM mcdai_conversations WHERE id = ?", [conversationId]);
    revalidatePath("/admin/mcdai");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAISettings(settings: any) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    await execute(
      "UPDATE profiles SET bio = ? WHERE id = ?",
      [JSON.stringify(settings), user.id]
    );
    revalidatePath("/admin/mcdai");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSystemContext() {
  try {
    // 1. Projects
    const projectRes = await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM mcd_projects");
    // 2. Backups
    const backupRes = await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM mcdbackup_backups");
    // 3. Security (24h)
    const securityRes = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM mcd_system_logs
       WHERE category = 'SECURITY' AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    const integrity = {
      mysql: true,
      gdrive: !!process.env.GOOGLE_DRIVE_FOLDER_ID && !!process.env.GOOGLE_DRIVE_CLIENT_ID,
      ai: !!process.env.GROQ_API_KEY
    };
    const isHealthy = Object.values(integrity).every(Boolean);

    return `
SYSTEM REAL-TIME DATA:
- Total Projects Registered: ${projectRes?.count || 0}
- Total Cloud Backups: ${backupRes?.count || 0}
- Security Threats Blocked (24h): ${securityRes?.count || 0}
- System Environment Status: ${isHealthy ? 'STABLE' : 'DEGRADED'}
- Integrity Check: MySQL=${integrity.mysql}, GDrive=${integrity.gdrive}, AI=${integrity.ai}
- Current Server Time: ${new Date().toLocaleString()}
`;
  } catch (error) {
    console.error("Failed to get system context for AI:", error);
    return "Caution: Real-time system data is currently unavailable. Stick to general knowledge.";
  }
}
