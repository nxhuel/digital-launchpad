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
  tema: 'canción',
  // Mensaje que se llena dentro del formulario RSVP (se muestra como "Mensaje").
  mensaje: 'mensaje',
  // Dedicatoria / deseo enviado aparte (formulario de deseos).
  dedicatoria: 'dedicatoria',
  deseo: 'deseo',
  deseos: 'deseos',
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
 * Valor crudo de `cantidad`. En el contrato nuevo son acompañantes; las
 * tarjetas viejas de este proyecto lo usaban como total de asistentes.
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

/** ¿La tarjeta usa el contrato nuevo? Aun una lista vacía es explícita. */
function hasCanonicalCompanionList(payload: RsvpPayload): boolean {
  return COMPANION_KEYS.some(key => Array.isArray(payload[key]))
}

/**
 * Las primeras tarjetas no mandaban `acompañantes`: guardaban los nombres y
 * estados dentro de `mensaje` con este formato:
 *   Invitado 1: Ana Pérez — No asiste
 *   Invitado 2: Luis Pérez — Sí, asiste
 * Al abrir una respuesta vieja, reconstruimos esas personas para que el
 * resumen y el detalle no dependan de texto libre.
 */
const LEGACY_COMPANION_LINE =
  /^\s*Invitado\s+\d+\s*:\s*(.*)\s*[—–-]\s*(S[ií],?\s*asiste|No\s+asiste)\s*$/i

