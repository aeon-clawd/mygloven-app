"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function RegisterForm() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "venue";

  const roleLabels: Record<string, string> = {
    venue: "Espacio",
    artista: "Artista",
    proveedor: "Proveedor",
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <Logo className="mx-auto h-10 mb-6" />
          <h1 className="text-xl font-semibold">
            Registro como {roleLabels[role] || "Usuario"}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Completa tu candidatura. Un administrador revisará tu solicitud.
          </p>
        </div>

        <Card>
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Wizard de registro — próximamente
            </p>
            <Button className="w-full">Enviar candidatura</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
