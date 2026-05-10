import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { embedText } from "./embed";

const BRIEF_FIELDS = [
  "tipo",
  "ciudad",
  "fecha",
  "personas",
  "presupuesto",
  "atmosfera",
  "espacio",
  "catering",
  "musica",
] as const;

export type BriefField = (typeof BRIEF_FIELDS)[number];

/**
 * Tools the LLM can call. Each one is bound to the current Supabase client
 * and (where relevant) the active evento id. Returns a record so we can
 * pass it straight to streamText({ tools }).
 */
export function buildTools(supabase: SupabaseClient, eventoId: string) {
  return {
    update_brief: tool({
      description:
        "Update one field of the event brief. Call this whenever you (or the user) decide a value for tipo, ciudad, fecha, personas, presupuesto, atmósfera, espacio, catering or música. The right panel updates live.",
      inputSchema: z.object({
        field: z.enum(BRIEF_FIELDS),
        value: z
          .union([z.string(), z.number(), z.null()])
          .describe(
            "The new value. Pass null to clear the field. Strings for text, numbers for personas/presupuesto."
          ),
      }),
      execute: async ({ field, value }) => {
        const { data: current, error: readError } = await supabase
          .from("eventos")
          .select("brief")
          .eq("id", eventoId)
          .single();
        if (readError) return { ok: false, error: readError.message };

        const next = { ...(current?.brief ?? {}), [field]: value };

        const { error } = await supabase
          .from("eventos")
          .update({ brief: next })
          .eq("id", eventoId);
        if (error) return { ok: false, error: error.message };

        return { ok: true, field, value };
      },
    }),

    search_venues: tool({
      description:
        "Search venues from the marketplace by semantic similarity to a free-text query, with optional filters. Use this to recommend spaces to the producer.",
      inputSchema: z.object({
        query: z
          .string()
          .describe(
            "Natural language description of what you're looking for, e.g. 'rooftop íntimo con vibe industrial'."
          ),
        ciudad: z.string().nullable().optional(),
        tipo: z.string().nullable().optional(),
        exterior_only: z.boolean().nullable().optional(),
        limit: z.number().min(1).max(10).default(5),
      }),
      execute: async ({ query, ciudad, tipo, exterior_only, limit }) => {
        try {
          const embedding = await embedText(query);
          const { data, error } = await supabase.rpc("match_venues", {
            query_embedding: embedding,
            match_count: limit,
            ciudad_filter: ciudad ?? null,
            tipo_filter: tipo ?? null,
            exterior_only: exterior_only ?? null,
          });
          if (error) return { ok: false, error: error.message, results: [] };
          return { ok: true, results: data ?? [] };
        } catch (e) {
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
        "Search artists from the roster by semantic similarity, with optional genre filter.",
      inputSchema: z.object({
        query: z
          .string()
          .describe(
            "Natural language description, e.g. 'DJ techno melódico para 200 personas'."
          ),
        genero: z.string().nullable().optional(),
        limit: z.number().min(1).max(10).default(5),
      }),
      execute: async ({ query, genero, limit }) => {
        try {
          const embedding = await embedText(query);
          const { data, error } = await supabase.rpc("match_artistas", {
            query_embedding: embedding,
            match_count: limit,
            genero_filter: genero ?? null,
          });
          if (error) return { ok: false, error: error.message, results: [] };
          return { ok: true, results: data ?? [] };
        } catch (e) {
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

export function buildSystemPrompt(brief: Record<string, unknown>): string {
  const known = Object.entries(brief)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `  - ${k}: ${JSON.stringify(v)}`)
    .join("\n");
  const missing = BRIEF_FIELDS.filter((f) => !brief[f]).join(", ");

  return `Eres MYG, asistente de producción de eventos para la plataforma MYGLOVEN.
Hablas en español, en tono cálido y directo, sin jerga corporativa.

Estado actual del brief del evento:
${known || "  (vacío — todavía no sabemos nada)"}

Campos pendientes de rellenar: ${missing || "ninguno, el brief está completo"}

Tu trabajo:
1. Conversar con el productor para entender el evento que quiere montar.
2. Cada vez que detectes un dato concreto (tipo, ciudad, fecha, aforo, presupuesto, atmósfera, espacio, catering, música) llama a update_brief inmediatamente. No pidas confirmación: el usuario puede sobreescribir luego.
3. Cuando tengas suficiente contexto (al menos tipo + ciudad + aforo aproximado), llama a search_venues para sugerir 3-5 espacios que encajen.
4. Si menciona música en vivo o DJs, llama a search_artists para sugerir artistas.
5. No inventes venues ni artistas. Solo recomienda los que devuelve la búsqueda. Si no hay resultados, dilo y propon ajustar criterios.
6. Pregunta UNA cosa por turno. No asaltes con cuestionarios largos.
7. Confirma con frases cortas ("anotado", "perfecto") cuando rellenes campos.

Formato de fecha: ISO 'YYYY-MM-DD' o texto libre si el usuario es vago ("primer fin de semana de septiembre").`;
}
