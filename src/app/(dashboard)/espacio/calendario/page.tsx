import { Card } from "@/components/ui/card";

export default function EspacioCalendarioPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Calendario</h1>
      <Card className="min-h-[400px] flex items-center justify-center">
        <p className="text-text-secondary text-sm">
          Vista de calendario — próximamente
        </p>
      </Card>
    </div>
  );
}
