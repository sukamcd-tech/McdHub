import { getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import ClientProfileClient from "@/components/ClientProfileClient";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile | SukaMCD",
  description: "Manage your client identity and security settings.",
};

export default async function ClientProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/gateway");
  }

  const profile = await queryOne(
    "SELECT * FROM profiles WHERE id = ? LIMIT 1",
    [user.id]
  );

  const orders = await query(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    [user.id]
  );

  return (
    <ClientProfileClient
      profile={profile || user}
      userEmail={user.email || ""}
      orders={orders || []}
    />
  );
}
