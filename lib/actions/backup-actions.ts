"use server";

import { query, execute } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateBackupFilename, uploadToDrive } from "@/lib/gdrive";
import { recordLog } from "@/lib/actions/log-actions";
import archiver from "archiver";
import { PassThrough } from "stream";

export async function getBackupHistory() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const data = await query(
      "SELECT * FROM mcdbackup_backups ORDER BY created_at DESC LIMIT 5"
    );

    return { success: true, history: data };
  } catch (error: any) {
    console.error("Failed to fetch backup history:", error);
    return { success: false, error: error.message };
  }
}

export async function triggerManualBackup() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // 1. Fetch Data
    const projects = await query("SELECT * FROM mcd_projects ORDER BY display_order ASC");
    const profiles = await query("SELECT * FROM profiles");

    // 2. Generate SQL Dump String
    const generateSQL = (tableName: string, rows: any[]) => {
      if (!rows || rows.length === 0) return `-- No data for ${tableName}\n`;
      
      const columns = Object.keys(rows[0]).join(", ");
      const values = rows.map(row => {
        const val = Object.values(row).map(v => {
          if (v === null) return "NULL";
          if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
          if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
          return v;
        }).join(", ");
        return `(${val})`;
      }).join(",\n");

      return `INSERT INTO ${tableName} (${columns}) VALUES\n${values};\n\n`;
    };

    const sqlDump = [
      `-- SukaMCD Strategic Backup SQL Dump\n`,
      `-- Generated at: ${new Date().toISOString()}\n\n`,
      generateSQL("profiles", profiles || []),
      generateSQL("mcd_projects", projects || []),
    ].join("");

    // 3. Prepare Backup Metadata
    const filename = generateBackupFilename();
    const metadata = {
      backup_name: filename.replace(".zip", ""),
      version: "2.1.0",
      created_at: new Date().toISOString(),
      created_by: user.email,
      project_count: projects?.length || 0,
      profile_count: profiles?.length || 0,
      environment: "Production"
    };

    // 4. Create ZIP Stream
    const passthrough = new PassThrough();
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.pipe(passthrough);

    // Add database data
    archive.append(JSON.stringify(projects, null, 2), { name: 'database/projects.json' });
    archive.append(sqlDump, { name: 'database/sukamcd.sql' });
    
    // Add metadata
    archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });
    archive.append('', { name: 'mcdcrypt_files/.gitkeep' });

    // Finalize archive
    const finalizePromise = archive.finalize();

    // 5. Upload to Drive
    const uploadResult = await uploadToDrive(filename, passthrough);
    await finalizePromise;

    // 6. Persist to Database
    const fileSize = (archive.pointer() / 1024).toFixed(2) + " KB";
    
    await execute(
      "INSERT INTO mcdbackup_backups (filename, size, type) VALUES (?, ?, 'manual')",
      [filename, fileSize]
    );

    // 7. Success log
    await recordLog(
      "BACKUP_SUCCESS",
      "SYSTEM",
      `Cloud backup completed successfully. Filename: ${filename}`,
      { filename, size: fileSize, driveId: uploadResult.id }
    );

    return { 
      success: true, 
      filename: filename,
      driveId: uploadResult.id,
      size: fileSize,
      created_at: new Date().toISOString()
    };

  } catch (error: any) {
    console.error("Backup failed:", error);
    
    await recordLog(
      "BACKUP_FAILED",
      "SECURITY",
      `Strategic backup failed: ${error.message}`,
      { error: error.message }
    );

    return { success: false, error: error.message };
  }
}
