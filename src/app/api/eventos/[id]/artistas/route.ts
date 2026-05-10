import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function getOwned(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 401 as const };
  const { data: ev } = await supabase
    .from("eventos")
    .select("cliente_id, artistas_ids")
    .eq("id", id)
    .single();
  if (!ev || ev.cliente_id !== user.id) return { error: 403 as const };
  return { supabase, current: (ev.artistas_ids as string[] | null) ?? [] };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { artist_id } = (await req.json()) as { artist_id: string };
  const ctx = await getOwned(id);
  if ("error" in ctx) return new Response("Forbidden", { status: ctx.error });

  if (ctx.current.includes(artist_id)) {
    return NextResponse.json({ ok: true, artistas_ids: ctx.current });
  }
  const next = [...ctx.current, artist_id];
  const { error } = await ctx.supabase
    .from("eventos")
    .update({ artistas_ids: next })
    .eq("id", id);
  if (error) return new Response(error.message, { status: 500 });
  return NextResponse.json({ ok: true, artistas_ids: next });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { artist_id } = (await req.json()) as { artist_id: string };
  const ctx = await getOwned(id);
  if ("error" in ctx) return new Response("Forbidden", { status: ctx.error });

  const next = ctx.current.filter((a) => a !== artist_id);
  const { error } = await ctx.supabase
    .from("eventos")
    .update({ artistas_ids: next })
    .eq("id", id);
  if (error) return new Response(error.message, { status: 500 });
  return NextResponse.json({ ok: true, artistas_ids: next });
}
