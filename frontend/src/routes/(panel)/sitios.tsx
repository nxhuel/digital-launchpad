import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { apiFetch, apiUploadForm, downloadCsv } from '../../lib/api'
import type { CardSubmissionItem, ClientUserItem, DeployedCardItem, User } from '../../types'
import { CARD_FEATURES, enabledFeatures, type CardFeatureKey } from '../../lib/cardFeatures'
import { rsvpExtras, rsvpGroup, rsvpGroupCounts, rsvpSummary } from '../../lib/rsvp'
import { RsvpMenuSummary, RsvpPeopleList, RsvpStatusBadge } from '../../components/panel/RsvpPeople'
import { toast } from 'sonner'
import {
  Pencil,
  Trash2,
  X,
  Loader2,
  ExternalLink,
  Upload,
  Check,
  Globe,
  RefreshCw,
  MessageSquare,
  Settings,
  Download,
  Lock,
  Users,
  FolderUp,
} from 'lucide-react'

export const Route = createFileRoute('/(panel)/sitios')({
  component: SitiosPage,
})

/* ─── Helpers ─── */

function formatBytes(n: number): string {
  if (!n) return '0 KB'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function slugifyClient(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\.zip$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

const SLUG_RE = /^[a-z0-9-]{1,100}$/
const MAX_ZIP_BYTES = 50 * 1024 * 1024

interface FeatureDetection {
  features: string[]
  sources: Record<string, string[]>
}

/* ═══════════════════════════════════════════
   CHECKLIST DE SECCIONES
═══════════════════════════════════════════ */
function FeatureChecklist({
  features,
  onToggle,
  detecting,
  detected,
  detectError,
  hasFile,
  isRedeploy,
}: {
  features: CardFeatureKey[]
  onToggle: (key: CardFeatureKey) => void
  detecting: boolean
  detected: FeatureDetection | null
  detectError: string | null
  hasFile: boolean
  isRedeploy: boolean
}) {
  const detectedLabels = detected
    ? enabledFeatures(detected.features).map(
        key => CARD_FEATURES.find(f => f.key === key)?.label ?? key
      )
    : []

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Secciones que ve el cliente
      </label>
      <div className="space-y-2">
        {CARD_FEATURES.map(f => {
          const checked = features.includes(f.key)
          return (
            <label
              key={f.key}
              className={`flex items-start gap-3 rounded-xl border px-3.5 py-2.5 cursor-pointer transition-colors ${
                checked
                  ? 'border-violet-300 bg-violet-50/60'
                  : 'border-slate-200 hover:bg-slate-50'
              } ${detecting ? 'opacity-70' : ''}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(f.key)}
                disabled={detecting}
                className="mt-0.5 w-4 h-4 accent-violet-600 shrink-0"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-800">{f.label}</span>
                <span className="block text-xs text-slate-400">{f.description}</span>
              </span>
            </label>
          )
        })}
      </div>

      <div className="mt-2 min-h-5 text-xs">
        {detecting ? (
          <span className="inline-flex items-center gap-1.5 text-violet-600 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Detectando secciones del ZIP...
          </span>
        ) : detected ? (
          detectedLabels.length > 0 ? (
            <span className="text-emerald-600 font-medium">
              Detectadas automáticamente: {detectedLabels.join(' · ')}. Podés ajustar el checklist.
            </span>
          ) : (
            <span className="text-slate-400">
              {isRedeploy
                ? 'No detectamos secciones dinámicas; se mantienen las actuales.'
                : 'No detectamos secciones dinámicas; podés tildarlas manualmente.'}
            </span>
          )
        ) : detectError ? (
          <span className="text-amber-600">
            No pudimos detectar automáticamente. Tildá las secciones manualmente.
          </span>
        ) : (
          <span className="text-slate-400">
            {hasFile
              ? 'Detectando secciones...'
              : isRedeploy
                ? 'Se mantienen las secciones actuales. Al elegir un ZIP nuevo se detectan automáticamente.'
                : 'Se detectan automáticamente al elegir el ZIP.'}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-1.5">
        Tildá solo lo que implementaste en el ZIP: el cliente únicamente va a ver esas secciones en
        su panel. Podés cambiarlo después desde “Dueño y ajustes”.
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════
   PÁGINA
═══════════════════════════════════════════ */
function SitiosPage() {
  const [user, setUser] = useState<User | null>(null)
  const [deployed, setDeployed] = useState<DeployedCardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [zipModal, setZipModal] = useState<{ redeploy: DeployedCardItem | null } | null>(null)
  const [editDeployed, setEditDeployed] = useState<DeployedCardItem | null>(null)
  const [respModal, setRespModal] = useState<DeployedCardItem | null>(null)
  const [ajustesModal, setAjustesModal] = useState<DeployedCardItem | null>(null)
  const [clients, setClients] = useState<ClientUserItem[]>([])

  const loadDeployed = async () => {
    const items = await apiFetch<DeployedCardItem[]>('/admin/deployed-cards')
    setDeployed(items)
  }

  useEffect(() => {
    apiFetch<User>('/auth/me').then(u => {
      setUser(u)
      loadDeployed()
        .catch(() => toast.error('No se pudieron cargar las tarjetas desplegadas'))
        .finally(() => setLoading(false))
      apiFetch<ClientUserItem[]>('/users').then(setClients).catch(() => {})
    })
  }, [])

  const removeDeployed = async (d: DeployedCardItem) => {
    if (!confirm(`¿Eliminar "${d.title}"? La URL pública deja de funcionar y se libera espacio en el servidor.`)) return
    await apiFetch(`/admin/deployed-cards/${d.id}`, { method: 'DELETE' })
    toast.success('Tarjeta eliminada y espacio liberado')
    loadDeployed().catch(() => {})
  }

  if (user && user.role !== 'admin') {
    return <div className="max-w-3xl mx-auto panel-card text-center py-12 text-slate-400">Sin acceso</div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Tarjetas desplegadas</h1>
          <p className="page-subtitle">
            Invitaciones publicadas y listas para compartir. Cuando un evento termina, eliminá su tarjeta para liberar espacio.
          </p>
        </div>
        <button onClick={() => setZipModal({ redeploy: null })} className="btn-primary shrink-0">
          <Upload className="w-4 h-4" /> Subir ZIP
        </button>
      </div>

      {/* Listado */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando...</div>
      ) : deployed.length === 0 ? (
        <div className="panel-card text-center py-14">
          <span className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center mx-auto mb-4">
            <FolderUp className="w-7 h-7" />
          </span>
          <p className="font-bold text-slate-900 text-lg">Todavía no hay tarjetas publicadas</p>
          <p className="text-slate-400 text-sm mt-1 mb-5">Subí el ZIP de la invitación y queda visible en su enlace público.</p>
          <button onClick={() => setZipModal({ redeploy: null })} className="btn-primary mx-auto">
            <Upload className="w-4 h-4" /> Subir el primero
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {deployed.map(d => (
            <SiteCard
              key={d.id}
              item={d}
              onRedeploy={() => setZipModal({ redeploy: d })}
              onEdit={() => setEditDeployed(d)}
              onDelete={() => removeDeployed(d)}
              onResponses={() => setRespModal(d)}
              onAjustes={() => setAjustesModal(d)}
            />
          ))}
        </div>
      )}

      {zipModal && (
        <DeployZipModal
          redeploy={zipModal.redeploy}
          onClose={() => setZipModal(null)}
          onDone={() => { setZipModal(null); loadDeployed().catch(() => {}) }}
        />
      )}

      {editDeployed && (
        <EditDeployedModal
          item={editDeployed}
          onClose={() => setEditDeployed(null)}
          onDone={() => { setEditDeployed(null); loadDeployed().catch(() => {}) }}
        />
      )}

      {respModal && (
        <RespuestasModal
          item={respModal}
          base="/admin/deployed-cards"
          onClose={() => { setRespModal(null); loadDeployed().catch(() => {}) }}
        />
      )}

      {ajustesModal && (
        <AjustesModal
          item={ajustesModal}
          clients={clients}
          onClose={() => setAjustesModal(null)}
          onDone={() => { setAjustesModal(null); loadDeployed().catch(() => {}) }}
        />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   CARD LARGA DE SITIO · todo a la vista
═══════════════════════════════════════════ */
function SiteCard({
  item,
  onRedeploy,
  onEdit,
  onDelete,
  onResponses,
  onAjustes,
}: {
  item: DeployedCardItem
  onRedeploy: () => void
  onEdit: () => void
  onDelete: () => void
  onResponses: () => void
  onAjustes: () => void
}) {
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${item.url}` : item.url

  return (
    <article className="panel-card !p-0 overflow-hidden">
      {/* Ficha */}
      <div className="px-5 sm:px-6 pt-5 pb-4">
        <div className="flex flex-wrap items-start gap-4">
          <span className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.title}</h3>
              {!item.submissions_open && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                  <Lock className="w-3 h-3" /> Cerrada
                </span>
              )}
              {item.responses_count > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 text-violet-700">
                  <MessageSquare className="w-3 h-3" /> {item.responses_count} {item.responses_count === 1 ? 'respuesta' : 'respuestas'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate font-mono">{fullUrl}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
              <span>{formatBytes(item.size_bytes)}</span>
              <span className="text-slate-300">·</span>
              <span>Publicado el {new Date(item.created_at).toLocaleDateString('es-AR')}</span>
              <span className="text-slate-300">·</span>
              {item.client_name ? (
                <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                  <Users className="w-3.5 h-3.5" /> {item.client_name}
                </span>
              ) : (
                <span className="text-slate-400">Sin dueño asignado</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {enabledFeatures(item.features).map(key => {
                const feature = CARD_FEATURES.find(f => f.key === key)
                return (
                  <span
                    key={key}
                    className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600"
                  >
                    {feature?.label ?? key}
                  </span>
                )
              })}
              {enabledFeatures(item.features).length === 0 && (
                <span className="text-xs text-slate-400">Sin secciones para el cliente</span>
              )}
            </div>
            {item.menu_options.length > 0 && (
              <p className="text-xs text-slate-400 mt-1.5 truncate">
                Menú: {item.menu_options.join(' · ')}
              </p>
            )}
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !py-2 shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ver tarjeta
          </a>
        </div>
      </div>

      {/* Acciones con etiqueta */}
      <div className="flex flex-wrap gap-2 px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100">
        <button onClick={onResponses} className="btn-outline text-xs !bg-white">
          <MessageSquare className="w-3.5 h-3.5" /> Respuestas
          {item.responses_count > 0 && (
            <span className="ml-1 text-[11px] font-bold rounded-full bg-violet-100 text-violet-700 px-1.5 py-px">
              {item.responses_count}
            </span>
          )}
        </button>
        <button onClick={onAjustes} className="btn-outline text-xs !bg-white" title="Dueño, menú y confirmaciones abiertas o cerradas">
          <Settings className="w-3.5 h-3.5" /> Dueño y ajustes
        </button>
        <button onClick={onRedeploy} className="btn-outline text-xs !bg-white" title="Reemplazar los archivos de la tarjeta">
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar ZIP
        </button>
        <button onClick={onEdit} className="btn-outline text-xs !bg-white" title="Cambiar título o dirección de la tarjeta">
          <Pencil className="w-3.5 h-3.5" /> Editar
        </button>
        <button
          onClick={onDelete}
          className="btn-outline text-xs !bg-white !text-red-600 !border-red-200 hover:!bg-red-50 ml-auto"
          title="Eliminar la tarjeta y liberar espacio"
        >
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </button>
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════
   MODAL · SUBIR / ACTUALIZAR ZIP
═══════════════════════════════════════════ */
function DeployZipModal({
  redeploy,
  onClose,
  onDone,
}: {
  redeploy: DeployedCardItem | null
  onClose: () => void
  onDone: (item: DeployedCardItem) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [slug, setSlug] = useState(redeploy ? redeploy.slug : '')
  const [title, setTitle] = useState(redeploy ? redeploy.title : '')
  const [slugTouched, setSlugTouched] = useState(!!redeploy)
  const [features, setFeatures] = useState<CardFeatureKey[]>(
    redeploy ? enabledFeatures(redeploy.features) : []
  )
  const [detecting, setDetecting] = useState(false)
  const [detected, setDetected] = useState<FeatureDetection | null>(null)
  const [detectError, setDetectError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<DeployedCardItem | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const detectionSeq = useRef(0)

  const toggleFeature = (key: CardFeatureKey) =>
    setFeatures(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )

  const pickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > MAX_ZIP_BYTES) {
      e.target.value = ''
      detectionSeq.current += 1
      setFile(null)
      setDetecting(false)
      setDetected(null)
      setDetectError(null)
      toast.error('El ZIP supera los 50 MB. Optimizá imágenes o videos antes de subirlo.')
      return
    }
    setFile(f)
    setResult(null)
    setDetected(null)
    setDetectError(null)
    if (!redeploy) setFeatures([])
    if (!slugTouched) {
      const suggested = slugifyClient(f.name)
      setSlug(suggested)
      if (!title.trim()) setTitle(suggested)
    }

    // Se detecta antes de publicar para que el checklist ya venga tildado.
    // Si el usuario elige otro archivo, la respuesta vieja se descarta.
    const seq = ++detectionSeq.current
    setDetecting(true)
    try {
      const form = new FormData()
      form.append('file', f)
      const detection = await apiUploadForm<FeatureDetection>(
        '/admin/deployed-cards/detect-features',
        form
      )
      if (seq !== detectionSeq.current) return
      setDetected(detection)
      const next = enabledFeatures(detection.features)
      // En una actualización, si no se detecta nada, conservamos las secciones
      // actuales para no desactivar todo por un falso negativo.
      if (next.length > 0 || !redeploy) setFeatures(next)
    } catch (err) {
      if (seq !== detectionSeq.current) return
      setDetectError(err instanceof Error ? err.message : 'No se pudieron detectar las secciones')
    } finally {
      if (seq === detectionSeq.current) setDetecting(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || saving || detecting) return
    const finalSlug = slug.trim().toLowerCase()
    if (!redeploy && !SLUG_RE.test(finalSlug)) {
      toast.error('Dirección inválida: solo minúsculas, números y guiones')
      return
    }
    setSaving(true)
    try {
      const form = new FormData()
      form.append('file', file)
      // Lista (posiblemente vacía) de secciones tildadas en el checklist.
      // En una actualización reemplaza las secciones guardadas.
      form.append('features', features.join(','))
      if (!redeploy) {
        form.append('slug', finalSlug)
        form.append('title', title.trim() || finalSlug)
      }
      const path = redeploy
        ? `/admin/deployed-cards/${redeploy.id}/redeploy`
        : '/admin/deployed-cards/upload'
      const item = await apiUploadForm<DeployedCardItem>(path, form)
      setResult(item)
      toast.success(redeploy ? 'Tarjeta actualizada' : 'Tarjeta publicada')
      onDone(item)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo subir el ZIP')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-slate-900 text-lg">
            {redeploy ? `Actualizar "${redeploy.title}"` : 'Publicar nueva tarjeta'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Archivo .ZIP</label>
            <div className="flex items-center gap-3">
              <input ref={fileRef} type="file" accept=".zip" className="hidden" onChange={pickFile} />
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline text-xs py-2">
                <Upload className="w-3.5 h-3.5" /> {file ? 'Cambiar archivo' : 'Seleccionar .ZIP'}
              </button>
              {file && <p className="text-xs text-emerald-600 font-medium truncate">Archivo seleccionado: {file.name}</p>}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Debe contener index.html en la raíz. Tamaño máximo: 50 MB.
            </p>
          </div>

          {!redeploy && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Dirección de la tarjeta</label>
                <div className="flex items-center gap-0">
                  <span className="text-xs text-slate-400 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg px-2.5 py-[9px] whitespace-nowrap">
                    /tarjetas-digitales/
                  </span>
                  <input
                    value={slug}
                    onChange={e => { setSlug(e.target.value.toLowerCase()); setSlugTouched(true) }}
                    className="panel-input rounded-l-none"
                    placeholder="nombres-del-evento"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Título (para el panel)</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="panel-input"
                  placeholder="Ej: Casamiento Juli y Riso"
                />
              </div>

            </>
          )}

          <FeatureChecklist
            features={features}
            onToggle={toggleFeature}
            detecting={detecting}
            detected={detected}
            detectError={detectError}
            hasFile={!!file}
            isRedeploy={!!redeploy}
          />

          {result && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-emerald-700 hover:underline truncate"
              >
                {typeof window !== 'undefined' ? window.location.origin : ''}{result.url}
              </a>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-outline">
              {result ? 'Cerrar' : 'Cancelar'}
            </button>
            <button
              type="submit"
              disabled={saving || !file || detecting}
              className="btn-primary rounded-lg px-6 disabled:opacity-50"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : detecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Detectando...</> : redeploy ? 'Actualizar archivos' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MODAL · EDITAR TÍTULO Y DIRECCIÓN
═══════════════════════════════════════════ */
function EditDeployedModal({
  item,
  onClose,
  onDone,
}: {
  item: DeployedCardItem
  onClose: () => void
  onDone: () => void
}) {
  const [title, setTitle] = useState(item.title)
  const [slug, setSlug] = useState(item.slug)
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    const finalSlug = slug.trim().toLowerCase()
    if (!SLUG_RE.test(finalSlug)) {
      toast.error('Dirección inválida: solo minúsculas, números y guiones')
      return
    }
    setSaving(true)
    try {
      if (finalSlug !== item.slug) {
        await apiFetch(`/admin/deployed-cards/${item.id}/rename`, {
          method: 'POST',
          body: JSON.stringify({ slug: finalSlug }),
        })
      }
      if (title.trim() && title.trim() !== item.title) {
        await apiFetch(`/admin/deployed-cards/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ title: title.trim() }),
        })
      }
      toast.success('Tarjeta actualizada')
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-slate-900 text-lg">Editar tarjeta</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Título (para el panel)</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="panel-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dirección de la tarjeta</label>
            <div className="flex items-center gap-0">
              <span className="text-xs text-slate-400 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg px-2.5 py-[9px] whitespace-nowrap">
                /tarjetas-digitales/
              </span>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase())}
                className="panel-input rounded-l-none"
                required
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Si cambiás la dirección, el enlace anterior deja de funcionar. Avisale al cliente.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary rounded-lg px-6 disabled:opacity-50"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MODAL · RESPUESTAS
═══════════════════════════════════════════ */
function RespuestasModal({
  item,
  base,
  onClose,
}: {
  item: DeployedCardItem
  base: string
  onClose: () => void
}) {
  const [rows, setRows] = useState<CardSubmissionItem[]>([])
  const [kind, setKind] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async (k: string) => {
    setLoading(true)
    try {
      const data = await apiFetch<CardSubmissionItem[]>(
        `${base}/${item.id}/respuestas${k ? `?kind=${k}` : ''}`
      )
      setRows(data)
    } catch {
      toast.error('No se pudieron cargar las respuestas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(kind) }, [kind])

  const rsvp = rsvpSummary(rows)

  const remove = async (id: number) => {
    if (!confirm('¿Eliminar esta respuesta?')) return
    await apiFetch(`${base}/${item.id}/respuestas/${id}`, { method: 'DELETE' })
    toast.success('Respuesta eliminada')
    load(kind)
  }

  const download = async () => {
    try {
      await downloadCsv(
        `${base}/${item.id}/respuestas.csv${kind ? `?kind=${kind}` : ''}`,
        `respuestas-${item.slug}.csv`
      )
    } catch {
      toast.error('No se pudo descargar el Excel')
    }
  }

  const downloadPhotos = async () => {
    try {
      await downloadCsv(`${base}/${item.id}/fotos.zip`, `fotos-${item.slug}.zip`)
    } catch {
      toast.error('No se pudieron descargar las fotos')
    }
  }

  const detailOf = (r: CardSubmissionItem) =>
    Object.entries(r.payload)
      .filter(([k]) => !['nombre', 'asisten', 'url', 'thumb_url', 'public_id', 'formato', 'cantidad', 'acompañantes', 'acompanantes', 'subinvitados'].includes(k))
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join(' · ')

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Respuestas · {item.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {rows.length} {rows.length === 1 ? 'respuesta' : 'respuestas'}
              {rsvp.groups > 0 &&
                ` · ${rsvp.groups} ${rsvp.groups === 1 ? 'grupo' : 'grupos'}`}
              {rsvp.groups > 0 &&
                ` · ${rsvp.declaredPeople} ${rsvp.declaredPeople === 1 ? 'persona' : 'personas'}`}
              {rsvp.attending > 0 && ` · ${rsvp.attending} asisten`}
              {rsvp.declined > 0 && ` · ${rsvp.declined} no asisten`}
              {rsvp.pending > 0 && ` · ${rsvp.pending} sin responder`}
            </p>
            <RsvpMenuSummary counts={rsvp.menuCounts} className="mt-2" />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-wrap items-center gap-2">
          <select value={kind} onChange={e => setKind(e.target.value)} className="panel-input !w-auto">
            <option value="">Todos los tipos</option>
            <option value="rsvp">Confirmaciones</option>
            <option value="cancion">Canciones</option>
            <option value="menu">Menú</option>
            <option value="mensaje">Mensajes</option>
            <option value="otro">Otros</option>
          </select>
          <div className="flex gap-2 ml-auto">
            <button onClick={download} className="btn-outline text-xs py-2">
              <Download className="w-3.5 h-3.5" /> Excel
            </button>
            <button onClick={downloadPhotos} className="btn-outline text-xs py-2" title="Descargar todas las fotos en un ZIP">
              <Download className="w-3.5 h-3.5" /> Fotos ZIP
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          {loading ? (
            <p className="text-center py-8 text-slate-400 text-sm">Cargando...</p>
          ) : rows.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm">Todavía no hay respuestas</p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {rows.map(r => {
                if (r.kind === 'rsvp') {
                  const group = rsvpGroup(r)
                  const counts = rsvpGroupCounts(group)
                  const extras = rsvpExtras(r.payload)
                  return (
                    <div key={r.id} className="px-4 py-3 space-y-2.5">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{group.nombre}</p>
                            <RsvpStatusBadge asisten={group.asisten} />
                            <span className="text-[10px] uppercase tracking-wider font-bold text-violet-600 bg-violet-50 rounded px-1.5 py-0.5">
                              rsvp
                            </span>
                            {group.declaredCompanions > 0 && (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-px">
                                {group.declaredCompanions}{' '}
                                {group.declaredCompanions === 1 ? 'acompañante' : 'acompañantes'}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-slate-400">
                            <span>{counts.attending} asisten</span>
                            {counts.declined > 0 && <span>· {counts.declined} no asisten</span>}
                            {counts.pending > 0 && <span>· {counts.pending} sin responder</span>}
                            {group.menu && <span>· Menú principal: {group.menu}</span>}
                            {group.notas && <span>· {group.notas}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => remove(r.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                          title="Eliminar respuesta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {group.companions.length > 0 && (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                            Subinvitados
                          </p>
                          <RsvpPeopleList group={group} includeMain={false} />
                        </div>
                      )}

                      {extras.length > 0 && (
                        <p className="text-xs text-slate-500">
                          {extras.map(([key, value]) => `${key}: ${value}`).join(' · ')}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400">
                        {new Date(r.created_at).toLocaleString('es-AR')}
                      </p>
                    </div>
                  )
                }

                return (
                  <div key={r.id} className="flex items-start gap-3 px-4 py-2.5">
                    {r.kind === 'foto' && typeof r.payload.thumb_url === 'string' && (
                      <a href={String(r.payload.url)} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img
                          src={String(r.payload.thumb_url)}
                          alt="Foto de invitado"
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                          loading="lazy"
                        />
                      </a>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 flex flex-wrap items-center gap-2">
                        {String(r.payload.nombre || 'Sin nombre')}
                        <span className="text-[10px] uppercase tracking-wider font-bold text-violet-600 bg-violet-50 rounded px-1.5 py-0.5">
                          {r.kind}
                        </span>
                        {r.payload.asisten === true && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-px">Asiste</span>
                        )}
                        {r.payload.asisten === false && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-px">No asiste</span>
                        )}
                      </p>
                      {detailOf(r) && <p className="text-xs text-slate-500 truncate">{detailOf(r)}</p>}
                      <p className="text-[11px] text-slate-400">
                        {new Date(r.created_at).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <button
                      onClick={() => remove(r.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      title="Eliminar respuesta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MODAL · DUEÑO Y AJUSTES
═══════════════════════════════════════════ */
function AjustesModal({
  item,
  clients,
  onClose,
  onDone,
}: {
  item: DeployedCardItem
  clients: ClientUserItem[]
  onClose: () => void
  onDone: () => void
}) {
  const [clientId, setClientId] = useState(item.client_id ? String(item.client_id) : '')
  const [menuText, setMenuText] = useState((item.menu_options || []).join('\n'))
  const [features, setFeatures] = useState<CardFeatureKey[]>(enabledFeatures(item.features))
  const [open, setOpen] = useState(item.submissions_open)
  const [saving, setSaving] = useState(false)

  const toggleFeature = (key: CardFeatureKey) =>
    setFeatures(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      await apiFetch(`/admin/deployed-cards/${item.id}/owner`, {
        method: 'PATCH',
        body: JSON.stringify({ client_id: clientId === '' ? null : Number(clientId) }),
      })
      await apiFetch(`/admin/deployed-cards/${item.id}/config`, {
        method: 'PATCH',
        body: JSON.stringify({
          menu_options: menuText.split('\n').map(s => s.trim()).filter(Boolean),
          features,
          submissions_open: open,
        }),
      })
      toast.success('Ajustes guardados')
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-slate-900 text-lg">Dueño y ajustes · {item.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dueño (cliente)</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)} className="panel-input">
              <option value="">Sin dueño (solo admin)</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} · {c.email}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1.5">
              El dueño gestiona invitados y menú desde su panel, en Tarjetas digitales.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Secciones que ve el cliente
            </label>
            <div className="space-y-2">
              {CARD_FEATURES.map(f => {
                const checked = features.includes(f.key)
                return (
                  <label
                    key={f.key}
                    className={`flex items-start gap-3 rounded-xl border px-3.5 py-2.5 cursor-pointer transition-colors ${
                      checked
                        ? 'border-violet-300 bg-violet-50/60'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFeature(f.key)}
                      className="mt-0.5 w-4 h-4 accent-violet-600 shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-800">{f.label}</span>
                      <span className="block text-xs text-slate-400">{f.description}</span>
                    </span>
                  </label>
                )
              })}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Se muestran en el panel del cliente. Se detectan automáticamente al publicar o
              actualizar el ZIP; acá podés ajustarlas. El menú solo aparece si tildás “Menú”.
            </p>
          </div>

          {features.includes('menu') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Opciones del menú</label>
              <textarea
                value={menuText}
                onChange={e => setMenuText(e.target.value)}
                className="panel-input"
                rows={4}
                placeholder={'Normal\nVeggie\nCelíaco\nInfantil'}
              />
              <p className="text-xs text-slate-400 mt-1.5">
                Una opción por línea. La tarjeta las muestra automáticamente, sin re-subir el ZIP.
              </p>
            </div>
          )}

          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 cursor-pointer">
            <span className="text-sm font-medium text-slate-700">
              Aceptar confirmaciones
              <span className="block text-xs font-normal text-slate-400">
                Desactivalo cuando termine el evento
              </span>
            </span>
            <input
              type="checkbox"
              checked={open}
              onChange={e => setOpen(e.target.checked)}
              className="w-5 h-5 accent-violet-600"
            />
          </label>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary rounded-lg px-6 disabled:opacity-50"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Guardar ajustes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
