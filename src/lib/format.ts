import type { EstadoCita } from '../api/types'

const meses = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

export function formatFecha(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`
}

/** "HH:mm:ss" -> "HH:mm" */
export function formatHora(span?: string | null): string {
  if (!span) return '—'
  return span.slice(0, 5)
}

export function formatMoneda(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor)
}

const estadoMeta: Record<EstadoCita, { label: string; cls: string }> = {
  Pendiente: { label: 'Pendiente', cls: 'badge--pendiente' },
  Confirmada: { label: 'Confirmada', cls: 'badge--confirmada' },
  Atendida: { label: 'Atendida', cls: 'badge--atendida' },
  Cancelada: { label: 'Cancelada', cls: 'badge--cancelada' },
}

export function estadoBadge(estado: EstadoCita) {
  return estadoMeta[estado] ?? { label: estado, cls: 'badge--pendiente' }
}

// Transiciones permitidas (espejo de EstadoCita.cs en el dominio).
const transiciones: Record<EstadoCita, EstadoCita[]> = {
  Pendiente: ['Confirmada', 'Cancelada'],
  Confirmada: ['Atendida', 'Cancelada'],
  Atendida: [],
  Cancelada: [],
}

export function siguientesEstados(estado: EstadoCita): EstadoCita[] {
  return transiciones[estado] ?? []
}
