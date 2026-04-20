import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Music, Building2, Mic2, Truck } from "lucide-react";

const roles = [
  {
    id: "productor",
    label: "Soy Productor",
    description: "Organizo eventos y busco espacios, artistas y proveedores",
    icon: Music,
    href: "/login?role=productor",
  },
  {
    id: "venue",
    label: "Soy Espacio",
    description: "Tengo un local y quiero recibir solicitudes de eventos",
    icon: Building2,
    href: "/login?role=venue",
  },
  {
    id: "artista",
    label: "Soy Artista",
    description: "Quiero que productores me encuentren para sus eventos",
    icon: Mic2,
    href: "/login?role=artista",
  },
  {
    id: "proveedor",
    label: "Soy Proveedor",
    description: "Ofrezco servicios para producción de eventos",
    icon: Truck,
    href: "/login?role=proveedor",
  },
];

export default function SelectRolePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-12 text-center">
        <Logo className="mx-auto h-10 mb-4" />
        <p className="text-text-secondary text-lg">
          Tu sistema operativo para producción de eventos
        </p>
      </div>

      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Link
              key={role.id}
              href={role.href}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent hover:bg-surface-hover"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">{role.label}</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {role.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
