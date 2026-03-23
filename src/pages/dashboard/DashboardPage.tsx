import { useAuth } from "../../hooks/useAuth"
import StatCard from "../../components/shared/StatCard"
import {
  venueStats, artistStats, providerStats, organizerStats,
  mockActivity,
} from "../../data/mockData"
import type { Role } from "../../data/mockData"
import {
  CalendarPlus, CreditCard, Star, CheckCircle,
  MessageCircle, Calendar,
} from "lucide-react"

const activityIcons: Record<string, React.ElementType> = {
  "calendar-plus": CalendarPlus,
  "credit-card": CreditCard,
  "star": Star,
  "check-circle": CheckCircle,
  "message-circle": MessageCircle,
  "calendar": Calendar,
}

const statsMap: Partial<Record<Role, typeof venueStats>> = {
  admin: venueStats,
  venue: venueStats,
  artista: artistStats,
  proveedor: providerStats,
  cliente: organizerStats,
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const rol = profile?.rol ?? "venue"
  const stats = statsMap[rol] ?? venueStats

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">
          Hola, {profile?.nombre ?? "Usuario"}
        </h2>
        <p className="text-gray-400 mt-1">
          Esto es lo que pasa hoy en tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold">Actividad reciente</h3>
        </div>
        <div className="divide-y divide-border">
          {mockActivity.map((item) => {
            const Icon = activityIcons[item.icon] ?? Calendar
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="p-2 bg-coral/10 rounded-lg shrink-0">
                  <Icon className="w-4 h-4 text-coral" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{item.text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
