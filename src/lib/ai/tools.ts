import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { embedText } from "./embed";
import {
  TIPOS_EVENTO,
  TIPOS_EVENTO_VALUES,
  CATERING_OPTIONS,
  CATERING_VALUES,
  labelOf,
} from "@/lib/event-options";

/**
 * Tools the LLM can call. Bound to a Supabase client + the active evento id.
 * Returns a record so it goes straight into streamText({ tools }).
 */
export function buildTools(supabase: SupabaseClient, eventoId: string) {
  return {
    set_tipo: tool({
      description: `Set the event type. Choose the closest match from the closed list.`,
      inputSchema: z.object({ value: z.enum(TIPOS_EVENTO_VALUES) }),
      execute: async ({ value }) => {
        const { error } = await supabase
          .from("eventos")
          .update({ tipo: value })
          .eq("id", eventoId);
        return error ? { ok: false, error: error.message } : { ok: true, value };
      },
    }),

    set_ciudad: tool({
      description:
        "Set the event city. Use one of the cities returned by list_cities or where venues exist.",
      inputSchema: z.object({ value: z.string().min(2) }),
      execute: async ({ value }) => {
        const { error } = await supabase
          .from("eventos")
          .update({ ciudad: value })
          .eq("id", eventoId);
        return error ? { ok: false, error: error.message } : { ok: true, value };
      },
    }),

    set_fecha: tool({
      description:
        "Set the event date. Must be today or in the future. Format: YYYY-MM-DD.",
      inputSchema: z.object({
        value: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
      }),
      execute: async ({ value }) => {
        const today = new Date().toISOString().slice(0, 10);
        if (value < today) {
          return { ok: false, error: "La fecha no puede ser pasada" };
        }
        const { error } = await supabase
          .from("eventos")
          .update({ fecha_deseada: value })
          .eq("id", eventoId);
        return error ? { ok: false, error: error.message } : { ok: true, value };
      },
    }),

    set_personas: tool({
      description: "Set the approximate number of attendees.",
      inputSchema: z.object({ value: z.number().int().positive() }),
      execute: async ({ value }) => {
        const { error } = await supabase
          .from("eventos")
          .update({ num_personas: value })
          .eq("id", eventoId);
        return error ? { ok: false, error: error.message } : { ok: true, value };
      },
    }),

    set_presupuesto: tool({
      description:
        "Set the budget range in euros. Min must be <= max. Either side may be null if the user doesn't have a bound.",
      inputSchema: z.object({
        min: z.number().nonnegative().nullable(),
        max: z.number().nonnegative().nullable(),
      }),
      execute: async ({ min, max }) => {
        if (min !== null && max !== null && min > max) {
          return { ok: false, error: "min no puede ser mayor que max" };
        }
        const { error } = await supabase
          .from("eventos")
          .update({ presupuesto_min: min, presupuesto_max: max })
          .eq("id", eventoId);
        return error
          ? { ok: false, error: error.message }
          : { ok: true, min, max };
      },
    }),

    set_catering: tool({
      description: "Set whether the event needs catering.",
      inputSchema: z.object({ value: z.enum(CATERING_VALUES) }),
      execute: async ({ value }) => {
        const { data: cur } = await supabase
          .from("eventos")
          .select("brief")
          .eq("id", eventoId)
          .single();
        const next = { ...((cur?.brief as Record<string, unknown>) ?? {}), catering: value };
        const { error } = await supabase
          .from("eventos")
          .update({ brief: next })
          .eq("id", eventoId);
        return error ? { ok: false, error: error.message } : { ok: true, value };
      },
    }),

    select_venue: tool({
      description:
        "Pick a venue for the event. The user can change it later. Pass the venue uuid returned by search_venues.",
      inputSchema: z.object({ venue_id: z.string().uuid() }),
      execute: async ({ venue_id }) => {
        const { error } = await supabase
          .from("eventos")
          .update({ venue_id })
          .eq("id", eventoId);
        return error ? { ok: false, error: error.message } : { ok: true, venue_id };
      },
    }),

    add_artist: tool({
      description:
        "Add an artist to the event lineup. Multiple artists can be added. Idempotent.",
      inputSchema: z.object({ artist_id: z.string().uuid() }),
      execute: async ({ artist_id }) => {
        const { data: cur } = await supabase
          .from("eventos")
          .select("artistas_ids")
          .eq("id", eventoId)
          .single();
        const ids = (cur?.artistas_ids as string[] | null) ?? [];
        if (ids.includes(artist_id)) return { ok: true, artist_id, alreadyIn: true };
        const { error } = await supabase
          .from("eventos")
          .update({ artistas_ids: [...ids, artist_id] })
          .eq("id", eventoId);
        return error ? { ok: false, error: error.message } : { ok: true, artist_id };
      },
    }),

    remove_artist: tool({
      description: "Remove an artist from the event lineup.",
      inputSchema: z.object({ artist_id: z.string().uuid() }),
      execute: async ({ artist_id }) => {
        const { data: cur } = await supabase
          .from("eventos")
          .select("artistas_ids")
          .eq("id", eventoId)
          .single();
        const ids = ((cur?.artistas_ids as string[] | null) ?? []).filter(
          (i) => i !== artist_id
        );
        const { error } = await supabase
          .from("eventos")
          .update({ artistas_ids: ids })
          .eq("id", eventoId);
        return error ? { ok: false, error: error.message } : { ok: true, artist_id };
      },
    }),

    search_venues: tool({
      description:
        "Semantic search of the venue catalog. Use this to recommend spaces. The producer will see the results as cards in the chat — they can pick one with a button. Always pass ciudad and tipo if the event already has them set.",
      inputSchema: z.object({
        query: z
          .string()
          .describe("Short natural-language description of what you're looking for."),
        ciudad: z.string().nullable().optional(),
        tipo: z.string().nullable().optional(),
        limit: z.number().min(1).max(8).default(6),
      }),
      execute: async ({ query, ciudad, tipo, limit }) => {
        // Fallback a los valores del evento si el LLM no los pasa.
        const { data: ev } = await supabase
          .from("eventos")
          .select("ciudad, tipo")
          .eq("id", eventoId)
          .single();
        const ciudadFilter = (ciudad ?? ev?.ciudad ?? null) || null;
        const tipoFilter = (tipo ?? ev?.tipo ?? null) || null;
        const matchCount = Math.max(limit ?? 6, 6);

        console.log("[search_venues] called", {
          query,
          llm_ciudad: ciudad,
          llm_tipo: tipo,
          state_ciudad: ev?.ciudad ?? null,
          state_tipo: ev?.tipo ?? null,
          applied_ciudad: ciudadFilter,
          applied_tipo: tipoFilter,
          limit: matchCount,
        });

        try {
          const embedding = await embedText(query);
          const { data, error } = await supabase.rpc("match_venues", {
            query_embedding: embedding,
            match_count: matchCount,
            ciudad_filter: ciudadFilter,
            tipo_filter: tipoFilter,
            exterior_only: null,
          });
          if (error) {
            console.error("[search_venues] rpc error", { error, query, ciudadFilter, tipoFilter });
            return { ok: false, error: error.message, results: [] };
          }
          console.log("[search_venues] rpc ok", { count: data?.length ?? 0 });

          // Hydrate with cover image so the card renderer doesn't need a 2nd fetch.
          const ids = (data ?? []).map((r: { id: string }) => r.id);
          const { data: covers } = ids.length
            ? await supabase.from("venues").select("id, images").in("id", ids)
            : { data: [] as { id: string; images: unknown }[] };
          const coverById = new Map<string, string | null>();
          for (const v of covers ?? []) {
            const imgs = (v.images as { url: string; tag?: string }[] | null) ?? [];
            const principal = imgs.find((i) => i.tag === "principal") ?? imgs[0];
            coverById.set(v.id as string, principal?.url ?? null);
          }
          const results = (data ?? []).map((r: Record<string, unknown>) => ({
            ...r,
            cover: coverById.get(r.id as string) ?? null,
          }));
          return { ok: true, results };
        } catch (e) {
          console.error("[search_venues] threw", { e, query, ciudad, tipo });
          return {
            ok: false,
            error: e instanceof Error ? e.message : String(e),
            results: [],
          };
        }
      },
    }),

    search_artists: tool({
      description:
        "Semantic search of the artist roster. Producer sees results as cards and can add them to the lineup with a button.",
      inputSchema: z.object({
        query: z.string(),
        genero: z.string().nullable().optional(),
        limit: z.number().min(1).max(8).default(6),
      }),
      execute: async ({ query, genero, limit }) => {
        console.log("[search_artists] called", { query, genero, limit });
        try {
          const embedding = await embedText(query);
          const { data, error } = await supabase.rpc("match_artistas", {
            query_embedding: embedding,
            match_count: limit,
            genero_filter: genero ?? null,
          });
          if (error) {
            console.error("[search_artists] rpc error", { error, query, genero });
            return { ok: false, error: error.message, results: [] };
          }
          console.log("[search_artists] rpc ok", { count: data?.length ?? 0 });

          const ids = (data ?? []).map((r: { id: string }) => r.id);
          const { data: covers } = ids.length
            ? await supabase
                .from("artistas")
                .select("id, avatar_url, images")
                .in("id", ids)
            : { data: [] as { id: string; avatar_url: string | null; images: unknown }[] };
          const coverById = new Map<string, string | null>();
          for (const a of covers ?? []) {
            if (a.avatar_url) {
              coverById.set(a.id as string, a.avatar_url);
              continue;
            }
            const imgs = (a.images as { url: string }[] | null) ?? [];
            coverById.set(a.id as string, imgs[0]?.url ?? null);
          }
          const results = (data ?? []).map((r: Record<string, unknown>) => ({
            ...r,
            cover: coverById.get(r.id as string) ?? null,
          }));
          return { ok: true, results };
        } catch (e) {
          console.error("[search_artists] threw", { e, query, genero });
          return {
            ok: false,
            error: e instanceof Error ? e.message : String(e),
            results: [],
          };
        }
      },
    }),
  };
}

