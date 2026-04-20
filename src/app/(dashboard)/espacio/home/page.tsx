import { Card } from "@/components/ui/card";

export default function EspacioHomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bienvenido a tu espacio</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-text-secondary">Eventos este mes</p>
          <p className="text-2xl font-bold mt-1">0</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Próximo evento</p>
          <p className="text-sm font-medium text-text-muted mt-1">Sin eventos programados</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Estado del perfil</p>
          <p className="text-sm font-medium text-warning mt-1">Pendiente de completar</p>
        </Card>
      </div>
    </div>
  );
}
