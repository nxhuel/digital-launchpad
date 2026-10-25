import { normalizeMultiline, type RsvpGroup, type RsvpPerson } from '../../lib/rsvp'

const STATUS_STYLES = {
  true: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  false: 'text-slate-500 bg-slate-100 border-slate-200',
  null: 'text-amber-700 bg-amber-50 border-amber-100',
}

export function RsvpStatusBadge({
  asisten,
  tiny = false,
}: {
  asisten: boolean | null
  tiny?: boolean
}) {
  const label = asisten === true ? 'Asiste' : asisten === false ? 'No asiste' : 'Sin responder'
  const key = asisten === true ? 'true' : asisten === false ? 'false' : 'null'
  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold whitespace-nowrap ${
        tiny ? 'px-1.5 py-px text-[10px]' : 'px-2 py-px text-[11px]'
      } ${STATUS_STYLES[key]}`}
    >
      {label}
    </span>
  )
}

export function RsvpPersonRow({
  person,
  showPrincipalChip = true,
}: {
  person: RsvpPerson
  showPrincipalChip?: boolean
}) {
  return (
    <li className="text-xs">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={`text-slate-800 ${person.esPrincipal ? 'font-semibold' : 'font-medium'}`}>
          {person.nombre}
        </span>
        {showPrincipalChip && person.esPrincipal && (
          <span className="text-[10px] uppercase tracking-wider font-bold text-violet-600 bg-violet-50 rounded px-1.5 py-0.5">
            Principal
          </span>
        )}
        <RsvpStatusBadge asisten={person.asisten} tiny />
        {person.menu && (
          <span className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-2 py-px">
            Menú: {person.menu}
          </span>
        )}
      </div>
      {person.notas && (
        <p className="text-[11px] text-slate-500 whitespace-pre-line mt-1 leading-relaxed">
          {normalizeMultiline(person.notas)}
        </p>
      )}
    </li>
  )
}

/**
 * Lista de personas de un grupo. Los acompañantes viejos informados solo con
 * `cantidad` se agrupan en una línea para no repetir "Acompañante 1/2/3".
 */
export function RsvpPeopleList({
  group,
  includeMain = true,
  className = '',
  showLegacyNote = true,
}: {
  group: RsvpGroup
  includeMain?: boolean
  className?: string
  /** En el panel del cliente ocultamos el aviso de acompañantes sin detalle. */
  showLegacyNote?: boolean
}) {
  const people = includeMain ? group.people : group.companions
  const realPeople = people.filter(person => !person.sinDetalle)
  const syntheticCount = people.length - realPeople.length

  if (people.length === 0) {
    return <p className="text-xs text-slate-400">Sin acompañantes declarados.</p>
  }

  if (realPeople.length === 0 && !showLegacyNote) return null

  return (
    <ul className={`space-y-2 ${className}`}>
      {realPeople.map((person, index) => (
        <RsvpPersonRow key={`${person.nombre}-${index}`} person={person} />
      ))}
      {syntheticCount > 0 && showLegacyNote && (
        <li className="text-[11px] text-slate-400">
          {syntheticCount} {syntheticCount === 1 ? 'acompañante' : 'acompañantes'} sin detalle
          individual (heredan el estado del principal).
        </li>
      )}
    </ul>
  )
}

export function RsvpMenuSummary({
  counts,
  className = '',
}: {
  counts: Record<string, number>
  className?: string
}) {
  const entries = Object.entries(counts)
  if (entries.length === 0) return null
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
        Menú confirmado
      </span>
      {entries.map(([menu, count]) => (
        <span
          key={menu}
          className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 text-[11px] font-semibold"
        >
          {menu}: {count}
        </span>
      ))}
    </div>
  )
}
