const variants: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  draft: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  planning: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  live: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const classes = variants[status] ?? variants.draft

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
