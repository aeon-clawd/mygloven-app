"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CalendarDays, Plus } from "lucide-react";
import type { NavItem } from "@/components/layout/sidebar";

const productorNav: NavItem[] = [
  { label: "Mis eventos", href: "/productor/eventos", icon: CalendarDays },
  { label: "Nuevo evento", href: "/productor/canvas", icon: Plus },
];

export default function ProductorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell items={productorNav} role="Productor">
      {children}
    </DashboardShell>
  );
}
