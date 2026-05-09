export interface ArtistImage {
  url: string;
  tag: string;
  label?: string;
  order: number;
  file?: File;
  preview?: string;
}

export interface ArtistFormData {
  nombre: string;
  slug: string;
  descripcion_corta: string;
  bio: string;
  genero_musical: string;
  instagram: string;
  spotify: string;
  soundcloud: string;
  youtube: string;
  web: string;
  linktree: string;
  email: string;
  telefono: string;
  images: ArtistImage[];
  estado: string;
}

export const SECTION_IDS = ["identidad", "redes", "fotos", "estado"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  identidad: "Identidad",
  redes: "Redes",
  fotos: "Fotos",
  estado: "Estado",
};

export const REQUIRED_FIELDS: (keyof ArtistFormData)[] = [
  "nombre",
  "descripcion_corta",
  "bio",
  "estado",
];

export const TAG_OPTIONS = [
  { value: "principal", label: "Principal" },
  { value: "press", label: "Press" },
  { value: "live", label: "Live" },
  { value: "detalle", label: "Detalle" },
  { value: "otro", label: "Otro" },
];

export const DEFAULT_FORM: ArtistFormData = {
  nombre: "",
  slug: "",
  descripcion_corta: "",
  bio: "",
  genero_musical: "",
  instagram: "",
  spotify: "",
  soundcloud: "",
  youtube: "",
  web: "",
  linktree: "",
  email: "",
  telefono: "",
  images: [],
  estado: "borrador",
};
