export type Role = 'admin' | 'venue' | 'artista' | 'proveedor' | 'cliente'

export interface Profile {
  id: string
  nombre: string
  email: string
  avatar_url: string | null
  rol: Role
  plan: string | null
  estado: 'activo' | 'pendiente' | 'bloqueado'
  created_at: string
  updated_at: string
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
  nombre: 'Alex Rivera',
  email: 'alex@example.com',
  avatar_url: null,
  rol: 'venue',
  plan: null,
  estado: 'activo',
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
}

export const venueStats = [
  { label: 'Total Reservas', value: '48', change: '+12%', icon: 'calendar' },
  { label: 'Ingresos (mes)', value: '€24,800', change: '+8%', icon: 'dollar-sign' },
  { label: 'Ocupación', value: '76%', change: '+5%', icon: 'bar-chart-3' },
  { label: 'Valoración', value: '4.8', change: '+0.2', icon: 'star' },
]

export const artistStats = [
  { label: 'Actuaciones', value: '127', change: '+3', icon: 'music' },
  { label: 'Valoración', value: '4.9', change: '+0.1', icon: 'star' },
  { label: 'Seguidores', value: '2.4K', change: '+180', icon: 'users' },
  { label: 'Ingresos (mes)', value: '€8,200', change: '+15%', icon: 'dollar-sign' },
]

export const providerStats = [
  { label: 'Presupuestos activos', value: '12', change: '+4', icon: 'file-text' },
  { label: 'Clientes', value: '34', change: '+2', icon: 'users' },
  { label: 'Ingresos (mes)', value: '€15,600', change: '+10%', icon: 'dollar-sign' },
  { label: 'Valoración', value: '4.7', change: '+0.1', icon: 'star' },
]

export const organizerStats = [
  { label: 'Eventos activos', value: '5', change: '+1', icon: 'calendar' },
  { label: 'Tickets totales', value: '1,240', change: '+320', icon: 'ticket' },
  { label: 'Presupuesto usado', value: '68%', change: '', icon: 'pie-chart' },
  { label: 'Mensajes', value: '23', change: '+7', icon: 'message-circle' },
]

export const mockBookings: Booking[] = [
  { id: '1', event: 'Summer Jazz Night', date: '2026-04-15', organizer: 'Maya Chen', status: 'confirmed', amount: 2500 },
  { id: '2', event: 'Indie Rock Showcase', date: '2026-04-18', organizer: 'Leo Park', status: 'pending', amount: 1800 },
  { id: '3', event: 'Electronic Music Fest', date: '2026-04-22', organizer: 'Sarah Kim', status: 'confirmed', amount: 5000 },
  { id: '4', event: 'Acoustic Open Mic', date: '2026-04-25', organizer: 'James Obi', status: 'pending', amount: 800 },
  { id: '5', event: 'Latin Dance Party', date: '2026-05-01', organizer: 'Carlos Ruiz', status: 'cancelled', amount: 3200 },
]

export const mockEvents: EventItem[] = [
  { id: '1', name: 'Neon Nights Festival', date: '2026-05-15', venue: 'The Grand Hall', status: 'planning', progress: 65 },
  { id: '2', name: 'Acoustic Sundays', date: '2026-04-20', venue: 'Rooftop Lounge', status: 'confirmed', progress: 90 },
  { id: '3', name: 'Underground Bass', date: '2026-06-01', venue: 'The Basement', status: 'draft', progress: 25 },
]

export const mockActivity: ActivityItem[] = [
  { id: '1', text: 'Nueva solicitud de reserva de Maya Chen', time: 'Hace 2h', icon: 'calendar-plus' },
  { id: '2', text: 'Pago recibido Jazz Night (€2,500)', time: 'Hace 5h', icon: 'credit-card' },
  { id: '3', text: 'Reseña de Leo Park (5 estrellas)', time: 'Hace 1 día', icon: 'star' },
]

export const venueInfo = {
  name: 'The Grand Hall',
  address: '420 Music Lane, Brooklyn, NY 11201',
  capacity: 350,
  description: 'Espacio versátil con sistema de sonido de última generación.',
  amenities: [
    { name: 'Sonido', enabled: true },
    { name: 'Iluminación', enabled: true },
    { name: 'Camerino', enabled: true },
    { name: 'Barra', enabled: true },
    { name: 'Parking', enabled: true },
    { name: 'Guardarropa', enabled: false },
    { name: 'VIP Lounge', enabled: true },
    { name: 'Terraza', enabled: false },
  ],
  photos: [
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
  ],
}

export const artistProfile = {
  name: 'Alex Rivera',
  genres: ['Jazz', 'Neo-Soul', 'R&B'],
  bio: 'Multi-instrumentista y vocalista que fusiona jazz, neo-soul y R&B.',
  socials: {
    instagram: '@alexrivera.music',
    spotify: 'Alex Rivera',
    soundcloud: 'alexriveramusic',
    website: 'alexriveramusic.com',
  },
  stats: { gigsPlayed: 127, rating: 4.9, followers: 2400 },
}

export const roleNavItems: Record<Role, { label: string; icon: string; path: string }[]> = {
  admin: [
    { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { label: 'Usuarios', icon: 'users', path: '/admin/users' },
    { label: 'Venues', icon: 'building-2', path: '/admin/venues' },
    { label: 'Artistas', icon: 'music', path: '/admin/artistas' },
    { label: 'Proveedores', icon: 'wrench', path: '/admin/proveedores' },
    { label: 'Ajustes', icon: 'settings', path: '/admin/settings' },
  ],
  venue: [
    { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { label: 'Mi Espacio', icon: 'building-2', path: '/venue/space' },
    { label: 'Calendario', icon: 'calendar', path: '/venue/calendar' },
    { label: 'Reservas', icon: 'book-open', path: '/venue/bookings' },
    { label: 'Analíticas', icon: 'bar-chart-3', path: '/venue/analytics' },
    { label: 'Ajustes', icon: 'settings', path: '/venue/settings' },
  ],
  artista: [
    { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { label: 'Perfil', icon: 'user', path: '/artist/profile' },
    { label: 'Portfolio', icon: 'image', path: '/artist/portfolio' },
    { label: 'Calendario', icon: 'calendar', path: '/artist/calendar' },
    { label: 'Bookings', icon: 'book-open', path: '/artist/bookings' },
    { label: 'Analíticas', icon: 'bar-chart-3', path: '/artist/analytics' },
  ],
  proveedor: [
    { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { label: 'Servicios', icon: 'wrench', path: '/provider/services' },
    { label: 'Presupuestos', icon: 'file-text', path: '/provider/quotes' },
    { label: 'Calendario', icon: 'calendar', path: '/provider/calendar' },
    { label: 'Clientes', icon: 'users', path: '/provider/clients' },
    { label: 'Ajustes', icon: 'settings', path: '/provider/settings' },
  ],
  cliente: [
    { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { label: 'Mis Eventos', icon: 'calendar-days', path: '/organizer/events' },
    { label: 'Buscar Venues', icon: 'search', path: '/organizer/venues' },
    { label: 'Presupuesto', icon: 'pie-chart', path: '/organizer/budget' },
    { label: 'Space Studio', icon: 'sparkles', path: '/organizer/studio' },
    { label: 'Mensajes', icon: 'message-circle', path: '/organizer/messages' },
  ],
}
