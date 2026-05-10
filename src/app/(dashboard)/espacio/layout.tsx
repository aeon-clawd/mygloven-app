import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { NavItem } from "@/components/layout/sidebar";

const espacioNav: NavItem[] = [
  { label: "Inicio", href: "/espacio/home" },
  { label: "Mis eventos", href: "/espacio/eventos" },
  { label: "Solicitudes", href: "/espacio/solicitudes" },
  { label: "Calendario", href: "/espacio/calendario" },
  { label: "Mi perfil", href: "/espacio/perfil" },
];

const espacioMarquee = [
  "my'G — sistema operativo de eventos",
  "Tu espacio · panel de gestión",
  "Solicitudes · calendario · perfil",
  "v2.0 — industrial brutalist",
];

export default function EspacioLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell items={espacioNav} role="Espacio" marqueeItems={espacioMarquee}>
      {children}
    </DashboardShell>
  );
}
