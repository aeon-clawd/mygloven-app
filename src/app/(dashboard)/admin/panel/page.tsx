"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, CalendarDays, Inbox, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  productores: number;
  espacios: number;
  eventos: number;
  solicitudes: number;
  candidaturasPendientes: number;
}

interface CandidaturaReciente {
  id: string;
  rol: string;
  created_at: string;
  usuario: { nombre: string; email: string } | null;
}

export default function AdminPanelPage() {
  const [stats, setStats] = useState<Stats>({
    productores: 0,
    espacios: 0,
    eventos: 0,
    solicitudes: 0,
    candidaturasPendientes: 0,
  });
  const [candidaturasRecientes, setCandidaturasRecientes] = useState<CandidaturaReciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [productores, espacios, eventos, solicitudes, candidaturas, recientes] =
        await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("rol", "productor"),
          supabase.from("venues").select("id", { count: "exact", head: true }),
          supabase.from("eventos").select("id", { count: "exact", head: true }),
          supabase.from("solicitudes").select("id", { count: "exact", head: true }),
          supabase.from("candidaturas").select("id", { count: "exact", head: true }).eq("estado", "pendiente"),
          supabase
            .from("candidaturas")
            .select("id, rol, created_at, usuario:profiles!candidaturas_usuario_id_fkey(nombre, email)")
            .eq("estado", "pendiente")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

      setStats({
        productores: productores.count || 0,
        espacios: espacios.count || 0,
        eventos: eventos.count || 0,
        solicitudes: solicitudes.count || 0,
        candidaturasPendientes: candidaturas.count || 0,
      });

      if (recientes.data) {
        setCandidaturasRecientes(
          recientes.data.map((c) => ({
            ...c,
            usuario: Array.isArray(c.usuario) ? c.usuario[0] || null : c.usuario,
          })) as CandidaturaReciente[]
        );
      }

      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: "Productores", value: stats.productores, icon: Users, color: "text-accent" },
    { label: "Espacios", value: stats.espacios, icon: Building2, color: "text-success" },
    { label: "Eventos", value: stats.eventos, icon: CalendarDays, color: "text-warning" },
    { label: "Solicitudes", value: stats.solicitudes, icon: Inbox, color: "text-accent" },
  ];

  const rolLabels: Record<string, string> = {
    venue: "Espacio",
    artista: "Artista",
    proveedor: "Proveedor",
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-24 animate-pulse bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Panel de administración</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-hover ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-text-secondary">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Candidaturas pendientes</h2>
          {stats.candidaturasPendientes > 0 && (
            <Badge variant="warning">{stats.candidaturasPendientes} pendientes</Badge>
          )}
        </div>

        {candidaturasRecientes.length === 0 ? (
          <p className="text-text-secondary text-sm">No hay candidaturas pendientes de revisión</p>
        ) : (
          <div className="space-y-3">
            {candidaturasRecientes.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-warning" />
                  <div>
                    <p className="text-sm font-medium">{c.usuario?.nombre || "Sin nombre"}</p>
                    <p className="text-xs text-text-muted">{c.usuario?.email}</p>
                  </div>
                </div>
                <Badge>{rolLabels[c.rol] || c.rol}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
