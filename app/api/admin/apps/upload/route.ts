import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient as createSupabaseDirectClient } from "@supabase/supabase-js";

function getMobileClient() {
  return createSupabaseDirectClient(
    process.env.NEXT_PUBLIC_MOBILE_SUPABASE_URL!,
    process.env.MOBILE_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_MOBILE_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse JSON body
    const { app_name, version } = await request.json();
    if (!app_name || !version) {
      return NextResponse.json(
        { error: "Missing required parameters (app_name, version)" },
        { status: 400 }
      );
    }

    // 3. Prepare path
    const mobile = getMobileClient();
    const slug = app_name.toLowerCase().replace(/\s+/g, "-");
    const fileName = `${slug}/v${version}/${slug}-v${version}.apk`;

    // 4. Generate signed upload URL from Supabase Storage
    const { data, error } = await mobile.storage
      .from("releases")
      .createSignedUploadUrl(fileName);

    if (error || !data) {
      return NextResponse.json(
        { error: `Gagal membuat upload URL: ${error?.message || "Data kosong"}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      fileName,
    });
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
