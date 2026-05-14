import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const IMAGE_SIZE = process.env.OPENAI_IMAGE_SIZE || "1024x1024";
const IMAGE_QUALITY = process.env.OPENAI_IMAGE_QUALITY || "low";

interface RenderBody {
  base_image_url: string;
  prompt: string;
  evento_id?: string | null;
  venue_id?: string | null;
  venue_annex_id?: string | null;
}

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Falta OPENAI_API_KEY en el servidor." },
      { status: 500 }
    );
  }

  const body = (await req.json()) as RenderBody;
  if (!body.base_image_url || !body.prompt?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Faltan base_image_url o prompt." },
      { status: 400 }
    );
  }

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
  if (!profile || (profile.rol !== "productor" && profile.rol !== "admin")) {
    return new Response("Forbidden", { status: 403 });
  }

  // 1) Insert pendiente row.
  const { data: created, error: insErr } = await supabase
    .from("space_studio_renders")
    .insert({
      productor_id: user.id,
      evento_id: body.evento_id ?? null,
      venue_id: body.venue_id ?? null,
      venue_annex_id: body.venue_annex_id ?? null,
      base_image_url: body.base_image_url,
      prompt: body.prompt.trim(),
      status: "generando",
      model: IMAGE_MODEL,
    })
    .select("id")
    .single();
  if (insErr || !created) {
    return NextResponse.json(
      { ok: false, error: insErr?.message ?? "No se pudo crear el render." },
      { status: 500 }
    );
  }
  const renderId = created.id as string;

  try {
    // 2) Download the base image and infer mime.
    const baseRes = await fetch(body.base_image_url);
    if (!baseRes.ok) throw new Error(`No se pudo leer la imagen base (${baseRes.status}).`);
    const baseBuf = Buffer.from(await baseRes.arrayBuffer());
    const baseMime = baseRes.headers.get("content-type") ?? "image/jpeg";
    const baseExt = baseMime.includes("png") ? "png" : "jpg";

    // 3) Call OpenAI images/edits.
    const form = new FormData();
    form.append("model", IMAGE_MODEL);
    form.append("prompt", body.prompt.trim());
    form.append("n", "1");
    form.append("size", IMAGE_SIZE);
    form.append("quality", IMAGE_QUALITY);
    form.append(
      "image",
      new Blob([new Uint8Array(baseBuf)], { type: baseMime }),
      `base.${baseExt}`
    );

    const openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });
    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      throw new Error(`OpenAI ${openaiRes.status}: ${errBody.slice(0, 500)}`);
    }
    const openaiJson = (await openaiRes.json()) as {
      data?: { b64_json?: string; url?: string }[];
    };
    const first = openaiJson.data?.[0];
    if (!first?.b64_json && !first?.url) {
      throw new Error("OpenAI no devolvió imagen.");
    }

    let outputBuf: Buffer;
    if (first.b64_json) {
      outputBuf = Buffer.from(first.b64_json, "base64");
    } else {
      const dl = await fetch(first.url!);
      if (!dl.ok) throw new Error(`No se pudo descargar la imagen generada (${dl.status}).`);
      outputBuf = Buffer.from(await dl.arrayBuffer());
    }

    // 4) Upload to Storage.
    const path = `${user.id}/${renderId}.png`;
    const { error: upErr } = await supabase.storage
      .from("space-studio-renders")
      .upload(path, outputBuf, {
        contentType: "image/png",
        upsert: true,
      });
    if (upErr) throw new Error(`Storage: ${upErr.message}`);

    const { data: publicUrl } = supabase.storage
      .from("space-studio-renders")
      .getPublicUrl(path);

    // 5) Mark listo.
    await supabase
      .from("space_studio_renders")
      .update({ status: "listo", output_image_url: publicUrl.publicUrl })
      .eq("id", renderId);

    return NextResponse.json({
      ok: true,
      id: renderId,
      output_image_url: publicUrl.publicUrl,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[space-studio/render]", message);
    await supabase
      .from("space_studio_renders")
      .update({ status: "error", error_message: message })
      .eq("id", renderId);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
