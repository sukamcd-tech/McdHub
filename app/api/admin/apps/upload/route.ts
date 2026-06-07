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

    // 2. Parse FormData
    const formData = await request.formData();
    const appName = formData.get("app_name") as string;
    const version = formData.get("version") as string;
    const apkFile = formData.get("apk_file") as File | null;

    if (!appName || !version || !apkFile) {
      return NextResponse.json(
        { error: "Missing required parameters (app_name, version, apk_file)" },
        { status: 400 }
      );
    }

    if (apkFile.size === 0) {
      return NextResponse.json({ error: "Empty file uploaded" }, { status: 400 });
    }

    // 3. Prepare upload
    const mobile = getMobileClient();
    const slug = appName.toLowerCase().replace(/\s+/g, "-");
    const fileName = `${slug}/v${version}/${slug}-v${version}.apk`;
    const apkSizeBytes = apkFile.size;

    const arrayBuffer = await apkFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Supabase Storage
    const { error: uploadError } = await mobile.storage
      .from("releases")
      .upload(fileName, buffer, {
        contentType: "application/vnd.android.package-archive",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      apkPath: fileName,
      apkSizeBytes,
    });
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during upload" },
      { status: 500 }
    );
  }
}
