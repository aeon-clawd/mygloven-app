import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname, searchParams } = request.nextUrl;

  const code = searchParams.get("code");
  if (code && pathname === "/login") {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("rol, estado")
          .eq("id", user.id)
          .single();

        const url = request.nextUrl.clone();
        url.search = "";

        if (!profile) {
          await supabase.from("profiles").insert({
            id: user.id,
            nombre: user.user_metadata.full_name || user.email || "",
            email: user.email || "",
            avatar_url: user.user_metadata.avatar_url || null,
            rol: "productor",
            estado: "activo",
          });
          url.pathname = "/productor/eventos";
        } else if (profile.estado === "pendiente" && profile.rol !== "productor") {
          url.pathname = "/register/pendiente";
        } else {
          const roleRoutes: Record<string, string> = {
            admin: "/admin/panel",
            productor: "/productor/eventos",
            venue: "/espacio/home",
          };
          url.pathname = roleRoutes[profile.rol] || "/productor/eventos";
        }

        // Copy auth cookies to the redirect response
        const redirectResponse = NextResponse.redirect(url);
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value);
        });
        return redirectResponse;
      }
    }

    const url = request.nextUrl.clone();
    url.search = "";
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicPaths = ["/", "/login", "/select-role", "/register", "/auth"];
  const isPublicPath = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
