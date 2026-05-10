import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedText } from "@/lib/ai/embed";

export const runtime = "nodejs";
export const maxDuration = 60;

interface VenueRow {
  id: string;
  nombre: string;
  descripcion: string | null;
  descripcion_corta: string | null;
  ciudad: string | null;
  barrio: string | null;
  tipo: string | null;
  subtipo: string | null;
  tags: string[] | null;
  equipo_sonido: string | null;
}

interface ArtistRow {
  id: string;
  nombre: string;
  bio: string | null;
  descripcion_corta: string | null;
  genero_musical: string | null;
  tags: string[] | null;
}

function venueDocument(v: VenueRow): string {
  return [
    v.nombre,
    v.tipo,
    v.subtipo,
    v.ciudad,
    v.barrio,
    v.descripcion_corta,
    v.descripcion,
    v.equipo_sonido,
    (v.tags ?? []).join(", "),
  ]
    .filter(Boolean)
    .join(". ");
}

function artistDocument(a: ArtistRow): string {
  return [
    a.nombre,
    a.genero_musical,
    a.descripcion_corta,
    a.bio,
    (a.tags ?? []).join(", "),
  ]
    .filter(Boolean)
    .join(". ");
}

/**
 * Backfills embeddings for any venue/artist row whose embedding is null.
 * Pass ?force=1 to re-embed everything.
 *
 * Admin-only: any logged-in admin can trigger it from the browser.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  if (profile?.rol !== "admin") return new Response("Forbidden", { status: 403 });

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response("Falta GOOGLE_GENERATIVE_AI_API_KEY", { status: 500 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";

  const venuesQuery = supabase
    .from("venues")
    .select(
      "id, nombre, descripcion, descripcion_corta, ciudad, barrio, tipo, subtipo, tags, equipo_sonido"
    );
  if (!force) venuesQuery.is("embedding", null);

  const artistsQuery = supabase
    .from("artistas")
    .select("id, nombre, bio, descripcion_corta, genero_musical, tags");
  if (!force) artistsQuery.is("embedding", null);

  const [venuesRes, artistsRes] = await Promise.all([venuesQuery, artistsQuery]);
  if (venuesRes.error) return new Response(venuesRes.error.message, { status: 500 });
  if (artistsRes.error) return new Response(artistsRes.error.message, { status: 500 });

  const venues = (venuesRes.data ?? []) as VenueRow[];
  const artists = (artistsRes.data ?? []) as ArtistRow[];

  const errors: { id: string; kind: string; error: string }[] = [];
  let venuesDone = 0;
  let artistsDone = 0;

  // Run sequentially to be gentle with the embedding rate limit.
  for (const v of venues) {
    try {
      const doc = venueDocument(v);
      if (!doc) continue;
      const embedding = await embedText(doc);
      const { error } = await supabase
        .from("venues")
        .update({ embedding: embedding as unknown as string })
        .eq("id", v.id);
      if (error) throw new Error(error.message);
      venuesDone++;
    } catch (e) {
      errors.push({
        id: v.id,
        kind: "venue",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  for (const a of artists) {
    try {
      const doc = artistDocument(a);
      if (!doc) continue;
      const embedding = await embedText(doc);
      const { error } = await supabase
        .from("artistas")
        .update({ embedding: embedding as unknown as string })
        .eq("id", a.id);
      if (error) throw new Error(error.message);
      artistsDone++;
    } catch (e) {
      errors.push({
        id: a.id,
        kind: "artist",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({
    venuesDone,
    artistsDone,
    venuesSeen: venues.length,
    artistsSeen: artists.length,
    errors,
  });
}
