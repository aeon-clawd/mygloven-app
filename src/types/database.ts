export type Rol = "admin" | "productor" | "venue" | "artista" | "proveedor";
export type EstadoUsuario = "activo" | "pendiente" | "bloqueado";
export type EstadoEvento = "borrador" | "activo" | "en_propuestas" | "cerrado" | "cancelado";
export type EstadoSolicitud = "pendiente" | "aceptada" | "rechazada" | "info_solicitada";
export type EstadoEspacio = "borrador" | "activo" | "pausado" | "eliminado";
export type EstadoCandidatura = "pendiente" | "aprobada" | "rechazada";
export type TipoEspacio = "interior" | "exterior" | "mixto";
export type UnidadPrecio = "hora" | "evento" | "dia";
export type TipoVenue = "sala" | "rooftop" | "restaurante" | "hotel" | "aire_libre" | "local_privado" | "otro";

export interface Profile {
  id: string;
  nombre: string;
  email: string;
  avatar_url: string | null;
  rol: Rol;
  estado: EstadoUsuario;
  ciudad: string | null;
  telefono: string | null;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  owner_id: string;
  nombre: string;
  slug: string | null;
  descripcion: string | null;
  descripcion_corta: string | null;
  pais: string | null;
  ciudad: string | null;
  barrio: string | null;
  direccion: string | null;
  coordenadas: { lat: number; lng: number } | null;
  mostrar_direccion: boolean;
  web: string | null;
  instagram: string | null;
  tipo: TipoVenue | null;
  subtipo: string | null;
  precio_desde: number | null;
  precio_hasta: number | null;
  unidad_precio: UnidadPrecio;
  precio_referencia_interno: number | null;
  images: VenueImage[] | null;
  logo_url: string | null;
  tags: string[] | null;
  telefono: string | null;
  email: string | null;
  verificado: boolean;
  exterior: boolean | null;
  rider: boolean | null;
  licencia_musica: boolean | null;
  equipo_sonido: string | null;
  estado: EstadoEspacio;
  horario_general: string | null;
  horario_flexible: boolean;
  fechas_bloqueadas: string[];
  geo: { lat: number; lng: number } | null;
  created_at: string;
  updated_at: string;
  annexes?: VenueAnnex[];
}

export interface VenueAnnex {
  id: string;
  venue_id: string;
  nombre: string;
  config_de_pie: number | null;
  config_sentado: number | null;
  metros_cuadrados: number | null;
  tipo_espacio: TipoEspacio | null;
  tipos_evento: string[];
  images: VenueImage[];
  precio_desde: number | null;
  precio_hasta: number | null;
  unidad_precio: UnidadPrecio;
  precio_referencia_interno: number | null;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface VenueImage {
  url: string;
  tag: "principal" | "base_space_studio" | "evento_montado" | "detalle" | "exterior" | "zona";
  label?: string;
  order: number;
}

export interface Evento {
  id: string;
  cliente_id: string;
  tipo: string | null;
  titulo: string;
  descripcion: string | null;
  ciudad: string | null;
  fecha_deseada: string | null;
  num_personas: number | null;
  presupuesto: number | null;
  estado: EstadoEvento;
  created_at: string;
  updated_at: string;
}

export interface Solicitud {
  id: string;
  evento_id: string;
  venue_id: string;
  productor_id: string;
  estado: EstadoSolicitud;
  mensaje_productor: string | null;
  respuesta_espacio: string | null;
  fecha_evento: string | null;
  num_personas: number | null;
  created_at: string;
  updated_at: string;
}

export interface Candidatura {
  id: string;
  usuario_id: string;
  rol: "venue" | "artista" | "proveedor";
  estado: EstadoCandidatura;
  datos: Record<string, unknown>;
  notas_admin: string | null;
  revisado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface Artista {
  id: string;
  owner_id: string;
  nombre: string;
  slug: string | null;
  bio: string | null;
  genero_musical: string | null;
  rrss: string | null;
  spotify: string | null;
  youtube: string | null;
  linktree: string | null;
  telefono: string | null;
  email: string | null;
  tags: string[] | null;
  verificado: boolean;
  rider: string | null;
  avatar_url: string | null;
  images: VenueImage[] | null;
  created_at: string;
  updated_at: string;
}

export interface Proveedor {
  id: string;
  owner_id: string;
  nombre: string;
  slug: string | null;
  tipo_servicio: string | null;
  zona_cobertura: string | null;
  descripcion: string | null;
  precio_orientativo: string | null;
  tags: string[] | null;
  verificado: boolean;
  telefono: string | null;
  email: string | null;
  web: string | null;
  images: VenueImage[] | null;
  created_at: string;
  updated_at: string;
}
