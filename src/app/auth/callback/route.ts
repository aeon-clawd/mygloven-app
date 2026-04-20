import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const role = requestUrl.searchParams.get("role") || "productor";
  const origin = requestUrl.origin;
  const error_param = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  console.log("[auth/callback] URL:", request.url);
  console.log("[auth/callback] code:", code ? "present" : "missing");
  console.log("[auth/callback] role:", role);
  console.log("[auth/callback] error:", error_param, error_description);

  if (error_param) {
    console.error("[auth/callback] OAuth error:", error_param, error_description);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_description || error_param)}`
    );
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[auth/callback] user:", user?.id || "null");

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_session`);
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, rol, estado")
    .eq("id", user.id)
    .single();

  console.log("[auth/callback] profile:", existingProfile?.rol, existingProfile?.estado);

  if (!existingProfile) {
    const isProducer = role === "productor";
    await supabase.from("profiles").insert({
      id: user.id,
      nombre: user.user_metadata.full_name || user.email || "",
      email: user.email || "",
      avatar_url: user.user_metadata.avatar_url || null,
      rol: role,
      estado: isProducer ? "activo" : "pendiente",
    });

    if (!isProducer) {
      return NextResponse.redirect(`${origin}/register?role=${role}`);
    }

    return NextResponse.redirect(`${origin}/productor/eventos`);
  }

  if (existingProfile.estado === "pendiente" && existingProfile.rol !== "productor") {
    return NextResponse.redirect(`${origin}/register/pendiente`);
  }

  const roleRoutes: Record<string, string> = {
    admin: "/admin/panel",
    productor: "/productor/eventos",
    venue: "/espacio/home",
  };

  return NextResponse.redirect(
    `${origin}${roleRoutes[existingProfile.rol] || "/productor/eventos"}`
  );
}
