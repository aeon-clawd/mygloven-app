import { PageHead } from "@/components/ui/page-head";

export default function EspacioEventosPage() {
  return (
    <>
      <PageHead
        eyebrow="Tu cartelera"
        title="Mis eventos"
        sub="Eventos confirmados y en proceso en tu espacio."
      />

      <div className="empty">
        <div className="num">0</div>
        <div className="msg">Sin eventos confirmados</div>
        <span className="text-mute">Cuando aceptes una solicitud, el evento aparecerá aquí.</span>
      </div>
    </>
  );
}
