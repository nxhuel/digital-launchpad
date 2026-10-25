import type { CardSubmissionItem } from '../types'

type RsvpPayload = Record<string, unknown>

/** El contrato nuevo usa `acompañantes`; se aceptan variantes sin tilde por compatibilidad. */
const COMPANION_KEYS = ['acompañantes', 'acompanantes', 'subinvitados'] as const

/** Claves del grupo que no queremos repetir como "detalle" en el panel. */
const RSVP_GROUP_KEYS = new Set([
  'nombre',
  'asisten',
  'menu',
  'cantidad',
  'notas',
  ...COMPANION_KEYS,
])

/** Etiquetas más claras para los campos del formulario RSVP. */
export const RSVP_PAYLOAD_LABELS: Record<string, string> = {
  cantidad: 'acompañantes',
  acompañantes: 'acompañantes',
  acompanantes: 'acompañantes',
  subinvitados: 'acompañantes',
  asisten: 'asiste',
  menu: 'menú',
  notas: 'notas',
  cancion: 'canción',
  mensaje: 'mensaje',
}

export interface RsvpPerson {
  nombre: string
  asisten: boolean | null
  menu: string | null
  notas: string | null
  esPrincipal: boolean
  /** Acompañante informado solo por `cantidad`, sin detalle individual. */
  sinDetalle: boolean
}

export interface RsvpGroup {
  nombre: string
  asisten: boolean | null
  menu: string | null
  notas: string | null
  people: RsvpPerson[]
  companions: RsvpPerson[]
  declaredCompanions: number
  hasCompanionDetail: boolean
}

export interface RsvpSummary {
  /** Cantidad de confirmaciones (grupos familiares). */
  groups: number
  /** Personas declaradas: principal + acompañantes. */
  declaredPeople: number
  /** Acompañantes declarados. */
  companions: number
  /** Personas con asisten === true. */
  attending: number
  /** Personas con asisten === false. */
  declined: number
  /** Personas sin respuesta (asisten ausente o null). */
  pending: number
  /** Menú elegido por las personas que asisten. */
  menuCounts: Record<string, number>
}

/** Respeta saltos de línea y convierte los <br> literales que manda la tarjeta. */
export function normalizeMultiline(value: unknown): string {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toBoolOrNull(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (value === 1) return true
    if (value === 0) return false
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'si', 'sí', 'asiste'].includes(normalized)) return true
    if (['false', '0', 'no', 'no asiste'].includes(normalized)) return false
  }
  return null
}

function toTextOrNull(value: unknown): string | null {
  if (typeof value === 'string') {
    const text = value.trim()
    return text || null
  }
  if (typeof value === 'number') return String(value)
  return null
}

