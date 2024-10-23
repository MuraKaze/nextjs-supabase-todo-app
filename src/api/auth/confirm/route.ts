import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  // Validate parameters
  if (!token_hash || !type) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  const supabase = createClient();

  // Verify the OTP
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  });

  // Handle error
  if (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  // Redirect if successful
  redirectTo.searchParams.delete("next");
  return NextResponse.redirect(redirectTo);
}
