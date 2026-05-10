import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { NavItem } from "@/components/layout/sidebar";

const productorNav: NavItem[] = [
  { label: "Mis eventos", href: "/productor/eventos" },
  { label: "Nuevo evento", href: "/productor/canvas" },
];

const productorMarquee = [
  "my'G — sistema operativo de eventos",
  "Productor · canvas + brief",
  "Habla con my'G — el sistema rellena el brief",
  "v2.0 — industrial brutalist",
];

export default function ProductorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell items={productorNav} role="Productor" marqueeItems={productorMarquee}>
      {children}
    </DashboardShell>
  );
}
