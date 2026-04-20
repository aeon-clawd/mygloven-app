import { Card } from "@/components/ui/card";

export default function EspacioSolicitudesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bandeja de solicitudes</h1>
      <Card>
        <p className="text-text-secondary text-sm">
          No tienes solicitudes pendientes.
        </p>
      </Card>
    </div>
  );
}
