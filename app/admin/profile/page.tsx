import { getCurrentUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import AdminProfileClient from "@/components/admin/AdminProfileClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Profile | SukaMCD",
  description: "Manage your administrative identity and security settings.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await queryOne(
    "SELECT * FROM profiles WHERE id = ? LIMIT 1",
    [user.id]
  );

  return (
    <div className="p-4">
      <AdminProfileClient profile={profile || user} userEmail={user.email || ""} />
    </div>
  );
}
