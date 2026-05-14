import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { NavItem } from "@/components/layout/sidebar";

const artistaNav: NavItem[] = [
  { label: "Mis eventos", href: "/artista/eventos" },
  { label: "Solicitudes", href: "/artista/solicitudes" },
  { label: "Calendario", href: "/artista/calendario" },
];

const artistaMarquee = [
  "my'G — sistema operativo de eventos",
  "Tu agenda · panel de gestión",
  "Solicitudes · eventos confirmados",
  "v2.0 — industrial brutalist",
];

export default function ArtistaLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell items={artistaNav} role="Artista" marqueeItems={artistaMarquee}>
      {children}
    </DashboardShell>
  );
}
