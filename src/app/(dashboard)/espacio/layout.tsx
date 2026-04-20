"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Home,
  CalendarDays,
  Inbox,
  Calendar,
  UserCircle,
} from "lucide-react";
import type { NavItem } from "@/components/layout/sidebar";

const espacioNav: NavItem[] = [
  { label: "Inicio", href: "/espacio/home", icon: Home },
  { label: "Mis eventos", href: "/espacio/eventos", icon: CalendarDays },
  { label: "Solicitudes", href: "/espacio/solicitudes", icon: Inbox },
  { label: "Calendario", href: "/espacio/calendario", icon: Calendar },
  { label: "Mi perfil", href: "/espacio/perfil", icon: UserCircle },
];

export default function EspacioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell items={espacioNav} role="Espacio">
      {children}
    </DashboardShell>
  );
}
