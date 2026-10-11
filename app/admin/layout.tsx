import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/gateway");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex h-screen overflow-hidden text-zinc-100" style={{ background: "var(--bg-root)" }}>
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <AdminHeader user={user as any} profile={{ profile_picture: user.profile_picture || null }} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
