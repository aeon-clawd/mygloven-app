"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SpaceForm } from "@/components/admin/space-form/space-form";
import { createClient } from "@/lib/supabase/client";
import type { Venue, VenueAnnex } from "@/types/database";

export default function EditarEspacioPage() {
  const params = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [annexes, setAnnexes] = useState<VenueAnnex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [venueRes, annexesRes] = await Promise.all([
        supabase.from("venues").select("*").eq("id", params.id).single(),
        supabase
          .from("venue_annexes")
          .select("*")
          .eq("venue_id", params.id)
          .order("orden", { ascending: true }),
      ]);
      setVenue(venueRes.data as Venue | null);
      setAnnexes((annexesRes.data as VenueAnnex[]) || []);
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

  return <SpaceForm venue={venue} annexes={annexes} />;
}
