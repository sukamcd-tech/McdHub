"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function getConversations() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  return data;
}

export async function getMessages(conversationId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data;
}

export async function deleteConversation(conversationId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/mcdai");
  return { success: true };
}

export async function updateAISettings(settings: any) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("profiles")
    .update({ ai_settings: settings })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/mcdai");
  return { success: true };
}

export async function getSystemContext() {
  const supabase = await createServerSupabaseClient();
  
  try {
    // 1. Projects
    const { count: projectCount } = await supabase
      .from('mcd_projects')
      .select('*', { count: 'exact', head: true });

    // 2. Backups
    const { count: backupCount } = await supabase
      .from('mcdbackup_backups')
      .select('*', { count: 'exact', head: true });

    // 3. Security (24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: securityCount } = await supabase
      .from('mcd_system_logs')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'SECURITY')
      .gt('created_at', yesterday);

    // 4. Integrity
    const integrity = {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      gdrive: !!process.env.GOOGLE_DRIVE_FOLDER_ID && !!process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      ai: !!process.env.GROQ_API_KEY
    };
    const isHealthy = Object.values(integrity).every(v => v);

    return `
SYSTEM REAL-TIME DATA:
- Total Projects Registered: ${projectCount || 0}
- Total Cloud Backups: ${backupCount || 0}
- Security Threats Blocked (24h): ${securityCount || 0}
- System Environment Status: ${isHealthy ? 'STABLE' : 'DEGRADED'}
- Integrity Check: Supabase=${integrity.supabase}, GDrive=${integrity.gdrive}, AI=${integrity.ai}
- Current Server Time: ${new Date().toLocaleString()}
`;
  } catch (error) {
    console.error("Failed to get system context for AI:", error);
    return "Caution: Real-time system data is currently unavailable. Stick to general knowledge.";
  }
}
