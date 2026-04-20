import { Logo } from "@/components/layout/logo";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function PendientePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <Logo className="mx-auto h-10" />
        <Card className="flex flex-col items-center gap-4 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning">
            <Clock size={32} />
          </div>
          <h1 className="text-lg font-semibold">Candidatura en revisión</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos
            cuando sea aprobada.
          </p>
        </Card>
      </div>
    </div>
  );
}
