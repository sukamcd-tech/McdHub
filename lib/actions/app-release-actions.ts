"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient as createSupabaseDirectClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { recordLog } from "@/lib/actions/log-actions";
import { sendReleasePushNotification } from "@/lib/notification";

// Mobile Supabase client (server-side, dengan service role untuk upload)
function getMobileClient() {
  return createSupabaseDirectClient(
    process.env.NEXT_PUBLIC_MOBILE_SUPABASE_URL!,
    // Gunakan service role key jika ada, fallback ke anon key
    process.env.MOBILE_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_MOBILE_SUPABASE_ANON_KEY!
  );
}

// ── Fetch semua releases ──
export async function getAppReleases() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const mobile = getMobileClient();
  const { data, error } = await mobile
    .from("app_releases")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching releases:", error);
    return [];
  }
  return data ?? [];
}

// ── Upload APK ke Supabase Storage dan simpan metadata ──
export async function createAppRelease(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const mobile = getMobileClient();

  const appName = formData.get("app_name") as string;
  const version = formData.get("version") as string;
  const releaseDate = formData.get("release_date") as string;
  const sizeLabel = formData.get("size_label") as string;
  const changelogRaw = formData.get("changelog") as string;
  const apkFile = formData.get("apk_file") as File | null;
  const forceUpdate = formData.get("force_update") === "true";

  let apkPath: string | null = null;
  let apkSizeBytes: number | null = null;

  // Upload APK jika ada file
  if (apkFile && apkFile.size > 0) {
    const slug = appName.toLowerCase().replace(/\s+/g, "-");
    const fileName = `${slug}/v${version}/${slug}-v${version}.apk`;
    apkSizeBytes = apkFile.size;

    const arrayBuffer = await apkFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await mobile.storage
      .from("releases")
      .upload(fileName, buffer, {
        contentType: "application/vnd.android.package-archive",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: `Upload gagal: ${uploadError.message}` };
    }
    apkPath = fileName;
  }

  // Parse changelog (format: satu baris per item, prefix: new:, fix:, improve:)
  const changelog = changelogRaw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [typeRaw, ...rest] = line.split(":");
      const type = ["new", "fix", "improve"].includes(typeRaw.toLowerCase())
        ? typeRaw.toLowerCase()
        : "new";
      const text = rest.join(":").trim() || line;
      return { type, text };
    });

  const { error: insertError } = await mobile.from("app_releases").insert([
    {
      app_name: appName,
      version,
      release_date: releaseDate,
      size_label: sizeLabel,
      apk_path: apkPath,
      apk_size_bytes: apkSizeBytes,
      changelog,
      is_latest: true, // akan di-handle di bawah
      force_update: forceUpdate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  if (insertError) return { success: false, error: insertError.message };

  // Set semua versi lain is_latest = false
  await mobile
    .from("app_releases")
    .update({ is_latest: false })
    .eq("app_name", appName)
    .neq("version", version);

  // Set versi ini sebagai latest
  await mobile
    .from("app_releases")
    .update({ is_latest: true })
    .eq("app_name", appName)
    .eq("version", version);

  await recordLog(
    "APP_RELEASE_CREATED",
    "USER_ACTION",
    `Published ${appName} v${version}`,
    { appName, version, apkPath }
  );

  // Kirim push notification ke topik mcdwallet_updates (async)
  sendReleasePushNotification(version, appName, forceUpdate).catch((err) => {
    console.error("Failed to send release push notification:", err);
  });

  revalidatePath("/admin/apps");
  return { success: true };
}

// ── Update metadata release (tanpa re-upload APK) ──
export async function updateAppRelease(id: string, data: {
  version?: string;
  release_date?: string;
  size_label?: string;
  changelog?: Array<{ type: string; text: string }>;
  is_latest?: boolean;
  force_update?: boolean;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const mobile = getMobileClient();
  const { error } = await mobile
    .from("app_releases")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/apps");
  return { success: true };
}

// ── Hapus release dan APK dari storage ──
export async function deleteAppRelease(id: string, apkPath: string | null) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const mobile = getMobileClient();

  // Hapus file APK dari storage jika ada
  if (apkPath) {
    await mobile.storage.from("releases").remove([apkPath]);
  }

  const { error } = await mobile.from("app_releases").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  await recordLog("APP_RELEASE_DELETED", "USER_ACTION", `Deleted release ID: ${id}`, { id });
  revalidatePath("/admin/apps");
  return { success: true };
}
