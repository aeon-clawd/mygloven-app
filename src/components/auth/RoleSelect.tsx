import { Building2, Music, Wrench, CalendarDays } from 'lucide-react'
import type { Role } from '../../data/mockData'

const roles: { value: Role; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: 'venue',
    label: 'Venue Owner',
    description: 'List your space, manage bookings, and connect with artists and organizers.',
    icon: Building2,
  },
  {
    value: 'artist',
    label: 'Artist',
    description: 'Showcase your talent, get booked for gigs, and grow your audience.',
    icon: Music,
  },
  {
    value: 'provider',
    label: 'Service Provider',
    description: 'Offer sound, lighting, catering and other event services.',
    icon: Wrench,
  },
  {
    value: 'organizer',
    label: 'Event Organizer',
    description: 'Plan events, find venues, hire artists, and manage budgets.',
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
