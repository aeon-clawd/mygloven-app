import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ProductorEventosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis eventos</h1>
        <Link href="/productor/canvas">
          <Button>
            <Plus size={16} />
            Nuevo evento
          </Button>
        </Link>
      </div>

      <Card>
        <p className="text-text-secondary text-sm">
          Aún no tienes eventos. Crea tu primer evento para empezar.
        </p>
      </Card>
    </div>
  );
}
