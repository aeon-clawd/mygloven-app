import { Music, Star, Users, Instagram, Globe, Headphones } from 'lucide-react'
import { artistProfile } from '../../data/mockData'

export default function ProfilePage() {
  const { name, genres, bio, socials, stats } = artistProfile

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-coral to-coral-hover flex items-center justify-center text-3xl font-bold text-white shrink-0">
            {name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">{name}</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-coral/10 text-coral text-xs font-medium rounded-full border border-coral/20"
                >
                  {genre}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-xl">{bio}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5 text-center">
          <Music className="w-5 h-5 text-coral mx-auto mb-2" />
          <p className="text-2xl font-semibold">{stats.gigsPlayed}</p>
          <p className="text-sm text-gray-400">Gigs Played</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 text-center">
          <Star className="w-5 h-5 text-coral mx-auto mb-2" />
          <p className="text-2xl font-semibold">{stats.rating}</p>
          <p className="text-sm text-gray-400">Rating</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 text-center">
          <Users className="w-5 h-5 text-coral mx-auto mb-2" />
          <p className="text-2xl font-semibold">{stats.followers.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Followers</p>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4">Social Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-surface-alt rounded-lg hover:bg-white/[0.04] transition-colors">
            <Instagram className="w-5 h-5 text-pink-400" />
            <div>
              <p className="text-sm font-medium">Instagram</p>
              <p className="text-xs text-gray-500">{socials.instagram}</p>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-surface-alt rounded-lg hover:bg-white/[0.04] transition-colors">
            <Headphones className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium">Spotify</p>
              <p className="text-xs text-gray-500">{socials.spotify}</p>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-surface-alt rounded-lg hover:bg-white/[0.04] transition-colors">
            <Music className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-sm font-medium">SoundCloud</p>
              <p className="text-xs text-gray-500">{socials.soundcloud}</p>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-surface-alt rounded-lg hover:bg-white/[0.04] transition-colors">
            <Globe className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium">Website</p>
              <p className="text-xs text-gray-500">{socials.website}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
