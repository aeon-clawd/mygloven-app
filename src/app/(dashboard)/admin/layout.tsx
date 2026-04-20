"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Users,
  CalendarDays,
} from "lucide-react";
import type { NavItem } from "@/components/layout/sidebar";

const adminNav: NavItem[] = [
  { label: "Panel", href: "/admin/panel", icon: LayoutDashboard },
  { label: "Espacios", href: "/admin/espacios", icon: Building2 },
  { label: "Candidaturas", href: "/admin/candidaturas", icon: ClipboardCheck },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users },
  { label: "Eventos", href: "/admin/eventos", icon: CalendarDays },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell items={adminNav} role="Admin">
      {children}
    </DashboardShell>
  );
}
