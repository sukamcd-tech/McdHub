"use server";

import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { query, execute } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { recordLog } from "@/lib/actions/log-actions";
import { sendReleasePushNotification } from "@/lib/notification";

// ── Fetch semua releases ──
export async function getAppReleases() {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const rows = await query(
      "SELECT * FROM app_releases ORDER BY created_at DESC"
    );
    return rows.map((r: any) => ({
      ...r,
      changelog: typeof r.changelog === 'string' ? JSON.parse(r.changelog) : r.changelog,
      is_latest: Boolean(r.is_latest),
      force_update: Boolean(r.force_update),
    }));
  } catch (error) {
    console.error("Error fetching releases:", error);
    return [];
  }
}

// ── Upload APK ke penyimpanan lokal dan simpan metadata ──
export async function createAppRelease(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const appName = formData.get("app_name") as string;
  const version = formData.get("version") as string;
  const releaseDate = formData.get("release_date") as string;
  const sizeLabel = formData.get("size_label") as string;
  const changelogRaw = formData.get("changelog") as string;
  const apkFile = formData.get("apk_file") as File | null;
  const forceUpdate = formData.get("force_update") === "true";

  let apkPath: string | null = formData.get("apk_path") as string | null;
  let apkSizeBytes: number | null = formData.get("apk_size_bytes")
    ? Number(formData.get("apk_size_bytes"))
    : null;

  try {
    // Upload APK ke public/uploads/releases
    if (!apkPath && apkFile && apkFile.size > 0) {
      const slug = appName.toLowerCase().replace(/\s+/g, "-");
      const relativeFolder = path.join("uploads", "releases", slug, `v${version}`);
      const targetDir = path.join(process.cwd(), "public", relativeFolder);
      await fs.mkdir(targetDir, { recursive: true });

      const fileName = `${slug}-v${version}.apk`;
      const fullPath = path.join(targetDir, fileName);
      apkSizeBytes = apkFile.size;

      const arrayBuffer = await apkFile.arrayBuffer();
      await fs.writeFile(fullPath, Buffer.from(arrayBuffer));

      apkPath = `/${relativeFolder}/${fileName}`;
    }

    // Parse changelog
    const changelog = (changelogRaw || "")
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

    const id = crypto.randomUUID();

    // Reset is_latest sebelumnya untuk app ini
    await execute(
      "UPDATE app_releases SET is_latest = FALSE WHERE app_name = ?",
      [appName]
    );

    // Insert release baru
    await execute(
      `INSERT INTO app_releases (id, app_name, version, release_date, size_label, apk_path, apk_size_bytes, changelog, is_latest, force_update)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [
        id,
        appName,
        version,
        releaseDate,
        sizeLabel,
        apkPath,
        apkSizeBytes,
        JSON.stringify(changelog),
        forceUpdate,
      ]
    );

    await recordLog(
      "APP_RELEASE_CREATED",
      "USER_ACTION",
      `Published ${appName} v${version}`,
      { appName, version, apkPath }
    );

    // Kirim push notification jika ada Firebase FCM
    try {
      sendReleasePushNotification(version, appName, forceUpdate).catch((err) => {
        console.error("Failed to send release push notification:", err);
      });
    } catch {
      // ignore
    }

    revalidatePath("/admin/apps");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating app release:", error);
    return { success: false, error: error.message };
  }
}

// ── Update metadata release ──
export async function updateAppRelease(id: string, data: {
  version?: string;
  release_date?: string;
  size_label?: string;
  changelog?: Array<{ type: string; text: string }>;
  is_latest?: boolean;
  force_update?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.version !== undefined) {
      fields.push("version = ?");
      values.push(data.version);
    }
    if (data.release_date !== undefined) {
      fields.push("release_date = ?");
      values.push(data.release_date);
    }
    if (data.size_label !== undefined) {
      fields.push("size_label = ?");
      values.push(data.size_label);
    }
    if (data.changelog !== undefined) {
      fields.push("changelog = ?");
      values.push(JSON.stringify(data.changelog));
    }
    if (data.is_latest !== undefined) {
      fields.push("is_latest = ?");
      values.push(data.is_latest);
    }
    if (data.force_update !== undefined) {
      fields.push("force_update = ?");
      values.push(data.force_update);
    }

    if (fields.length > 0) {
      values.push(id);
      await execute(`UPDATE app_releases SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`, values);
    }

    revalidatePath("/admin/apps");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── Hapus release dan APK dari disk lokal ──
export async function deleteAppRelease(id: string, apkPath: string | null) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    if (apkPath && apkPath.startsWith("/uploads/")) {
      const fullPath = path.join(process.cwd(), "public", apkPath);
      await fs.unlink(fullPath).catch(() => {});
    }

    await execute("DELETE FROM app_releases WHERE id = ?", [id]);

    await recordLog("APP_RELEASE_DELETED", "USER_ACTION", `Deleted release ID: ${id}`, { id });
    revalidatePath("/admin/apps");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
