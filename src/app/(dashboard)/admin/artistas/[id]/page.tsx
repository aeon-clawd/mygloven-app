"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArtistForm } from "@/components/admin/artist-form/artist-form";
import { createClient } from "@/lib/supabase/client";
import type { Artista } from "@/types/database";

export default function EditarArtistaPage() {
  const params = useParams();
  const [artist, setArtist] = useState<Artista | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("artistas")
        .select("*")
        .eq("id", params.id)
        .single();
      setArtist(data as Artista | null);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-text-muted">Cargando artista...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-text-muted">Artista no encontrado</p>
      </div>
    );
  }

  return <ArtistForm artist={artist} />;
}
