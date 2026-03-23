export type Role = 'venue' | 'artist' | 'provider' | 'organizer'

export interface Profile {
  id: string
  user_id: string
  role: Role
  display_name: string
  avatar_url: string
  created_at: string
}

export interface Booking {
  id: string
  event: string
  date: string
  organizer: string
  status: 'pending' | 'confirmed' | 'cancelled'
  amount: number
}

export interface EventItem {
  id: string
  name: string
  date: string
  venue: string
  status: 'draft' | 'planning' | 'confirmed' | 'live'
  progress: number
}

export interface ActivityItem {
  id: string
  text: string
  time: string
  icon: string
}

export const mockProfile: Profile = {
  id: '1',
  user_id: 'u1',
  role: 'venue',
  display_name: 'Alex Rivera',
  avatar_url: '',
  created_at: '2025-01-15T10:00:00Z',
}

export const venueStats = [
  { label: 'Total Bookings', value: '48', change: '+12%', icon: 'calendar' },
  { label: 'Revenue (MTD)', value: '$24,800', change: '+8%', icon: 'dollar-sign' },
  { label: 'Occupancy Rate', value: '76%', change: '+5%', icon: 'bar-chart-3' },
  { label: 'Avg Rating', value: '4.8', change: '+0.2', icon: 'star' },
]

export const artistStats = [
  { label: 'Gigs Played', value: '127', change: '+3', icon: 'music' },
  { label: 'Avg Rating', value: '4.9', change: '+0.1', icon: 'star' },
  { label: 'Followers', value: '2.4K', change: '+180', icon: 'users' },
  { label: 'Earnings (MTD)', value: '$8,200', change: '+15%', icon: 'dollar-sign' },
]

export const providerStats = [
  { label: 'Active Quotes', value: '12', change: '+4', icon: 'file-text' },
  { label: 'Clients', value: '34', change: '+2', icon: 'users' },
  { label: 'Revenue (MTD)', value: '$15,600', change: '+10%', icon: 'dollar-sign' },
  { label: 'Rating', value: '4.7', change: '+0.1', icon: 'star' },
]

export const organizerStats = [
  { label: 'Active Events', value: '5', change: '+1', icon: 'calendar' },
  { label: 'Total Tickets', value: '1,240', change: '+320', icon: 'ticket' },
  { label: 'Budget Used', value: '68%', change: '', icon: 'pie-chart' },
  { label: 'Messages', value: '23', change: '+7', icon: 'message-circle' },
]

export const mockBookings: Booking[] = [
  { id: '1', event: 'Summer Jazz Night', date: '2026-04-15', organizer: 'Maya Chen', status: 'confirmed', amount: 2500 },
  { id: '2', event: 'Indie Rock Showcase', date: '2026-04-18', organizer: 'Leo Park', status: 'pending', amount: 1800 },
  { id: '3', event: 'Electronic Music Fest', date: '2026-04-22', organizer: 'Sarah Kim', status: 'confirmed', amount: 5000 },
  { id: '4', event: 'Acoustic Open Mic', date: '2026-04-25', organizer: 'James Obi', status: 'pending', amount: 800 },
  { id: '5', event: 'Latin Dance Party', date: '2026-05-01', organizer: 'Carlos Ruiz', status: 'cancelled', amount: 3200 },
  { id: '6', event: 'Hip-Hop Cypher', date: '2026-05-05', organizer: 'Dre Wilson', status: 'confirmed', amount: 2200 },
  { id: '7', event: 'Classical Evening', date: '2026-05-10', organizer: 'Nina Vogt', status: 'pending', amount: 1500 },
]

export const mockEvents: EventItem[] = [
  { id: '1', name: 'Neon Nights Festival', date: '2026-05-15', venue: 'The Grand Hall', status: 'planning', progress: 65 },
  { id: '2', name: 'Acoustic Sundays', date: '2026-04-20', venue: 'Rooftop Lounge', status: 'confirmed', progress: 90 },
  { id: '3', name: 'Underground Bass', date: '2026-06-01', venue: 'The Basement', status: 'draft', progress: 25 },
  { id: '4', name: 'Jazz & Wine Evening', date: '2026-04-28', venue: 'Velvet Room', status: 'confirmed', progress: 100 },
  { id: '5', name: 'Summer Rooftop Series', date: '2026-07-10', venue: 'Sky Terrace', status: 'planning', progress: 40 },
]

