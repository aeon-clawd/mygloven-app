import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EspacioPerfilPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <Button variant="secondary">Editar perfil</Button>
      </div>

      <Card>
        <p className="text-text-secondary text-sm">
          Completa tu perfil para empezar a recibir solicitudes de productores.
        </p>
      </Card>
    </div>
  );
}