interface EventState {
  tipo: string | null;
  ciudad: string | null;
  fecha_deseada: string | null;
  num_personas: number | null;
  presupuesto_min: number | null;
  presupuesto_max: number | null;
  venue_id: string | null;
  artistas_ids: string[];
  brief: { catering?: string };
}

export function buildSystemPrompt(state: EventState, ciudades: string[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const tipoLbl = labelOf(TIPOS_EVENTO, state.tipo);
  const cateringLbl = labelOf(CATERING_OPTIONS, state.brief?.catering ?? null);

  const lines: string[] = [];
  if (state.tipo) lines.push(`  - tipo: ${tipoLbl}`);
  if (state.ciudad) lines.push(`  - ciudad: ${state.ciudad}`);
  if (state.fecha_deseada) lines.push(`  - fecha: ${state.fecha_deseada}`);
  if (state.num_personas) lines.push(`  - personas (aprox.): ${state.num_personas}`);
  if (state.presupuesto_min !== null || state.presupuesto_max !== null) {
    lines.push(
      `  - presupuesto: ${state.presupuesto_min ?? "?"}€ – ${state.presupuesto_max ?? "?"}€`
    );
  }
  if (state.venue_id) lines.push(`  - venue elegido: sí (${state.venue_id})`);
  if (state.artistas_ids.length > 0)
    lines.push(`  - artistas elegidos: ${state.artistas_ids.length}`);
  if (state.brief?.catering) lines.push(`  - catering: ${cateringLbl}`);

  const missing: string[] = [];
  if (!state.tipo) missing.push("tipo");
  if (!state.ciudad) missing.push("ciudad");
  if (!state.fecha_deseada) missing.push("fecha");
  if (!state.num_personas) missing.push("personas");
  if (state.presupuesto_min === null && state.presupuesto_max === null)
    missing.push("presupuesto");
  if (!state.venue_id) missing.push("venue");
  if (state.artistas_ids.length === 0) missing.push("artistas (opcional)");
  if (!state.brief?.catering) missing.push("catering");

  return `Eres MYG, asistente de producción de eventos para la plataforma MYGLOVEN.
Hablas español de España, tono cálido y directo, frases cortas. Hoy es ${today}.

Estado del evento:
${lines.join("\n") || "  (vacío — todavía no sabemos nada)"}

Pendiente: ${missing.join(", ") || "todo cubierto"}

Ciudades con espacios disponibles: ${ciudades.join(", ") || "(todavía ninguna)"}.
Tipos de evento posibles (valor → etiqueta): ${TIPOS_EVENTO.map((t) => `${t.value}=${t.label}`).join(", ")}.
Catering posible: ${CATERING_OPTIONS.map((c) => `${c.value}=${c.label}`).join(", ")}.

Cómo trabajas:
1. Conversa para entender el evento. Pregunta UNA cosa por turno, no asaltes con cuestionarios.
2. Cuando detectes un dato, llama inmediatamente a la tool correspondiente:
   - tipo → set_tipo (usa el valor del enum, no la etiqueta)
   - ciudad → set_ciudad (solo de la lista de ciudades disponibles)
   - fecha → set_fecha (YYYY-MM-DD, hoy o futuro)
   - personas → set_personas (número entero aproximado)
   - presupuesto → set_presupuesto (rango min/max en €, alguno puede ser null)
   - catering → set_catering (si/no/por_ver)
3. Cuando tengas tipo + ciudad + personas, llama a search_venues y muestra resultados.
   - SIEMPRE pasa el parámetro 'ciudad' si el evento ya tiene ciudad asignada (mira el estado de arriba).
   - SIEMPRE pasa el parámetro 'tipo' si el evento ya tiene tipo asignado.
   - Solo omítelos si el usuario pide explícitamente buscar en otra ciudad o tipo distinto.
4. Si menciona música en vivo, DJ, banda → llama a search_artists.
5. Si el usuario expresa interés por un venue o artista concreto de los sugeridos, llama a select_venue / add_artist.
6. NO inventes venues o artistas — solo usa los que devuelve la búsqueda.
7. Tras llamar a una tool exitosa, responde con una frase corta de confirmación ("anotado", "perfecto").
8. Si el usuario quiere quitar un artista, llama a remove_artist.

Importante: no listes los venues/artistas como texto plano cuando uses search_*. Los resultados aparecen automáticamente como cards en el chat. Tu texto solo da contexto ("aquí van algunas opciones que encajan").`;
}