function toCount(value: unknown): number {
  const n = typeof value === 'number' ? value : Number.parseInt(String(value ?? '').trim(), 10)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

/**
 * Cantidad de acompañantes declarada por el invitado.
 * Compatibilidad con tarjetas viejas que solo mandan `cantidad`.
 */
export function companionCount(payload: RsvpPayload): number {
  return toCount(payload.cantidad)
}

/** Devuelve la lista cruda de acompañantes/subinvitados, si existe. */
function rawCompanions(payload: RsvpPayload): unknown[] {
  for (const key of COMPANION_KEYS) {
    const value = payload[key]
    if (Array.isArray(value)) return value
  }
  return []
}

function companionFromRaw(value: unknown, index: number): RsvpPerson {
  if (isRecord(value)) {
    return {
      nombre: toTextOrNull(value.nombre) ?? `Acompañante ${index + 1}`,
      asisten: toBoolOrNull(value.asisten),
      menu: toTextOrNull(value.menu),
      notas: toTextOrNull(value.notas ?? value.nota ?? value.detalle),
      esPrincipal: false,
      sinDetalle: false,
    }
  }
  return {
    nombre: toTextOrNull(value) ?? `Acompañante ${index + 1}`,
    asisten: null,
    menu: null,
    notas: null,
    esPrincipal: false,
    sinDetalle: false,
  }
}

/**
 * Normaliza una respuesta RSVP a un grupo: el invitado principal + sus
 * acompañantes. Si la tarjeta vieja solo mandó `cantidad`, se crean
 * acompañantes sintéticos que heredan el estado del principal.
 */
export function rsvpGroup(row: CardSubmissionItem): RsvpGroup {
  const payload: RsvpPayload = isRecord(row.payload) ? row.payload : {}
  const nombre = toTextOrNull(payload.nombre) ?? 'Sin nombre'
  const asisten = toBoolOrNull(payload.asisten)
  const menu = toTextOrNull(payload.menu)
  const raw = rawCompanions(payload)
  const hasCompanionDetail = raw.length > 0 || COMPANION_KEYS.some(key => Array.isArray(payload[key]))

  const companions = raw.map((item, index) => companionFromRaw(item, index))
  const legacyCount = companionCount(payload)
  const declaredCompanions = Math.max(companions.length, legacyCount)

  // Si hay `cantidad` pero no detalle (o el detalle está incompleto), completamos
  // para no perder personas en los totales. Sin detalle heredan el estado del
  // principal, que era el comportamiento de las tarjetas anteriores.
  for (let i = companions.length; i < declaredCompanions; i++) {
    companions.push({
      nombre: `Acompañante ${i + 1}`,
      asisten,
      menu: null,
      notas: null,
      esPrincipal: false,
      sinDetalle: true,
    })
  }

  const main: RsvpPerson = {
    nombre,
    asisten,
    menu,
    notas: toTextOrNull(payload.notas),
    esPrincipal: true,
    sinDetalle: false,
  }

  return {
    nombre,
    asisten,
    menu,
    notas: main.notas,
    people: [main, ...companions],
    companions,
    declaredCompanions,
    hasCompanionDetail,
  }
}

/** Cuenta estados dentro de un grupo (no incluye al principal si no se pide). */
export function rsvpGroupCounts(group: RsvpGroup, includeMain = true): {
  attending: number
  declined: number
  pending: number
} {
  const people = includeMain ? group.people : group.companions
  let attending = 0
  let declined = 0
  let pending = 0
  for (const person of people) {
    if (person.asisten === true) attending += 1
    else if (person.asisten === false) declined += 1
    else pending += 1
  }
  return { attending, declined, pending }
}

/**
 * Resume las respuestas RSVP. Ahora cada grupo puede tener varios subinvitados,
 * cada uno con su propio estado y menú. Los totales son de personas, no de filas.
 */
export function rsvpSummary(rows: CardSubmissionItem[]): RsvpSummary {
  const summary: RsvpSummary = {
    groups: 0,
    declaredPeople: 0,
    companions: 0,
    attending: 0,
    declined: 0,
    pending: 0,
    menuCounts: {},
  }

  for (const row of rows) {
    if (row.kind !== 'rsvp') continue
    const group = rsvpGroup(row)
    summary.groups += 1
    summary.declaredPeople += group.people.length
    summary.companions += group.declaredCompanions

    for (const person of group.people) {
      if (person.asisten === true) {
        summary.attending += 1
        if (person.menu) {
          summary.menuCounts[person.menu] = (summary.menuCounts[person.menu] ?? 0) + 1
        }
      } else if (person.asisten === false) {
        summary.declined += 1
      } else {
        summary.pending += 1
      }
    }
  }

  return summary
}

/** Campos extra del grupo (canción, mensaje, etc.) listos para mostrar. */
export function rsvpExtras(payload: RsvpPayload): Array<[string, string]> {
  return Object.entries(payload)
    .filter(([key, value]) => {
      if (RSVP_GROUP_KEYS.has(key)) return false
      if (value === null || value === undefined || value === '') return false
      if (Array.isArray(value) || isRecord(value)) return false
      return true
    })
    .map(([key, value]) => [RSVP_PAYLOAD_LABELS[key] ?? key, String(value)])
}
