import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { venue_id } = (await req.json()) as { venue_id: string | null };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: ev } = await supabase
    .from("eventos")
    .select("cliente_id")
    .eq("id", id)
    .single();
  if (!ev || ev.cliente_id !== user.id) return new Response("Forbidden", { status: 403 });

  const { error } = await supabase
    .from("eventos")
    .update({ venue_id })
    .eq("id", id);
  if (error) return new Response(error.message, { status: 500 });
  return NextResponse.json({ ok: true, venue_id });
}
