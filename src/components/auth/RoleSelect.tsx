import { Building2, Music, Wrench, CalendarDays } from "lucide-react"
import type { Role } from "../../data/mockData"

const roles: { value: Role; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: "venue",
    label: "Propietario de Venue",
    description: "Publica tu espacio, gestiona reservas y conecta con artistas y organizadores.",
    icon: Building2,
  },
  {
    value: "artista",
    label: "Artista",
    description: "Muestra tu talento, consigue actuaciones y haz crecer tu audiencia.",
    icon: Music,
  },
  {
    value: "proveedor",
    label: "Proveedor de Servicios",
    description: "Ofrece sonido, iluminación, catering y otros servicios para eventos.",
    icon: Wrench,
  },
  {
    value: "cliente",
    label: "Organizador de Eventos",
    description: "Planifica eventos, encuentra venues, contrata artistas y gestiona presupuestos.",
    icon: CalendarDays,
  },
]

interface RoleSelectProps {
  onSelect: (role: Role) => void
  loading?: boolean
}

export default function RoleSelect({ onSelect, loading }: RoleSelectProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {roles.map(({ value, label, description, icon: Icon }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          disabled={loading}
          className="bg-surface border border-border rounded-xl p-6 text-left hover:border-coral/50 hover:bg-surface-alt transition-all group disabled:opacity-50"
        >
          <div className="p-3 bg-coral/10 rounded-lg w-fit mb-4 group-hover:bg-coral/20 transition-colors">
            <Icon className="w-6 h-6 text-coral" />
          </div>
          <h3 className="font-semibold text-lg mb-1">{label}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </button>
      ))}
    </div>
  )
}
