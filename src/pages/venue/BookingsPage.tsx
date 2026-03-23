import { useState } from 'react'
import { mockBookings, type Booking } from '../../data/mockData'
import DataTable from '../../components/shared/DataTable'
import StatusBadge from '../../components/shared/StatusBadge'

type FilterTab = 'all' | 'pending' | 'confirmed'

export default function BookingsPage() {
  const [filter, setFilter] = useState<FilterTab>('all')

  const filtered = filter === 'all'
    ? mockBookings
    : mockBookings.filter((b) => b.status === filter)

  const tabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: mockBookings.length },
    { value: 'pending', label: 'Pending', count: mockBookings.filter((b) => b.status === 'pending').length },
    { value: 'confirmed', label: 'Confirmed', count: mockBookings.filter((b) => b.status === 'confirmed').length },
  ]

  const columns = [
    { key: 'event', label: 'Event' },
    { key: 'date', label: 'Date', render: (b: Booking) => new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    { key: 'organizer', label: 'Organizer' },
    { key: 'status', label: 'Status', render: (b: Booking) => <StatusBadge status={b.status} /> },
    { key: 'amount', label: 'Amount', render: (b: Booking) => <span className="font-medium">${b.amount.toLocaleString()}</span> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bookings</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-surface-alt rounded-lg p-1 w-fit">
        {tabs.map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-surface text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
            <span className={`ml-2 text-xs ${filter === value ? 'text-coral' : 'text-gray-500'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border">
        <DataTable<Booking>
          columns={columns}
          data={filtered}
          keyField="id"
        />
      </div>
    </div>
  )
}
