#!/usr/bin/env node
/**
 * Backfill Google embeddings (gemini-embedding-001 @ 768d) for venues and
 * artistas that don't have one yet. Uses the Supabase service role to
 * bypass RLS, so it must only run server-side / locally.
 *
 * Run with:
 *   node --env-file=.env.local scripts/backfill-embeddings.mjs
 *   node --env-file=.env.local scripts/backfill-embeddings.mjs --force
 */

import { createClient } from "@supabase/supabase-js";

const FORCE = process.argv.includes("--force");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !GOOGLE_KEY) {
  console.error("Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_GENERATIVE_AI_API_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const EMBED_MODEL = "gemini-embedding-001";
const DIM = 768;

async function embed(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${GOOGLE_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      outputDimensionality: DIM,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini embed ${res.status}: ${body}`);
  }
  const json = await res.json();
  const values = json?.embedding?.values;
  if (!Array.isArray(values) || values.length !== DIM) {
    throw new Error(`Unexpected embedding shape (got length ${values?.length})`);
  }
  return values;
}

function venueDoc(v) {
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

function annexDoc(a) {
  const v = a.venues ?? {};
  const capacity = Math.max(a.config_de_pie ?? 0, a.config_sentado ?? 0) || null;
  return [
    a.nombre,
    a.tipo_espacio,
    (a.tipos_evento ?? []).join(", "),
    capacity ? `${capacity} personas` : null,
    a.metros_cuadrados ? `${a.metros_cuadrados} m²` : null,
    v.nombre,
    v.ciudad,
    v.barrio,
    v.descripcion_corta,
    v.descripcion,
    (v.tags ?? []).join(", "),
  ]
    .filter(Boolean)
    .join(". ");
}

function artistDoc(a) {
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

async function backfill(table, columns, docFn) {
  let query = supabase.from(table).select(columns);
  if (!FORCE) query = query.is("embedding", null);
  const { data, error } = await query;
  if (error) throw new Error(`${table} read: ${error.message}`);

  console.log(`\n${table}: ${data.length} row(s) to embed${FORCE ? " (forced)" : ""}`);
  let done = 0;
  const errors = [];

  for (const row of data) {
    const doc = docFn(row).trim();
    if (!doc) {
      console.log(`  · ${row.id}  (skip — empty document)`);
      continue;
    }
    try {
      const vector = await embed(doc);
      const { error: upErr } = await supabase
        .from(table)
        .update({ embedding: vector })
        .eq("id", row.id);
      if (upErr) throw new Error(upErr.message);
      done++;
      console.log(`  ✓ ${row.id}  ${row.nombre ?? ""}`);
    } catch (e) {
      errors.push({ id: row.id, error: e.message });
      console.log(`  ✕ ${row.id}  ${e.message}`);
    }
  }

  return { done, errors, seen: data.length };
}

const venuesRes = await backfill(
  "venues",
  "id, nombre, descripcion, descripcion_corta, ciudad, barrio, tipo, subtipo, tags, equipo_sonido",
  venueDoc
);

const artistsRes = await backfill(
  "artistas",
  "id, nombre, bio, descripcion_corta, genero_musical, tags",
  artistDoc
);

const annexesRes = await backfill(
  "venue_annexes",
  "id, nombre, tipo_espacio, tipos_evento, config_de_pie, config_sentado, metros_cuadrados, venues!venue_annexes_venue_id_fkey(nombre, descripcion, descripcion_corta, ciudad, barrio, tags)",
  annexDoc
);

console.log("\n──────────────────────────────");
console.log(`venues       : ${venuesRes.done}/${venuesRes.seen} embedded, ${venuesRes.errors.length} error(s)`);
console.log(`artistas     : ${artistsRes.done}/${artistsRes.seen} embedded, ${artistsRes.errors.length} error(s)`);
console.log(`venue_annexes: ${annexesRes.done}/${annexesRes.seen} embedded, ${annexesRes.errors.length} error(s)`);
