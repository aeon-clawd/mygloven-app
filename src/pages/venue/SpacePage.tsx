import { useState } from 'react'
import { MapPin, Users, Building2 } from 'lucide-react'
import { venueInfo } from '../../data/mockData'

export default function SpacePage() {
  const [amenities, setAmenities] = useState(venueInfo.amenities)

  const toggleAmenity = (index: number) => {
    setAmenities((prev) =>
      prev.map((a, i) => (i === index ? { ...a, enabled: !a.enabled } : a))
    )
  }

  return (
    <div className="space-y-8">
      {/* Venue Info Card */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-coral/10 rounded-xl">
            <Building2 className="w-7 h-7 text-coral" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{venueInfo.name}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {venueInfo.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Capacity: {venueInfo.capacity}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed max-w-2xl">
              {venueInfo.description}
            </p>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4">Photo Gallery</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {venueInfo.photos.map((photo, i) => (
            <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-surface-alt">
              <img
                src={photo}
                alt={`Venue photo ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4">Amenities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {amenities.map((amenity, i) => (
            <div
              key={amenity.name}
              className="flex items-center justify-between px-4 py-3 bg-surface-alt rounded-lg"
            >
              <span className="text-sm">{amenity.name}</span>
              <button
                onClick={() => toggleAmenity(i)}
                className={`relative w-10 h-5.5 rounded-full transition-colors ${
                  amenity.enabled ? 'bg-coral' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${
                    amenity.enabled ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
