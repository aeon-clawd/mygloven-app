"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SpaceForm } from "@/components/admin/space-form/space-form";
import { createClient } from "@/lib/supabase/client";
import type { Venue } from "@/types/database";

export default function EditarEspacioPage() {
  const params = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("venues")
        .select("*")
        .eq("id", params.id)
        .single();
      setVenue(data as Venue | null);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-text-muted">Cargando espacio...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-text-muted">Espacio no encontrado</p>
      </div>
    );
  }

  return <SpaceForm venue={venue} />;
}
