import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Entry point for the canvas. Always lands on a fresh draft event so the
 * chat has somewhere to write the brief into. Existing drafts are surfaced
 * from /productor/eventos.
 */
export default async function CanvasEntryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("eventos")
    .insert({ cliente_id: user.id, estado: "borrador" })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el evento borrador");
  }

  redirect(`/productor/canvas/${data.id}`);
}
