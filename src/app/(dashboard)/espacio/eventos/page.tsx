import { Card } from "@/components/ui/card";

export default function EspacioEventosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis eventos</h1>
      <Card>
        <p className="text-text-secondary text-sm">
          No tienes eventos confirmados ni en proceso.
        </p>
      </Card>
    </div>
  );
}
