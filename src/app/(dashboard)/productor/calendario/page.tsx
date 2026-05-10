import { PageHead } from "@/components/ui/page-head";
import { Pill } from "@/components/ui/badge";

export default function CalendarioPage() {
  return (
    <>
      <PageHead
        eyebrow="Planificación"
        title="Calendario"
        sub="Tus eventos, montajes y deadlines en una sola vista temporal."
        actions={<Pill variant="accent">en construcción</Pill>}
      />

      <div className="empty">
        <div className="num">—</div>
        <div className="msg">Aún no disponible</div>
        <span className="text-mute">
          Estamos montando la vista de calendario con sincronización automática desde tus eventos.
        </span>
      </div>
    </>
  );
}
