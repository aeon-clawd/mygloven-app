"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const roleRoutes: Record<string, string> = {
  admin: "/admin/panel",
  productor: "/productor/eventos",
  venue: "/espacio/home",
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
  }

  async function handleEmailLogin() {
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { data, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

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
    if (mode === "login") {
      await handleEmailLogin();
    } else {
      await handleEmailRegister();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Logo className="mx-auto h-10 mb-6" />
          <h1 className="text-xl font-semibold">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Accede a tu panel de my&apos;G
          </p>
        </div>

        <Button
          type="button"
          onClick={handleGoogleLogin}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar con Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-text-muted">o con email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">
                Nombre
              </label>
              <Input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">
              Email
            </label>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">
              Contraseña
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Cargando..."
              : mode === "login"
                ? "Iniciar sesión"
                : "Crear cuenta"}
          </Button>
        </form>

        <div className="text-center text-sm text-text-secondary">
          {mode === "login" ? (
            <span>
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="text-accent hover:text-accent-hover font-medium"
              >
                Regístrate
              </button>
            </span>
          ) : (
            <span>
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="text-accent hover:text-accent-hover font-medium"
              >
                Inicia sesión
              </button>
            </span>
          )}
        </div>

        <p className="text-center text-xs text-text-muted">
          Al continuar, aceptas los términos y condiciones de my&apos;G
        </p>
      </div>
    </div>
  );
}