function legacyCompanionsFromMessage(value: unknown): RsvpPerson[] {
  const message = toTextOrNull(value)
  if (!message) return []

  const companions: RsvpPerson[] = []
  for (const line of normalizeMultiline(message).split('\n')) {
    const match = line.match(LEGACY_COMPANION_LINE)
    if (!match) continue
    const nombre = match[1].trim() || `Acompañante ${companions.length + 1}`
    const asisten = /^s[ií],?\s*asiste$/i.test(match[2].trim())
    companions.push({
      nombre,
      asisten,
      menu: null,
      notas: null,
      esPrincipal: false,
      sinDetalle: false,
    })
    if (companions.length >= 20) break
  }
  return companions
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
 * acompañantes. Si la tarjeta vieja guardó el detalle en `mensaje`, se
 * reconstruye; si solo mandó `cantidad`, se crean acompañantes sintéticos
 * (descontando al principal) para no inflar el conteo de asistentes.
 */
export function rsvpGroup(row: CardSubmissionItem): RsvpGroup {
  const payload: RsvpPayload = isRecord(row.payload) ? row.payload : {}
  const nombre = toTextOrNull(payload.nombre) ?? 'Sin nombre'
  const asisten = toBoolOrNull(payload.asisten)
  const menu = toTextOrNull(payload.menu)
  const canonicalList = hasCanonicalCompanionList(payload)
  const raw = rawCompanions(payload)
  const detailedCompanions = raw.map((item, index) => companionFromRaw(item, index))
  const companions = canonicalList
    ? detailedCompanions
    : legacyCompanionsFromMessage(payload.mensaje)
  const hasCompanionDetail = companions.length > 0

  // Las tarjetas nuevas mandan `acompañantes` (aunque sea []): esa lista es la
  // fuente de verdad y `cantidad` no agrega personas fantasma.
  // Las tarjetas viejas de este proyecto mandaban `cantidad` como TOTAL de
  // personas que asisten (principal incluido) y el detalle en `mensaje`. Si no
  // pudimos reconstruir ese detalle, descontamos al principal para no inflar
  // el resumen. El contrato nuevo sigue siendo `cantidad = acompañantes`.
  const legacyTotal = companionCount(payload)
  const syntheticCount =
    !canonicalList && !hasCompanionDetail && asisten === true
      ? Math.min(20, Math.max(0, legacyTotal - 1))
      : 0
  const declaredCompanions = companions.length + syntheticCount

  // Solo los casos viejos sin detalle quedan como sintéticos; heredan el
  // estado del principal porque la tarjeta vieja solo contaba asistentes.
  for (let i = 0; i < syntheticCount; i++) {
    companions.push({
      nombre: `Acompañante ${companions.length + 1}`,
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

/**
 * Texto libre que la tarjeta manda en un formulario aparte del RSVP
 * (las secciones "deseos"/"canciones" del HTML). Llega como kind="mensaje" o
 * kind="cancion" y muchas veces sin nombre, así que hay que asociarlo a la
 * confirmación del invitado por fecha/hora.
 */
export interface LooseText {
  id: number
  kind: 'mensaje' | 'cancion'
  texto: string
  created_at: string
}

export interface LooseTextMatch {
  /** Textos asociados a una confirmación, por id de la fila RSVP. */
  byRsvpId: Map<number, LooseText[]>
  /** Textos que no pudieron asociarse a ninguna confirmación. */
  orphans: LooseText[]
}

/** Ventana para considerar dos envíos como parte de la misma visita a la tarjeta. */
const SAME_SESSION_MS = 60 * 60 * 1000

/** ¿El texto es solo el detalle de acompañantes que guardaban las tarjetas viejas? */
function isLegacyCompanionList(text: string): boolean {
  const lines = normalizeMultiline(text)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
  return lines.length > 0 && lines.every(line => LEGACY_COMPANION_LINE.test(line))
}

function nameKey(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/** Nombres con los que las tarjetas mandan la dedicatoria o la canción. */
const LOOSE_TEXT_KEYS: Record<'mensaje' | 'cancion', string[]> = {
  mensaje: ['mensaje', 'dedicatoria', 'deseo', 'deseos', 'texto'],
  cancion: ['cancion', 'canción', 'tema', 'musica', 'música'],
}

function looseText(payload: RsvpPayload, kind: 'mensaje' | 'cancion'): string | null {
  for (const key of LOOSE_TEXT_KEYS[kind]) {
    const text = toTextOrNull(payload[key])
    if (text) return text
  }
  return null
}

function timestamp(value: string): number {
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : Number.NaN
}

/**
 * Asocia los textos sueltos a la confirmación más cercana en el tiempo.
 * Prioridad: mismo nombre (si la tarjeta lo manda) y, si no, el envío más
 * próximo dentro de la misma visita. Lo que queda lejos no se adivina: vuelve
 * en `orphans` para mostrarlo aparte y no perder la dedicatoria.
 */
export function matchLooseTexts(
  rsvpRows: CardSubmissionItem[],
  looseRows: CardSubmissionItem[],
): LooseTextMatch {
  const byRsvpId = new Map<number, LooseText[]>()
  const orphans: LooseText[] = []

  const candidates = rsvpRows.map(row => {
    const payload: RsvpPayload = isRecord(row.payload) ? row.payload : {}
    return {
      id: row.id,
      key: nameKey(payload.nombre),
      time: timestamp(row.created_at),
    }
  })

  const nearest = (pool: typeof candidates, time: number): { id: number; delta: number } | null => {
    if (!Number.isFinite(time)) return null
    let best: { id: number; delta: number } | null = null
    for (const candidate of pool) {
      if (!Number.isFinite(candidate.time)) continue
      const delta = Math.abs(candidate.time - time)
      if (!best || delta < best.delta) best = { id: candidate.id, delta }
    }
    return best
  }

  for (const row of looseRows) {
    if (row.kind !== 'mensaje' && row.kind !== 'cancion') continue
    const payload: RsvpPayload = isRecord(row.payload) ? row.payload : {}
    const texto = looseText(payload, row.kind)
    if (!texto) continue
    // Las tarjetas viejas escribían la lista de acompañantes en `mensaje`:
    // eso no es una dedicatoria ni un deseo.
    if (row.kind === 'mensaje' && isLegacyCompanionList(texto)) continue
    // El mensaje que viene dentro del formulario RSVP (el campo `mensaje` del
    // bibitorio) no lo consideramos dedicatoria: ese es el Mensaje del panel.
    if (row.kind === 'mensaje' && row.payload.nombre) continue

    const time = timestamp(row.created_at)
    const key = nameKey(payload.nombre)
    const sameName = key ? candidates.filter(candidate => candidate.key === key) : []
    let target: number | null = null
    if (sameName.length > 0) {
      // Si la tarjeta manda el nombre, ese dato manda: la fila del invitado es
      // la del mismo nombre (la más cercana si repitió la confirmación).
      target = nearest(sameName, time)?.id ?? sameName[0].id
    } else {
      const close = nearest(candidates, time)
      target = close && close.delta <= SAME_SESSION_MS ? close.id : null
    }

    const entry: LooseText = {
      id: row.id,
      kind: row.kind,
      texto,
      created_at: row.created_at,
    }

    if (target === null) {
      orphans.push(entry)
    } else {
      byRsvpId.set(target, [...(byRsvpId.get(target) ?? []), entry])
    }
  }

  for (const entries of byRsvpId.values()) {
    entries.sort((a, b) => a.created_at.localeCompare(b.created_at))
  }

  return { byRsvpId, orphans }
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
