"use server";

import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { query, queryOne, execute } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { encryptBuffer } from "@/lib/crypt/aes";
import { v4 as uuidv4 } from "uuid";

const CRYPT_DIR = path.join(process.cwd(), "data", "mcdcrypt");

async function ensureCryptDir(subdir = "") {
  const dir = path.join(CRYPT_DIR, subdir);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function getFiles(parentId: string | number | null = null) {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    let sql: string;
    let params: any[];

    if (parentId) {
      sql = "SELECT * FROM mcdcrypt_files WHERE (user_id = ? OR user_id IS NULL) AND parent_id = ? ORDER BY is_folder DESC, original_name ASC";
      params = [user.id, parentId];
    } else {
      sql = "SELECT * FROM mcdcrypt_files WHERE (user_id = ? OR user_id IS NULL) AND parent_id IS NULL ORDER BY is_folder DESC, original_name ASC";
      params = [user.id];
    }

    const data = await query(sql, params);
    return data.map((item: any) => ({
      ...item,
      is_folder: Boolean(item.is_folder),
      storage_path: item.encrypted_path,
    }));
  } catch (error) {
    console.error("Error fetching crypt files:", error);
    return [];
  }
}

export async function createFolder(name: string, parentId: string | number | null = null) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await execute(
      `INSERT INTO mcdcrypt_files (user_id, original_name, is_folder, parent_id)
       VALUES (?, ?, TRUE, ?)`,
      [user.id, name, parentId || null]
    );

    revalidatePath("/admin/mcdcrypt");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadFile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  const parentId = formData.get("parent_id") as string | null;

  if (!file) return { success: false, error: "No file provided" };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Enkripsi file menggunakan AES-256
    const encryptedBuffer = encryptBuffer(buffer);
    
    const userDir = await ensureCryptDir(user.id);
    const fileName = `${uuidv4()}.enc`;
    const fullPath = path.join(userDir, fileName);
    const storagePath = `${user.id}/${fileName}`;

    await fs.writeFile(fullPath, encryptedBuffer);

    // Simpan metadata ke MariaDB
    await execute(
      `INSERT INTO mcdcrypt_files (user_id, original_name, encrypted_path, mime_type, size, is_folder, parent_id)
       VALUES (?, ?, ?, ?, ?, FALSE, ?)`,
      [user.id, file.name, storagePath, file.type, file.size, parentId ? Number(parentId) : null]
    );

    revalidatePath("/admin/mcdcrypt");
    return { success: true };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteItem(id: string | number) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const item = await queryOne<any>("SELECT * FROM mcdcrypt_files WHERE id = ?", [id]);
  if (!item) return { success: false, error: "Item not found" };

  try {
    if (item.is_folder) {
      await deleteFolderContents(id);
    } else if (item.encrypted_path) {
      const fullPath = path.join(CRYPT_DIR, item.encrypted_path);
      await fs.unlink(fullPath).catch(() => {});
    }

    await execute("DELETE FROM mcdcrypt_files WHERE id = ?", [id]);

    revalidatePath("/admin/mcdcrypt");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function deleteFolderContents(folderId: string | number) {
  const children = await query<any>("SELECT * FROM mcdcrypt_files WHERE parent_id = ?", [folderId]);
  for (const child of children) {
    if (child.is_folder) {
      await deleteFolderContents(child.id);
    } else if (child.encrypted_path) {
      const fullPath = path.join(CRYPT_DIR, child.encrypted_path);
      await fs.unlink(fullPath).catch(() => {});
    }
  }
}

export async function renameItem(id: string | number, newName: string) {
  try {
    await execute(
      "UPDATE mcdcrypt_files SET original_name = ?, updated_at = NOW() WHERE id = ?",
      [newName, id]
    );
    revalidatePath("/admin/mcdcrypt");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function moveItem(id: string | number, newParentId: string | number | null) {
  if (id === newParentId) return { success: false, error: "Cannot move item into itself" };

  try {
    await execute(
      "UPDATE mcdcrypt_files SET parent_id = ?, updated_at = NOW() WHERE id = ?",
      [newParentId ? Number(newParentId) : null, id]
    );
    revalidatePath("/admin/mcdcrypt");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBreadcrumbs(folderId: string | number | null) {
  if (!folderId) return [];

  const breadcrumbs: { id: string; original_name: string }[] = [];
  let currentId: any = folderId;

  while (currentId) {
    const data = await queryOne<any>(
      "SELECT id, original_name, parent_id FROM mcdcrypt_files WHERE id = ?",
      [currentId]
    );
    if (!data) break;

    breadcrumbs.unshift({ id: String(data.id), original_name: data.original_name });
    currentId = data.parent_id;
  }

  return breadcrumbs;
}

export async function duplicateItem(id: string | number, targetParentId: string | number | null) {
  const source = await queryOne<any>("SELECT * FROM mcdcrypt_files WHERE id = ?", [id]);
  if (!source) return { success: false, error: "Item not found" };
  if (source.is_folder) return { success: false, error: "Folder duplication not yet supported" };

  try {
    let newStoragePath = null;

    if (source.encrypted_path) {
      const srcPath = path.join(CRYPT_DIR, source.encrypted_path);
      const userDir = path.dirname(source.encrypted_path);
      const newFileName = `${uuidv4()}.enc`;
      newStoragePath = path.join(userDir, newFileName);
      const destPath = path.join(CRYPT_DIR, newStoragePath);

      await fs.copyFile(srcPath, destPath);
    }

    await execute(
      `INSERT INTO mcdcrypt_files (user_id, original_name, encrypted_path, mime_type, size, is_folder, parent_id)
       VALUES (?, ?, ?, ?, ?, FALSE, ?)`,
      [
        source.user_id,
        `${source.original_name} - Copy`,
        newStoragePath,
        source.mime_type,
        source.size,
        targetParentId ? Number(targetParentId) : null,
      ]
    );

    revalidatePath("/admin/mcdcrypt");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
