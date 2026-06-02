import { createServerSupabaseClient } from "@/lib/supabase-server";
import ClientProfileClient from "@/components/ClientProfileClient";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile | SukaMCD",
  description: "Manage your client identity and security settings.",
};

export default async function ClientProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/gateway");
  }

  // Fetch profile matching the authenticated user
  let { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Jika profil belum ada (kemungkinan desync)
  if (!profile || error) {
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert([
        { 
          id: user.id, 
          name: user.user_metadata?.full_name || user.email?.split('@')[0],
          username: user.email?.split('@')[0],
          role: 'client'
        }
      ])
      .select("*")
      .single();

    if (createError) {
      console.error("Profile creation error:", createError);
      return (
        <div className="flex items-center justify-center h-[60vh] text-zinc-500 font-mono uppercase tracking-widest text-xs text-center px-8">
          Error initializing profile: {createError.message}<br/>Please try again later.
        </div>
      );
    }
    profile = newProfile;
  }

  // Fetch orders matching the authenticated user
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error fetching orders:", ordersError);
  }

  return <ClientProfileClient profile={profile} userEmail={user.email || ""} orders={orders || []} />;
}
