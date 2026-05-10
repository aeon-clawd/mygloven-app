"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Eyebrow } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";
import { Marquee } from "@/components/layout/marquee";
import { createClient } from "@/lib/supabase/client";

const roleRoutes: Record<string, string> = {
  admin: "/admin/panel",
  productor: "/productor/eventos",
  venue: "/espacio/home",
};

const authMarquee = [
  "my'G — sistema operativo de eventos",
  "v2.0 — industrial brutalist",
  "Acceso · productor · espacio · artista",
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auth pages need scroll
  useEffect(() => {
    document.body.classList.add("scroll-auto");
    return () => {
      document.body.classList.remove("scroll-auto");
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("rol, estado")
          .eq("id", user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              if (profile.estado === "pendiente" && profile.rol !== "productor") {
                router.push("/register/pendiente");
              } else {
                router.push(roleRoutes[profile.rol] || "/productor/eventos");
              }
              router.refresh();
            }
          });
      }
    });
  }, [router]);

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
    });
  }

  async function handleEmailLogin() {
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("rol, estado")
        .eq("id", data.user.id)
        .single();

      if (!profile) {
        router.push("/select-role");
      } else if (profile.estado === "pendiente" && profile.rol !== "productor") {
        router.push("/register/pendiente");
      } else {
        router.push(roleRoutes[profile.rol] || "/productor/eventos");
      }
      router.refresh();
    }

    setLoading(false);
  }

  async function handleEmailRegister() {
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nombre } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        nombre: nombre || email,
        email,
        rol: "productor",
        estado: "activo",
      });
      router.push("/productor/eventos");
      router.refresh();
    }

    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "login") await handleEmailLogin();
    else await handleEmailRegister();
  }

  return (
    <>
      <Marquee items={authMarquee} />
      <div className="auth-stage">
        <div className="auth-left">
          <div className="brand">
            my<span className="ap">&apos;</span>G
          </div>
          <div className="display">
            Operación
            <br />
            de eventos<span className="ap">.</span>
          </div>
          <div className="footer-meta">
            <span>v2.0 · Industrial</span>
            <span>10.05.2026 · MAD</span>
          </div>
        </div>

        <div className="auth-right">
          <Eyebrow>— {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</Eyebrow>
          <h2>{mode === "login" ? "Accede al sistema." : "Bienvenido."}</h2>
          <p className="sub">
            Tu panel personal según tu rol — productor, espacio, artista o proveedor.
          </p>

          <Button
            type="button"
            onClick={handleGoogleLogin}
            size="lg"
            full
            data-cursor="continuar →"
          >
            <Icon.google /> Continuar con Google
          </Button>

          <div className="divider">o con email</div>

          <form onSubmit={handleSubmit} className="flex-col">
            {mode === "register" && (
              <Field label="Nombre">
                <Input
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </Field>
            )}

            <Field label="Email">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field label="Contraseña">
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </Field>

            {error && (
              <div
                style={{
                  padding: 10,
                  background: "rgba(255,59,59,0.08)",
                  color: "var(--color-error)",
                  borderRadius: 4,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              full
              disabled={loading}
              data-cursor={mode === "login" ? "entrar →" : "crear →"}
            >
              {loading
                ? "Cargando…"
                : mode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
              <Icon.arrow />
            </Button>
          </form>

          <div
            style={{
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {mode === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  style={{ color: "var(--color-accent)", cursor: "none" }}
                  data-cursor="registrarse"
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  style={{ color: "var(--color-accent)", cursor: "none" }}
                  data-cursor="entrar"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
