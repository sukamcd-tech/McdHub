"use server";

import { execute } from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const phone_number = formData.get("phone_number") as string;
  const bio = formData.get("bio") as string;

  try {
    await execute(
      `UPDATE profiles
       SET name = ?, username = ?, phone_number = ?, bio = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, username, phone_number, bio, user.id]
    );

    revalidatePath("/admin/profile");
    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePassword(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const password = formData.get("password") as string;
  const passwordConfirmation = formData.get("password_confirmation") as string;

  if (password !== passwordConfirmation) {
    return { success: false, error: "Passwords do not match" };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  try {
    const hashed = hashPassword(password);
    await execute(
      `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
      [hashed, user.id]
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAvatarUrl(url: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    await execute(
      `UPDATE profiles SET profile_picture = ?, updated_at = NOW() WHERE id = ?`,
      [url, user.id]
    );

    revalidatePath("/admin/profile");
    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