export const mockActivity: ActivityItem[] = [
  { id: '1', text: 'New booking request from Maya Chen', time: '2 hours ago', icon: 'calendar-plus' },
  { id: '2', text: 'Payment received for Jazz Night ($2,500)', time: '5 hours ago', icon: 'credit-card' },
  { id: '3', text: 'Review posted by Leo Park (5 stars)', time: '1 day ago', icon: 'star' },
  { id: '4', text: 'Booking confirmed for Electronic Music Fest', time: '1 day ago', icon: 'check-circle' },
  { id: '5', text: 'New message from Sarah Kim', time: '2 days ago', icon: 'message-circle' },
  { id: '6', text: 'Calendar updated: Acoustic Open Mic added', time: '3 days ago', icon: 'calendar' },
]

export const venueInfo = {
  name: 'The Grand Hall',
  address: '420 Music Lane, Brooklyn, NY 11201',
  capacity: 350,
  description: 'A versatile event space featuring state-of-the-art sound systems, dynamic lighting, and a spacious dance floor. Perfect for concerts, DJ sets, private events, and corporate gatherings.',
  amenities: [
    { name: 'Sound System', enabled: true },
    { name: 'Stage Lighting', enabled: true },
    { name: 'Green Room', enabled: true },
    { name: 'Bar Service', enabled: true },
    { name: 'Parking (50 spots)', enabled: true },
    { name: 'Coat Check', enabled: false },
    { name: 'VIP Lounge', enabled: true },
    { name: 'Outdoor Terrace', enabled: false },
  ],
  photos: [
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop',
  ],
}

export const artistProfile = {
  name: 'Alex Rivera',
  genres: ['Jazz', 'Neo-Soul', 'R&B'],
  bio: 'Multi-instrumentalist and vocalist blending jazz, neo-soul, and R&B into immersive live performances. Based in Brooklyn, performing across NYC venues for over 8 years.',
  socials: {
    instagram: '@alexrivera.music',
    spotify: 'Alex Rivera',
    soundcloud: 'alexriveramusic',
    website: 'alexriveramusic.com',
  },
  stats: {
    gigsPlayed: 127,
    rating: 4.9,
    followers: 2400,
  },
}

export const roleNavItems: Record<Role, { label: string; icon: string; path: string }[]> = {
  venue: [
    { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { label: 'My Space', icon: 'building-2', path: '/venue/space' },
    { label: 'Calendar', icon: 'calendar', path: '/venue/calendar' },
    { label: 'Bookings', icon: 'book-open', path: '/venue/bookings' },
    { label: 'Analytics', icon: 'bar-chart-3', path: '/venue/analytics' },
    { label: 'Settings', icon: 'settings', path: '/venue/settings' },
  ],
  artist: [
    { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { label: 'Profile', icon: 'user', path: '/artist/profile' },
    { label: 'Portfolio', icon: 'image', path: '/artist/portfolio' },
    { label: 'Calendar', icon: 'calendar', path: '/artist/calendar' },
    { label: 'Bookings', icon: 'book-open', path: '/artist/bookings' },
    { label: 'Analytics', icon: 'bar-chart-3', path: '/artist/analytics' },
  ],
  provider: [
    { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { label: 'Services', icon: 'wrench', path: '/provider/services' },
    { label: 'Quotes', icon: 'file-text', path: '/provider/quotes' },
    { label: 'Calendar', icon: 'calendar', path: '/provider/calendar' },
    { label: 'Clients', icon: 'users', path: '/provider/clients' },
    { label: 'Settings', icon: 'settings', path: '/provider/settings' },
  ],
  organizer: [
    { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { label: 'My Events', icon: 'calendar-days', path: '/organizer/events' },
    { label: 'Find Venues', icon: 'search', path: '/organizer/venues' },
    { label: 'Budget', icon: 'pie-chart', path: '/organizer/budget' },
    { label: 'Space Studio', icon: 'sparkles', path: '/organizer/studio' },
    { label: 'Messages', icon: 'message-circle', path: '/organizer/messages' },
  ],
}
