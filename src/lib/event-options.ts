/**
 * Shared option lists for the producer flow. The values here are the source
 * of truth — admin forms, the canvas brief panel and the LLM tools all read
 * from this file so the vocabulary stays aligned.
 */

export interface Option {
  value: string;
  label: string;
}

export const TIPOS_EVENTO: Option[] = [
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

export const TIPOS_EVENTO_VALUES = TIPOS_EVENTO.map((o) => o.value) as [
  string,
  ...string[],
];

export const CATERING_OPTIONS: Option[] = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
  { value: "por_ver", label: "Por ver" },
];

export const CATERING_VALUES = CATERING_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

export function labelOf(options: Option[], value: string | null | undefined): string {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value;
}
