"use server";

import crypto from "crypto";
import { query, execute } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { recordLog } from "@/lib/actions/log-actions";

export async function getProjects() {
  try {
    const rows = await query(
      "SELECT * FROM mcd_projects ORDER BY display_order ASC, created_at DESC"
    );
    return rows;
  } catch (error) {
    console.error("Error fetching projects from MySQL:", error);
    return [];
  }
}

export async function createProject(projectData: any) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const id = projectData.id || crypto.randomUUID();
    const {
      title,
      description = "",
      category = "Web Development",
      status = "active",
      url = "",
      display_order = 0,
      icon = null,
    } = projectData;

    await execute(
      `INSERT INTO mcd_projects (id, user_id, title, description, category, status, url, display_order, icon)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user.id, title, description, category, status, url, display_order, icon]
    );

    await recordLog(
      "PROJECT_CREATED",
      "USER_ACTION",
      `Created project: ${title || "New Project"}`,
      { project_id: id, projectData }
    );

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating project:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProject(id: string, projectData: any) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const fields: string[] = [];
    const values: any[] = [];

    const allowedKeys = ["title", "description", "category", "status", "url", "display_order", "icon"];
    for (const key of allowedKeys) {
      if (projectData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(projectData[key]);
      }
    }

    if (fields.length === 0) {
      return { success: true };
    }

    values.push(id);
    await execute(`UPDATE mcd_projects SET ${fields.join(", ")} WHERE id = ?`, values);

    await recordLog(
      "PROJECT_UPDATED",
      "USER_ACTION",
      `Updated project ID: ${id}`,
      { id, changes: projectData }
    );

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating project:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await execute("DELETE FROM mcd_projects WHERE id = ?", [id]);

    await recordLog(
      "PROJECT_DELETED",
      "USER_ACTION",
      `Deleted project ID: ${id}`,
      { id }
    );

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return { success: false, error: error.message };
  }
}
