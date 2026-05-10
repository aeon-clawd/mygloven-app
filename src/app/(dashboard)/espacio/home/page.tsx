import { Stat } from "@/components/ui/stat";
import { PageHead } from "@/components/ui/page-head";

export default function EspacioHomePage() {
  return (
    <>
      <PageHead
        eyebrow="Tu espacio"
        title="Buenos días"
        sub="Resumen de actividad. Solicitudes nuevas, reservas confirmadas, ocupación del mes."
      />

      <div className="card-grid cols-4" style={{ marginBottom: 32 }}>
        <Stat label="Solicitudes nuevas" value="0" accent delta="hoy" deltaDir="up" />
        <Stat label="Reservas activas" value="0" delta="próximos 60 días" deltaDir="flat" />
        <Stat label="Ocupación" value="—" delta="vs. mes anterior" deltaDir="flat" />
        <Stat label="Estado del perfil" value="—" delta="completar para activar" deltaDir="flat" />
      </div>

      <div className="empty">
        <div className="num">0</div>
        <div className="msg">Sin actividad reciente</div>
        <span className="text-mute">Cuando llegue una solicitud, aparecerá aquí.</span>
      </div>
    </>
  );
}
