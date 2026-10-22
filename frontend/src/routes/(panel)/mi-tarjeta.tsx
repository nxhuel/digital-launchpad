import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { apiFetch, downloadCsv } from '../../lib/api'
import type { CardSubmissionItem, DeployedCardItem, User } from '../../types'
import { enabledFeatures, type CardFeatureKey } from '../../lib/cardFeatures'
import { toast } from 'sonner'
import {
  Users,
  Images,
  UtensilsCrossed,
  Music,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  Download,
  Pencil,
  X,
  Loader2,
  Lock,
  PartyPopper,
} from 'lucide-react'

export const Route = createFileRoute('/(panel)/mi-tarjeta')({
  component: MiTarjetaPage,
})

type Tab = CardFeatureKey

function fmtDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

/* Claves internas de las fotos (Cloudinary) que nunca se muestran al cliente */
const TECHNICAL_KEYS = ['nombre', 'asisten', 'url', 'thumb_url', 'public_id', 'formato']

/* Lista para las respuestas de texto libre (canciones y mensajes). */
function TextResponseList({
  rows,
  loading,
  icon: Icon,
  emptyText,
  detailKey,
  onDownload,
}: {
  rows: CardSubmissionItem[]
  loading: boolean
  icon: typeof Users
  emptyText: string
  detailKey: 'cancion' | 'mensaje'
  onDownload: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">
          {rows.length} {rows.length === 1 ? 'respuesta' : 'respuestas'}
        </span>
        <button onClick={onDownload} className="btn-outline text-xs !py-2 ml-auto">
          <Download className="w-3.5 h-3.5" /> Excel
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-slate-400 text-sm">Cargando...</p>
      ) : rows.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
          <Icon className="w-7 h-7 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">{emptyText}</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {rows.map(r => {
            const detail = r.payload[detailKey]
            return (
              <li key={r.id} className="flex items-start gap-3 px-4 py-3">
                <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-[11px] font-bold flex items-center justify-center shrink-0 uppercase">
                  {String(r.payload.nombre || '?').slice(0, 2)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {String(r.payload.nombre || 'Sin nombre')}
                  </p>
                  {String(detail ?? '').trim() !== '' && (
                    <p className="text-sm text-slate-600 break-words mt-0.5">{String(detail)}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">{fmtDateTime(r.created_at)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   TARJETA INDIVIDUAL · card larga con pestañas
═══════════════════════════════════════════ */
function TarjetaCard({ card }: { card: DeployedCardItem }) {
  // El admin elige al subir el ZIP qué secciones tiene la tarjeta: acá solo
  // mostramos las habilitadas.
  const featureKeys = enabledFeatures(card.features)
  const [tab, setTab] = useState<Tab>(featureKeys[0] ?? 'rsvp')
  const [copied, setCopied] = useState(false)

  // Invitados (solo confirmaciones)
  const [rows, setRows] = useState<CardSubmissionItem[]>([])
  const [loadingRows, setLoadingRows] = useState(false)
  const [loadedTabs, setLoadedTabs] = useState<Set<Tab>>(new Set())

  // Álbum
  const [fotos, setFotos] = useState<CardSubmissionItem[]>([])
  const [loadingFotos, setLoadingFotos] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  // Menú
  const [editingMenu, setEditingMenu] = useState(false)
  const [menuText, setMenuText] = useState((card.menu_options || []).join('\n'))
  const [savingMenu, setSavingMenu] = useState(false)
  const [menuOptions, setMenuOptions] = useState<string[]>(card.menu_options || [])

  // Canciones y mensajes (respuestas de texto libre)
  const [songRows, setSongRows] = useState<CardSubmissionItem[]>([])
  const [messageRows, setMessageRows] = useState<CardSubmissionItem[]>([])
  const [loadingSongs, setLoadingSongs] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${card.url}` : card.url

  const loadRows = async () => {
    setLoadingRows(true)
    try {
      const data = await apiFetch<CardSubmissionItem[]>(
        `/my-cards/${card.id}/respuestas?kind=rsvp`
      )
      setRows(data.filter(r => r.kind === 'rsvp'))
    } catch {
      toast.error('No se pudieron cargar los invitados')
    } finally {
      setLoadingRows(false)
    }
  }

  const loadFotos = async () => {
    setLoadingFotos(true)
    try {
      const data = await apiFetch<CardSubmissionItem[]>(`/my-cards/${card.id}/respuestas?kind=foto`)
      setFotos(data)
    } catch {
      toast.error('No se pudieron cargar las fotos')
    } finally {
      setLoadingFotos(false)
    }
  }

  const loadText = async (kind: 'cancion' | 'mensaje') => {
    const isSong = kind === 'cancion'
    const setLoading = isSong ? setLoadingSongs : setLoadingMessages
    const setRows = isSong ? setSongRows : setMessageRows
    setLoading(true)
    try {
      const data = await apiFetch<CardSubmissionItem[]>(
        `/my-cards/${card.id}/respuestas?kind=${kind}`
      )
      setRows(data)
    } catch {
      toast.error(isSong ? 'No se pudieron cargar las canciones' : 'No se pudieron cargar los mensajes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'rsvp' && !loadedTabs.has('rsvp')) {
      loadRows()
      setLoadedTabs(prev => new Set(prev).add('rsvp'))
    }
    if (tab === 'album' && !loadedTabs.has('album')) {
      loadFotos()
      setLoadedTabs(prev => new Set(prev).add('album'))
    }
    if (tab === 'canciones' && !loadedTabs.has('canciones')) {
      loadText('cancion')
      setLoadedTabs(prev => new Set(prev).add('canciones'))
    }
    if (tab === 'mensajes' && !loadedTabs.has('mensajes')) {
      loadText('mensaje')
      setLoadedTabs(prev => new Set(prev).add('mensajes'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const asisten = useMemo(() => rows.filter(r => r.payload.asisten === true).length, [rows])
  const noAsisten = useMemo(() => rows.filter(r => r.payload.asisten === false).length, [rows])

  const copy = async () => {
    await copyText(fullUrl)
    setCopied(true)
    toast.success('Enlace copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  const download = async () => {
    try {
      await downloadCsv(
        `/my-cards/${card.id}/respuestas.csv`,
        `invitados-${card.slug}.csv`
      )
    } catch {
      toast.error('No se pudo descargar el Excel')
    }
  }

  const downloadFotos = async () => {
    try {
      await downloadCsv(`/my-cards/${card.id}/fotos.zip`, `fotos-${card.slug}.zip`)
    } catch {
      toast.error('No se pudieron descargar las fotos')
    }
  }

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const downloadSelected = async () => {
    if (selected.size === 0) return
    try {
      await downloadCsv(
        `/my-cards/${card.id}/fotos.zip?ids=${[...selected].join(',')}`,
        selected.size === 1 ? `foto-${card.slug}.zip` : `fotos-seleccion-${card.slug}.zip`
      )
      toast.success(selected.size === 1 ? 'Foto descargada' : `${selected.size} fotos descargadas`)
    } catch {
      toast.error('No se pudo descargar la selección')
    }
  }

  const saveMenu = async () => {
    setSavingMenu(true)
    try {
      const updated = await apiFetch<DeployedCardItem>(`/my-cards/${card.id}/config`, {
        method: 'PATCH',
        body: JSON.stringify({
          menu_options: menuText.split('\n').map(s => s.trim()).filter(Boolean),
        }),
      })
      setMenuOptions(updated.menu_options)
      setEditingMenu(false)
      toast.success('Menú actualizado: ya se ve en tu tarjeta')
    } catch {
      toast.error('No se pudo guardar el menú')
    } finally {
      setSavingMenu(false)
    }
  }

  const downloadKind = async (kind: 'cancion' | 'mensaje') => {
    try {
      await downloadCsv(
        `/my-cards/${card.id}/respuestas.csv?kind=${kind}`,
        `${kind === 'cancion' ? 'canciones' : 'mensajes'}-${card.slug}.csv`
      )
    } catch {
      toast.error('No se pudo descargar el Excel')
    }
  }

  const allTabs: { id: Tab; label: string; icon: typeof Users; count?: number }[] = [
    { id: 'rsvp', label: 'Invitados', icon: Users, count: loadedTabs.has('rsvp') ? rows.length : undefined },
    { id: 'menu', label: 'Menú', icon: UtensilsCrossed, count: menuOptions.length || undefined },
    { id: 'canciones', label: 'Canciones', icon: Music, count: loadedTabs.has('canciones') ? songRows.length : undefined },
    { id: 'mensajes', label: 'Mensajes', icon: MessageCircle, count: loadedTabs.has('mensajes') ? messageRows.length : undefined },
    { id: 'album', label: 'Álbum', icon: Images, count: undefined },
  ]
  const tabs = allTabs.filter(t => featureKeys.includes(t.id))

  return (
    <article className="panel-card !p-0 overflow-hidden">
      {/* Encabezado */}
      <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg leading-tight">{card.title}</h3>
              {card.submissions_open ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                  Confirmaciones abiertas
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                  <Lock className="w-3 h-3" /> Confirmaciones cerradas
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate font-mono">{fullUrl}</p>
            <p className="text-xs text-slate-500 mt-1">
              {card.responses_count} {card.responses_count === 1 ? 'respuesta registrada' : 'respuestas registradas'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !py-2"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Ver tarjeta
            </a>
            <button onClick={copy} className="btn-outline !py-2" title="Copiar enlace">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Pestañas (solo las secciones habilitadas) */}
        {tabs.length > 0 && (
        <div className="flex gap-1 mt-4 bg-slate-100/80 rounded-xl p-1 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[7.5rem] whitespace-nowrap flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count != null && t.count > 0 && (
                <span className={`text-[11px] font-bold rounded-full px-1.5 py-0.5 min-w-5 text-center ${
                  tab === t.id ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
        )}
      </div>

      <div className="px-5 sm:px-6 py-5">
        {tabs.length === 0 && (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
            <Lock className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">
              Esta tarjeta no tiene secciones para gestionar. Si necesitás confirmaciones,
              canciones, mensajes, álbum o menú, pedile al administrador que las active.
            </p>
          </div>
        )}

        {/* ── INVITADOS ── */}
        {tab === 'rsvp' && featureKeys.includes('rsvp') && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {asisten} asisten
                </span>
                {noAsisten > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                    {noAsisten} no asisten
                  </span>
                )}
              </div>
              <button onClick={download} className="btn-outline text-xs !py-2 ml-auto">
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
            </div>

            {loadingRows ? (
              <p className="text-center py-8 text-slate-400 text-sm">Cargando invitados...</p>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                <Users className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Todavía no hay confirmaciones. Compartí el enlace de tu tarjeta.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-2.5 font-semibold">Invitado</th>
                      <th className="px-4 py-2.5 font-semibold">Estado</th>
                      <th className="px-4 py-2.5 font-semibold">Detalles</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map(r => {
                      const extras = Object.entries(r.payload).filter(
                        ([k, v]) => !TECHNICAL_KEYS.includes(k) && String(v ?? '').trim() !== ''
                      )
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/60 align-top">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-[11px] font-bold flex items-center justify-center shrink-0 uppercase">
                                {String(r.payload.nombre || '?').slice(0, 2)}
                              </span>
                              <span className="font-semibold text-slate-900">
                                {String(r.payload.nombre || 'Sin nombre')}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {r.payload.asisten === true && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-px">Asiste</span>
                            )}
                            {r.payload.asisten === false && (
                              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-px">No asiste</span>
                            )}
                            {r.payload.asisten !== true && r.payload.asisten !== false && (
                              <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-2 py-px">Sin respuesta</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {extras.length === 0 ? (
                              <span className="text-slate-300">—</span>
                            ) : (
                              <dl className="space-y-1">
                                {extras.map(([k, v]) => (
                                  <div key={k} className="flex gap-1.5 text-xs">
                                    <dt className="text-slate-400 capitalize shrink-0">{k}:</dt>
                                    <dd className="text-slate-700 font-medium break-words">{String(v)}</dd>
                                  </div>
                                ))}
                              </dl>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap text-[11px] text-slate-400">
                            {fmtDateTime(r.created_at)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ÁLBUM ── */}
        {tab === 'album' && featureKeys.includes('album') && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-700">
                Fotos que subieron tus invitados
                <span className="block text-xs font-normal text-slate-400">Tildá las que quieras descargar, o bajalas todas juntas.</span>
              </p>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={downloadSelected}
                  disabled={selected.size === 0}
                  className="btn-primary !py-2 text-xs disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar selección{selected.size > 0 ? ` (${selected.size})` : ''}
                </button>
                <button onClick={downloadFotos} className="btn-outline text-xs !py-2">
                  <Download className="w-3.5 h-3.5" /> Descargar todas (.zip)
                </button>
              </div>
            </div>
            {!loadingFotos && fotos.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <button
                  onClick={() => setSelected(selected.size === fotos.length ? new Set() : new Set(fotos.map(f => f.id)))}
                  className="text-xs font-semibold text-violet-700 underline underline-offset-2 hover:text-violet-900"
                >
                  {selected.size === fotos.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </button>
                <span className="text-xs text-slate-400">
                  {selected.size === 0
                    ? 'Sin selección'
                    : `${selected.size} de ${fotos.length} seleccionada${selected.size === 1 ? '' : 's'}`}
                </span>
              </div>
            )}
            {loadingFotos ? (
              <p className="text-center py-8 text-slate-400 text-sm">Cargando fotos...</p>
            ) : fotos.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                <Images className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Todavía no subieron fotos.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {fotos.map(f => {
                    const isSel = selected.has(f.id)
                    return (
                      <div
                        key={f.id}
                        className={`relative rounded-xl transition-shadow ${isSel ? 'ring-2 ring-violet-600 ring-offset-2' : ''}`}
                      >
                        <a
                          href={String(f.payload.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={String(f.payload.nombre || '')}
                          className="group block"
                        >
                          <img
                            src={String(f.payload.thumb_url || f.payload.url)}
                            alt={String(f.payload.nombre || 'Foto de invitado')}
                            className="w-full aspect-square rounded-xl object-cover bg-slate-100 group-hover:opacity-90 transition-opacity"
                            loading="lazy"
                          />
                        </a>
                        <button
                          type="button"
                          onClick={() => toggleSelect(f.id)}
                          aria-pressed={isSel}
                          title={isSel ? 'Quitar de la selección' : 'Agregar a la selección'}
                          className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSel
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'bg-black/45 border-white/90 text-transparent hover:bg-black/65'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── MENÚ ── */}
        {tab === 'menu' && featureKeys.includes('menu') && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-700">
                Opciones del menú
                <span className="block text-xs font-normal text-slate-400">Se muestran en tu tarjeta automáticamente al guardar.</span>
              </p>
              <button
                onClick={() => setEditingMenu(v => !v)}
                className="btn-outline text-xs !py-2 ml-auto"
              >
                {editingMenu ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                {editingMenu ? 'Cerrar edición' : 'Editar menú'}
              </button>
            </div>

            {!editingMenu ? (
              menuOptions.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                  <UtensilsCrossed className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Sin opciones cargadas. Agregalas con Editar menú.</p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {menuOptions.map((m, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                      <span className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{m}</span>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <div>
                <textarea
                  value={menuText}
                  onChange={e => setMenuText(e.target.value)}
                  className="panel-input"
                  rows={4}
                  placeholder={'Normal\nVeggie\nCelíaco'}
                />
                <p className="text-xs text-slate-400 mt-1.5">Una opción por línea.</p>
                <button
                  onClick={saveMenu}
                  disabled={savingMenu}
                  className="btn-primary rounded-lg px-5 !py-2 text-sm mt-3 disabled:opacity-50"
                >
                  {savingMenu ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...</>
                  ) : (
                    <><Check className="w-3.5 h-3.5" /> Guardar menú</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CANCIONES ── */}
        {tab === 'canciones' && featureKeys.includes('canciones') && (
          <TextResponseList
            rows={songRows}
            loading={loadingSongs}
            icon={Music}
            emptyText="Todavía no pidieron canciones desde la tarjeta."
            detailKey="cancion"
            onDownload={() => downloadKind('cancion')}
          />
        )}

        {/* ── MENSAJES ── */}
        {tab === 'mensajes' && featureKeys.includes('mensajes') && (
          <TextResponseList
            rows={messageRows}
            loading={loadingMessages}
            icon={MessageCircle}
            emptyText="Todavía no dejaron mensajes desde la tarjeta."
            detailKey="mensaje"
            onDownload={() => downloadKind('mensaje')}
          />
        )}
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════
   PÁGINA
═══════════════════════════════════════════ */
function MiTarjetaPage() {
  const [user, setUser] = useState<User | null>(null)
  const [cards, setCards] = useState<DeployedCardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    apiFetch<User>('/auth/me')
      .then(u => {
        setUser(u)
        if (u.role !== 'client') {
          setLoading(false)
          return
        }
        return apiFetch<DeployedCardItem[]>('/my-cards').then(setCards).catch(() => {
          toast.error('No se pudo cargar tu tarjeta')
        }).finally(() => setLoading(false))
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !user) return <div className="text-center py-16 text-slate-400">Cargando...</div>

  if (user.role !== 'client') {
    return <div className="max-w-3xl mx-auto panel-card text-center py-12 text-slate-400">Sin acceso</div>
  }

  // Con más de 2 tarjetas se muestran como pestañas y la seleccionada
  // ocupa todo el ancho arriba de la página.
  const useTabs = cards.length > 2
  const selected = useTabs
    ? (cards.find(c => c.id === selectedId) ?? cards[0])
    : null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">{cards.length > 1 ? 'Tus tarjetas digitales' : 'Tu invitación en vivo'}</h1>
        <p className="page-subtitle">Seguí las respuestas de tus invitados y gestioná tu tarjeta sin pedir ayuda.</p>
      </div>

      {cards.length === 0 ? (
        <div className="panel-card text-center py-14">
          <span className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="w-7 h-7" />
          </span>
          <p className="font-bold text-slate-900 text-lg">Todavía no tenés una tarjeta asignada</p>
          <p className="text-slate-400 text-sm mt-1 mb-2">Cuando tu invitación esté publicada, la vas a gestionar desde acá.</p>
        </div>
      ) : useTabs && selected ? (
        <div className="space-y-5">
          <div className="flex gap-1 bg-slate-100/80 rounded-xl p-1 overflow-x-auto">
            {cards.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  selected.id === c.id ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="truncate max-w-44">{c.title}</span>
                {c.responses_count > 0 && (
                  <span className={`text-[11px] font-bold rounded-full px-1.5 py-0.5 min-w-5 text-center ${
                    selected.id === c.id ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {c.responses_count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <TarjetaCard key={selected.id} card={selected} />
        </div>
      ) : (
        <div className="space-y-5">
          {cards.map(c => (
            <TarjetaCard key={c.id} card={c} />
          ))}
        </div>
      )}
    </div>
  )
}
