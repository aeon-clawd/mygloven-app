import { NavLink, useNavigate } from 'react-router'
import {
  LayoutDashboard, Building2, Calendar, BookOpen, BarChart3,
  Settings, User, Image, Music, Wrench, FileText, Users,
  CalendarDays, Search, PieChart, Sparkles, MessageCircle,
  LogOut, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { roleNavItems } from '../../data/mockData'

const iconMap: Record<string, React.ElementType> = {
  'layout-dashboard': LayoutDashboard,
  'building-2': Building2,
  'calendar': Calendar,
  'book-open': BookOpen,
  'bar-chart-3': BarChart3,
  'settings': Settings,
  'user': User,
  'image': Image,
  'music': Music,
  'wrench': Wrench,
  'file-text': FileText,
  'users': Users,
  'calendar-days': CalendarDays,
  'search': Search,
  'pie-chart': PieChart,
  'sparkles': Sparkles,
  'message-circle': MessageCircle,
}

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = profile?.role ? roleNavItems[profile.role] : []

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <h1 className="text-2xl font-bold">
          <span className="text-gray-400">my</span>
          <span className="text-coral">|</span>
          <span className="text-white">G</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon, path }) => {
          const Icon = iconMap[icon] ?? LayoutDashboard
          return (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-coral/10 text-coral'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-coral/20 flex items-center justify-center text-coral text-sm font-semibold shrink-0">
            {profile?.display_name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{profile?.display_name ?? 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role ?? 'No role'}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full px-1"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface rounded-lg border border-border"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-surface-alt border-r border-border flex flex-col transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
