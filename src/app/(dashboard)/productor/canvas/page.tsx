"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Columns2, Table } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CanvasMode = "chat" | "split" | "data";

const modes: { id: CanvasMode; label: string; icon: React.ElementType }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "split", label: "Split", icon: Columns2 },
  { id: "data", label: "Datos", icon: Table },
];

export default function CanvasPage() {
  const [mode, setMode] = useState<CanvasMode>("split");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nuevo evento</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  mode === m.id
                    ? "bg-accent text-white"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                <Icon size={14} />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {mode === "chat" && (
        <Card className="min-h-[60vh] flex flex-col justify-end">
          <p className="text-text-muted text-sm text-center mb-4">
            Describe tu evento y my&apos;G te ayudará a montarlo
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Quiero organizar una fiesta de 200 personas en Barcelona..."
              className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <Button>Enviar</Button>
          </div>
        </Card>
      )}

      {mode === "split" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="min-h-[60vh] flex flex-col justify-end">
            <p className="text-text-muted text-sm text-center mb-4">
              Chat con my&apos;G
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Describe tu evento..."
                className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <Button>Enviar</Button>
            </div>
          </Card>
          <Card className="min-h-[60vh]">
            <h3 className="font-semibold mb-4">Datos del evento</h3>
            <div className="space-y-4 text-sm text-text-secondary">
              <p>Los campos se irán completando automáticamente desde el chat</p>
            </div>
          </Card>
        </div>
      )}

      {mode === "data" && (
        <Card>
          <h3 className="font-semibold mb-4">Datos del evento</h3>
          <p className="text-sm text-text-secondary">
            Vista estructurada — próximamente
          </p>
        </Card>
      )}
    </div>
  );
}
