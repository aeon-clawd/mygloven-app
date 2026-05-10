import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { NavItem } from "@/components/layout/sidebar";

const adminNav: NavItem[] = [
  { label: "Panel", href: "/admin/panel" },
  { label: "Candidaturas", href: "/admin/candidaturas" },
  { label: "Eventos", href: "/admin/eventos" },
  { label: "Espacios", href: "/admin/espacios" },
  { label: "Artistas", href: "/admin/artistas" },
  { label: "Usuarios", href: "/admin/usuarios" },
];

const adminMarquee = [
  "my'G — sistema operativo de eventos",
  "v2.0 — industrial brutalist",
  "Admin · panel de operaciones",
  "España · Portugal · Europa",
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell items={adminNav} role="Admin" marqueeItems={adminMarquee}>
      {children}
    </DashboardShell>
  );
}
