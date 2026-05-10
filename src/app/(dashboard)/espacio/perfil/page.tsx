import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/badge";
import { PageHead } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";

export default function EspacioPerfilPage() {
  return (
    <>
      <PageHead
        eyebrow="Cómo te ven los productores"
        title="Tu perfil"
        sub="Edita la información pública de tu espacio. Cuanto más editado el copy, más en serio te tomarán."
        actions={
          <Button variant="primary" data-cursor="guardar →">
            Guardar cambios
          </Button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
        <div className="flex-col">
          <div className="card">
            <div className="page-eyebrow" style={{ marginBottom: 16 }}>
              — Identidad
            </div>
            <p className="text-mute" style={{ fontSize: 13, lineHeight: 1.5 }}>
              Conecta tu espacio en Supabase desde el panel admin para editar nombre, descripción,
              capacidad y precio. Aquí mostraremos el formulario en línea próximamente.
            </p>
          </div>
        </div>

        <div className="flex-col">
          <div className="card raised">
            <div className="page-eyebrow" style={{ marginBottom: 12 }}>
              — Estado público
            </div>
            <div className="flex-row between">
              <Pill variant="warning" dot>
                pendiente
              </Pill>
              <span className="text-mute">visible cuando esté completo</span>
            </div>
            <hr className="hr" />
            <div className="flex-col" style={{ gap: 10 }}>
              <div className="flex-row between">
                <span className="text-mute">PERFIL COMPLETO</span>
                <span style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  —
                </span>
              </div>
              <div className="flex-row between">
                <span className="text-mute">FOTOS</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>0</span>
              </div>
              <div className="flex-row between">
                <span className="text-mute">RESERVAS</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>0</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="page-eyebrow" style={{ marginBottom: 12 }}>
              — Galería
            </div>
            <div className="empty" style={{ padding: 32 }}>
              <div className="msg" style={{ fontSize: 16 }}>
                Aún sin fotos
              </div>
            </div>
            <Button variant="ghost" full style={{ marginTop: 12 }} data-cursor="añadir foto">
              <Icon.plus /> Añadir foto
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
