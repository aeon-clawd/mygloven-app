import { Button } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { PageHead } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";

export default function ProductorEventosPage() {
  return (
    <>
      <PageHead
        eyebrow="Tus producciones"
        title="Mis eventos"
        sub="Lo que estás montando. Lo que ya cerraste. Y lo que aún no te has atrevido a empezar."
        actions={
          <Link href="/productor/canvas">
            <Button variant="primary" data-cursor="empezar →">
              <Icon.plus /> Nuevo evento
            </Button>
          </Link>
        }
      />

      <div className="card-grid cols-3" style={{ marginBottom: 32 }}>
        <Stat label="En propuestas" value="0" deltaDir="flat" delta="esperando respuesta" />
        <Stat label="Confirmados" value="0" deltaDir="up" delta="próximos 30 días" accent />
        <Stat label="Borradores" value="0" deltaDir="flat" delta="por completar" />
      </div>

      <div className="empty">
        <div className="num">0</div>
        <div className="msg">Aún no tienes eventos</div>
        <span className="text-mute">Crea tu primer evento desde el canvas.</span>
        <Link href="/productor/canvas">
          <Button variant="primary" data-cursor="empezar →">
            <Icon.plus /> Crear evento
          </Button>
        </Link>
      </div>

      <hr className="hr" />

      <div className="card raised" style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 24 }}>
        <div>
          <div className="page-eyebrow" style={{ marginBottom: 8 }}>
            — Lo siguiente
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: "-.02em",
              marginBottom: 8,
            }}
          >
            Empieza un evento describiéndolo en una frase
            <span style={{ color: "var(--color-accent)" }}>.</span>
          </div>
          <p className="page-sub" style={{ margin: 0 }}>
            El canvas combina chat con my&apos;G y datos estructurados. Tú hablas, el sistema rellena.
          </p>
        </div>
        <Link href="/productor/canvas">
          <Button variant="primary" size="lg" data-cursor="abrir canvas →">
            Abrir canvas <Icon.arrow />
          </Button>
        </Link>
      </div>
    </>
  );
}
