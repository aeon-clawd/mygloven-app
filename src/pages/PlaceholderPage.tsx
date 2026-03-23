import { Construction } from 'lucide-react'
import { useLocation } from 'react-router'

export default function PlaceholderPage() {
  const location = useLocation()
  const parts = location.pathname.split('/').filter(Boolean)
  const title = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="p-4 bg-surface rounded-2xl w-fit mx-auto mb-6">
          <Construction className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-400 text-sm">This page is under construction.</p>
      </div>
    </div>
  )
}
