export interface AnnexFormData {
  id: string;
  existing: boolean;
  nombre: string;
  config_de_pie: string;
  config_sentado: string;
  metros_cuadrados: string;
  tipo_espacio: string;
  tipos_evento: string[];
  images: SpaceImage[];
  precio_desde: string;
  precio_hasta: string;
  unidad_precio: string;
  precio_referencia_interno: string;
  orden: number;
}

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
  precio_desde: string;
  precio_hasta: string;
  unidad_precio: string;
  precio_referencia_interno: string;
  images: SpaceImage[];
  estado: string;
  annexes: AnnexFormData[];
  annexesToDelete: string[];
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
  "pricing",
  "fotos",
  "anexos",
  "estado",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  identidad: "Identidad",
  ubicacion: "Ubicación",
  pricing: "Pricing",
  fotos: "Fotos",
  anexos: "Anexos",
  estado: "Estado",
};

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
  "precio_desde",
  "precio_hasta",
  "unidad_precio",
  "estado",
];

export const DEFAULT_ANNEX: Omit<AnnexFormData, "id" | "orden"> = {
  existing: false,
  nombre: "",
  config_de_pie: "",
  config_sentado: "",
  metros_cuadrados: "",
  tipo_espacio: "",
  tipos_evento: [],
  images: [],
  precio_desde: "",
  precio_hasta: "",
  unidad_precio: "evento",
  precio_referencia_interno: "",
};

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
  precio_desde: "",
  precio_hasta: "",
  unidad_precio: "evento",
  precio_referencia_interno: "",
  images: [],
  estado: "borrador",
  annexes: [],
  annexesToDelete: [],
};
