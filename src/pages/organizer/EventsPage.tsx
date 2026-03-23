import { useState } from 'react'
import { Plus, MapPin, Calendar, X } from 'lucide-react'
import { mockEvents } from '../../data/mockData'
import StatusBadge from '../../components/shared/StatusBadge'

export default function EventsPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Events</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-coral hover:bg-coral-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockEvents.map((event) => (
          <div
            key={event.id}
            className="bg-surface rounded-xl border border-border p-5 hover:border-coral/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-base">{event.name}</h3>
              <StatusBadge status={event.status} />
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(event.date).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {event.venue}
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-400">Progress</span>
                <span className="text-coral font-medium">{event.progress}%</span>
              </div>
              <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                <div
                  className="h-full bg-coral rounded-full transition-all"
                  style={{ width: `${event.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Create New Event</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false) }}>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Event Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Music Festival"
                  className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-coral/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Date</label>
                  <input
                    type="date"
                    className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-coral/50 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Venue</label>
                  <input
                    type="text"
                    placeholder="Search venues..."
                    className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-coral/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your event..."
                  className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-coral/50 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-border text-gray-400 hover:text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-coral hover:bg-coral-hover text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
