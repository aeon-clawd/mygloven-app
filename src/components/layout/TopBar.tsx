import { useLocation } from 'react-router'
import { ChevronRight } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/venue/space': 'My Space',
  '/venue/calendar': 'Calendar',
  '/venue/bookings': 'Bookings',
  '/venue/analytics': 'Analytics',
  '/venue/settings': 'Settings',
  '/artist/profile': 'Profile',
  '/artist/portfolio': 'Portfolio',
  '/artist/calendar': 'Calendar',
  '/artist/bookings': 'Bookings',
  '/artist/analytics': 'Analytics',
  '/provider/services': 'Services',
  '/provider/quotes': 'Quotes',
  '/provider/calendar': 'Calendar',
  '/provider/clients': 'Clients',
  '/provider/settings': 'Settings',
  '/organizer/events': 'My Events',
  '/organizer/venues': 'Find Venues',
  '/organizer/budget': 'Budget',
  '/organizer/studio': 'Space Studio',
  '/organizer/messages': 'Messages',
}

export default function TopBar() {
  const location = useLocation()
  const path = location.pathname
  const title = pageTitles[path] ?? 'Dashboard'

  const parts = path.split('/').filter(Boolean)
  const breadcrumbs = parts.map((part, i) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1),
    isLast: i === parts.length - 1,
  }))

  return (
    <header className="h-16 border-b border-border bg-surface-alt/50 backdrop-blur-sm flex items-center px-6 lg:px-8">
      <div className="lg:ml-0 ml-12">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {breadcrumbs.map(({ label, isLast }, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              <span className={isLast ? 'text-gray-300' : ''}>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </header>
  )
}
