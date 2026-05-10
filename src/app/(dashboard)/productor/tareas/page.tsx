import { PageHead } from "@/components/ui/page-head";
import { Pill } from "@/components/ui/badge";

export default function TareasPage() {
  return (
    <>
      <PageHead
        eyebrow="Producción"
        title="Tareas"
        sub="Checklist dinámico cruzado entre tus eventos. Lo urgente, lo bloqueado, lo que sigue."
        actions={<Pill variant="accent">en construcción</Pill>}
      />

      <div className="empty">
        <div className="num">—</div>
        <div className="msg">Aún no disponible</div>
        <span className="text-mute">
          Pronto podrás ver y gestionar todas las tareas de tus producciones desde aquí.
        </span>
      </div>
    </>
  );
}
