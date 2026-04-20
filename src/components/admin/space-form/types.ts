export interface SpaceFormData {
  nombre: string;
  slug: string;
  descripcion_corta: string;
  descripcion: string;
  web: string;
  instagram: string;
  pais: string;
  ciudad: string;
  barrio: string;
  direccion: string;
  mostrar_direccion: boolean;
  coordenadas: { lat: number; lng: number } | null;
  config_de_pie: string;
  config_sentado: string;
  metros_cuadrados: string;
  tipo_espacio: string;
  zonas: string[];
  tipos_evento: string[];
  precio_desde: string;
  precio_hasta: string;
  unidad_precio: string;
  precio_referencia_interno: string;
  images: SpaceImage[];
  nombre_gestor: string;
  email_interno: string;
  telefono_interno: string;
  notas_internas: string;
  estado: string;
}

export interface SpaceImage {
  url: string;
  tag: string;
  label?: string;
  order: number;
  file?: File;
  preview?: string;
}

export const SECTION_IDS = [
  "identidad",
  "ubicacion",
  "capacidad",
  "tipo-de-uso",
  "pricing",
  "fotos",
  "contacto",
  "estado",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  identidad: "Identidad",
  ubicacion: "Ubicación",
  capacidad: "Capacidad y físico",
  "tipo-de-uso": "Tipo de uso",
  pricing: "Pricing",
  fotos: "Fotos",
  contacto: "Contacto interno",
  estado: "Estado",
};

export const ZONAS_OPTIONS = [
  { value: "sala_principal", label: "Sala principal" },
  { value: "terraza", label: "Terraza" },
  { value: "backstage", label: "Backstage" },
  { value: "barra", label: "Barra" },
  { value: "escenario", label: "Escenario" },
  { value: "comedor", label: "Comedor" },
  { value: "otro", label: "Otro" },
];

export const TIPOS_EVENTO_OPTIONS = [
  { value: "fiesta_privada", label: "Fiesta privada" },
  { value: "corporate", label: "Corporate" },
  { value: "concierto", label: "Concierto" },
  { value: "dj_set", label: "DJ set" },
  { value: "rodaje", label: "Rodaje" },
  { value: "exposicion", label: "Exposición" },
  { value: "presentacion", label: "Presentación" },
  { value: "showcase", label: "Showcase" },
  { value: "otro", label: "Otro" },
];

export const TIPO_ESPACIO_OPTIONS = [
  { value: "interior", label: "Interior" },
  { value: "exterior", label: "Exterior" },
  { value: "mixto", label: "Mixto" },
];

export const REQUIRED_FIELDS: (keyof SpaceFormData)[] = [
  "nombre",
  "descripcion_corta",
  "descripcion",
  "ciudad",
  "barrio",
  "direccion",
  "config_de_pie",
  "metros_cuadrados",
  "tipo_espacio",
  "zonas",
  "tipos_evento",
  "precio_desde",
  "precio_hasta",
  "unidad_precio",
  "estado",
];

export const DEFAULT_FORM: SpaceFormData = {
  nombre: "",
  slug: "",
  descripcion_corta: "",
  descripcion: "",
  web: "",
  instagram: "",
  pais: "España",
  ciudad: "",
  barrio: "",
  direccion: "",
  mostrar_direccion: false,
  coordenadas: null,
  config_de_pie: "",
  config_sentado: "",
  metros_cuadrados: "",
  tipo_espacio: "",
  zonas: [],
  tipos_evento: [],
  precio_desde: "",
  precio_hasta: "",
  unidad_precio: "evento",
  precio_referencia_interno: "",
  images: [],
  nombre_gestor: "",
  email_interno: "",
  telefono_interno: "",
  notas_internas: "",
  estado: "borrador",
};
