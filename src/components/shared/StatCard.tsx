import {
  Calendar, DollarSign, BarChart3, Star, Music, Users,
  FileText, PieChart, MessageCircle, Ticket,
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  'calendar': Calendar,
  'dollar-sign': DollarSign,
  'bar-chart-3': BarChart3,
  'star': Star,
  'music': Music,
  'users': Users,
  'file-text': FileText,
  'pie-chart': PieChart,
  'message-circle': MessageCircle,
  'ticket': Ticket,
}

interface StatCardProps {
  label: string
  value: string
  change: string
  icon: string
}

export default function StatCard({ label, value, change, icon }: StatCardProps) {
  const Icon = iconMap[icon] ?? Calendar

  return (
    <div className="bg-surface rounded-xl p-5 border border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
          {change && (
            <p className="text-sm text-emerald-400 mt-1">{change}</p>
          )}
        </div>
        <div className="p-2.5 bg-coral/10 rounded-lg">
          <Icon className="w-5 h-5 text-coral" />
        </div>
      </div>
    </div>
  )
}
