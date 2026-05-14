import type { EstadoEvento, EstadoSolicitud } from "@/types/database";

export const ESTADO_EVENTO_LABEL: Record<EstadoEvento, string> = {
  borrador: "Borrador",
  en_propuestas: "Propuesta",
  activo: "Confirmado",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

export const ESTADO_SOLICITUD_LABEL: Record<EstadoSolicitud, string> = {
  pendiente: "Pendiente",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  info_solicitada: "Info pedida",
};

export function eventoLabel(estado: string | null | undefined): string {
  if (!estado) return "—";
  return ESTADO_EVENTO_LABEL[estado as EstadoEvento] ?? estado;
}

export function solicitudLabel(estado: string | null | undefined): string {
  if (!estado) return "—";
  return ESTADO_SOLICITUD_LABEL[estado as EstadoSolicitud] ?? estado;
}
