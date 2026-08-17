import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { apiFetch, apiUpload } from '../../lib/api'
import type { Project, User, Message, Payment, DeliveryRecord, Service } from '../../types'
import { toast } from 'sonner'
import {
  Send,
  Check,
  X,
  ArrowLeft,
  Paperclip,
  Edit2,
  Save,
  ChevronDown,
  CheckCircle2,
  Circle,
  ExternalLink,
  Download,
  Clock,
} from 'lucide-react'

export const Route = createFileRoute('/(panel)/projects/$projectId')({
  validateSearch: (search: Record<string, unknown>) => ({
    transferido: search.transferido === true || search.transferido === 'true',
  }),
  component: ProjectDetailPage,
})

/* ─── Helpers ─── */
const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  cotizado: 'Cotizado',
  aceptado: 'Aceptado',
  desarrollo: 'En desarrollo',
  entregado: 'Entregado',
  completado: 'Completado',
  rechazado: 'Rechazado',
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    pendiente: 'badge-pendiente',
    cotizado: 'badge-cotizado',
    aceptado: 'badge-aceptado',
    desarrollo: 'badge-desarrollo',
    entregado: 'badge-entregado',
    completado: 'badge-completado',
    rechazado: 'badge-rechazado',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls[status] || 'bg-slate-100 text-slate-500'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function fmt(n: number) {
  return '$ ' + n.toLocaleString('es-AR')
}

/* ─── Linkify: convierte URLs en texto a enlaces clickeables ─── */
const URL_REGEX = /(https?:\/\/[\w\-._~:/?#\[\]@!$&'()*+,;=%]+?)(?=[\s,;:!?)\]\u201d]|$)/gi

function Linkify({ text, isMine }: { text: string; isMine: boolean }) {
  const parts = text.split(URL_REGEX)
  if (parts.length === 1) return <p className="text-sm leading-relaxed">{text}</p>
  return (
    <p className="text-sm leading-relaxed">
      {parts.map((part, i) => {
        if (URL_REGEX.test(part)) {
          URL_REGEX.lastIndex = 0
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noreferrer"
              className={`underline break-all ${isMine ? 'text-violet-200 hover:text-white' : 'text-violet-600 hover:text-violet-800'}`}
            >
              {part}
            </a>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}

function fmtDateShort(iso: string) {
  const d = new Date(iso)
  const day = d.getDate().toString().padStart(2, '0')
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const mon = months[d.getMonth()]
  const h12 = (d.getHours() % 12 || 12).toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const ampm = d.getHours() >= 12 ? 'p.m.' : 'a.m.'
  return `${day}-${mon}, ${h12}:${m} ${ampm}`
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div className={`toggle-track ${on ? 'on' : 'off'}`} onClick={onToggle} role="switch" aria-checked={on}>
      <span className="toggle-thumb" />
    </div>
  )
}

/* ─── Timeline ─── */
const TIMELINE_STEPS = ['pendiente', 'cotizado', 'aceptado', 'desarrollo', 'entregado', 'completado']
const STEP_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  cotizado: 'Cotizado',
  aceptado: 'Aceptado',
  desarrollo: 'En desarrollo',
  entregado: 'Entregado',
  completado: 'Completado',
}

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = TIMELINE_STEPS.indexOf(status)
  const isRejected = status === 'rechazado'

  return (
    <div className="panel-card">
      <div className="flex items-center gap-0 overflow-x-auto">
        {TIMELINE_STEPS.map((step, i) => {
          const done = currentIdx > i
          const active = currentIdx === i
          return (
            <div key={step} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                done
                  ? 'bg-violet-600 text-white'
                  : active
                  ? 'bg-violet-600 text-white ring-4 ring-violet-100'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {done ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                )}
                {STEP_LABELS[step]}
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`h-0.5 w-6 mx-1 ${done ? 'bg-violet-400' : 'bg-slate-200'}`} />
              )}
            </div>
          )
        })}
        {isRejected && (
          <div className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
            <X className="w-3 h-3" />
            Rechazado
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
function ProjectDetailPage() {
  const { projectId } = useParams({ from: '/(panel)/projects/$projectId' })
  const navigate = useNavigate()
  const search = useSearch({ from: Route.id })
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [transferidoDismissed, setTransferidoDismissed] = useState(false)

  const [project, setProject] = useState<Project | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [messageBody, setMessageBody] = useState('')
  const [uploading, setUploading] = useState(false)

  // Quote form (admin)
  const [adminPrice, setAdminPrice] = useState('')
  const [installments, setInstallments] = useState(1)
  const [depositPercentage, setDepositPercentage] = useState<number | ''>('')
  const [internalNotes, setInternalNotes] = useState('')
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false)
  const [maintenanceMonthly, setMaintenanceMonthly] = useState('')
  const [savingQuote, setSavingQuote] = useState(false)

  // Delivery form (admin)
  const [deliveryNote, setDeliveryNote] = useState('')
  const [deliveryLink, setDeliveryLink] = useState('')
  const [savingDelivery, setSavingDelivery] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState<number | null>(null)
  const [editNote, setEditNote] = useState('')
  const [editLink, setEditLink] = useState('')

  const load = () => {
    apiFetch<User>('/auth/me').then(setUser)
    apiFetch<Project>(`/projects/${projectId}`).then(p => {
      setProject(p)
      setAdminPrice(p.admin_price?.toString() || '')
      setInstallments(p.installments || 1)
      setDepositPercentage(p.deposit_percentage ?? '')
      setMaintenanceEnabled(p.maintenance_enabled || false)
      setMaintenanceMonthly(p.maintenance_monthly?.toString() || '')
    })
    apiFetch<Message[]>(`/projects/${projectId}/messages`).then(setMessages)
    apiFetch<Payment[]>(`/projects/${projectId}/payments`).then(setPayments)
    apiFetch<DeliveryRecord[]>(`/projects/${projectId}/deliveries`).then(setDeliveries)
    apiFetch<Service[]>('/services').then(setServices)
  }

  useEffect(() => { load() }, [projectId])
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!project || !user) {
    return <div className="text-center py-16 text-slate-400">Cargando...</div>
  }

  const isAdmin = user.role === 'admin'
  const service = services.find(s => s.id === project.service_id)

  const STATUSES = ['pendiente', 'cotizado', 'aceptado', 'desarrollo', 'entregado', 'completado']
  const statusIdx = STATUSES.indexOf(project.status)
  const canAdvance = isAdmin && statusIdx >= 0 && statusIdx < STATUSES.length - 1

  /* ── Actions ── */
  const changeStatus = async (next: string) => {
    await apiFetch(`/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify({ status: next }) })
    toast.success(`Estado cambiado a "${STATUS_LABELS[next] || next}"`)
    load()
  }

  const acceptQuote = async () => {
    await apiFetch(`/projects/${projectId}/accept`, { method: 'POST' })
    toast.success('Cotización aceptada. Pasamos a la etapa de desarrollo.')
    load()
  }

  const rejectQuote = async () => {
    await apiFetch(`/projects/${projectId}/reject`, { method: 'POST' })
    toast.success('Cotización rechazada.')
    load()
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageBody.trim()) return
    await apiFetch(`/projects/${projectId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body: messageBody }),
    })
    setMessageBody('')
    apiFetch<Message[]>(`/projects/${projectId}/messages`).then(setMessages)
  }

  const uploadMessageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    await apiUpload(`/projects/${projectId}/messages/upload`, file)
    setUploading(false)
    apiFetch<Message[]>(`/projects/${projectId}/messages`).then(setMessages)
  }

  const saveQuote = async () => {
    setSavingQuote(true)
    try {
      const price = Number(adminPrice) || null
      const monthly = maintenanceMonthly ? Number(maintenanceMonthly) : (price ? Math.round(price / 2) : null)
      await apiFetch(`/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          admin_price: price,
          installments: installments,
          deposit_percentage: depositPercentage === '' ? null : Number(depositPercentage),
          maintenance_enabled: maintenanceEnabled,
          maintenance_monthly: maintenanceEnabled ? monthly : null,
          status: project.status === 'pendiente' ? 'cotizado' : project.status,
        }),
      })
      toast.success(price ? 'Cotización guardada y enviada al cliente' : 'Cotización actualizada')
      load()
    } finally {
      setSavingQuote(false)
    }
  }

  const confirmPayment = async (paymentId: number, status: string) => {
    await apiFetch(`/projects/${projectId}/payments/${paymentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    toast.success(status === 'confirmado' ? 'Pago confirmado' : 'Pago rechazado')
    load()
  }

  const uploadReceipt = async (paymentId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await apiUpload(`/projects/${projectId}/payments/${paymentId}/receipt`, file)
    load()
  }

  const saveDelivery = async () => {
    if (!deliveryNote.trim()) return
    setSavingDelivery(true)
    try {
      await apiFetch(`/projects/${projectId}/deliveries`, {
        method: 'POST',
        body: JSON.stringify({ note: deliveryNote, link: deliveryLink || null }),
      })
      setDeliveryNote('')
      setDeliveryLink('')
      toast.success('Entrega registrada. El cliente recibirá una notificación.')
      load()
    } finally {
      setSavingDelivery(false)
    }
  }

  const saveEditDelivery = async (deliveryId: number) => {
    await apiFetch(`/projects/${projectId}/deliveries/${deliveryId}`, {
      method: 'PUT',
      body: JSON.stringify({ note: editNote, link: editLink || null }),
    })
    setEditingDelivery(null)
    load()
  }

  /* ── Computed ── */
  const confirmedPayments = payments.filter(p => p.status === 'confirmado')
  const confirmedTotal = confirmedPayments.reduce((s, p) => s + p.amount, 0)
  const totalAmount = project.admin_price || 0
  const suggestedMonthly = adminPrice ? Math.round(Number(adminPrice) / 2) : 0

  // Payment logic
  const pendingProjectPayment = payments.find(p => p.kind === 'project' && p.status === 'pendiente')
  const pendingMaintenancePayment = payments.find(p => p.kind === 'maintenance' && p.status === 'pendiente')

  const now2 = new Date()
  const startOfMonth = new Date(now2.getFullYear(), now2.getMonth(), 1)
  const lastMaintenancePaid = payments
    .filter(p => p.kind === 'maintenance' && p.status === 'confirmado')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  const maintenancePaidThisMonth = lastMaintenancePaid && new Date(lastMaintenancePaid.created_at) >= startOfMonth

  const maintenanceDaysRemaining = pendingMaintenancePayment
    ? Math.max(0, 30 - Math.ceil((now2.getTime() - new Date(pendingMaintenancePayment.created_at).getTime()) / (1000 * 60 * 60 * 24)))
    : null
  const maintenanceDueDate = pendingMaintenancePayment
    ? new Date(new Date(pendingMaintenancePayment.created_at).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null

  const methodLabels: Record<string, string> = {
    mp_link: 'Link MP',
    alias: 'Alias',
    qr: 'QR',
    otro: 'Otro',
  }

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div>
        <button
          onClick={() => navigate({ to: isAdmin ? '/projects' : '/dashboard' })}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAdmin ? 'Proyectos' : 'Volver al dashboard'}
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={project.status} />
              {service && <span className="text-sm text-slate-400">{service.name}</span>}
            </div>
            <h1 className="page-title leading-tight">{project.title}</h1>
            {project.client && (
              <p className="text-sm text-slate-400 mt-1">
                Cliente: {project.client.name} · {project.client.email} · creado {fmtDateShort(project.created_at)}
              </p>
            )}
          </div>

          {/* Admin: change status dropdown */}
          {isAdmin && (
            <div className="shrink-0">
              <label className="block text-xs text-slate-400 mb-1">Cambiar estado</label>
              <div className="relative">
                <select
                  value={project.status}
                  onChange={e => changeStatus(e.target.value)}
                  className="panel-input pr-8 appearance-none cursor-pointer w-44"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                  <option value="rechazado">Rechazado</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Aviso: dijo que ya transfirió ── */}
      {!isAdmin && search.transferido && !transferidoDismissed && (pendingProjectPayment || pendingMaintenancePayment) && (
        <div className="flex items-start justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Estamos validando tu pago</p>
              <p className="text-xs text-amber-600 mt-0.5">Te avisamos apenas esté confirmado. Si todavía no subiste el comprobante, podés hacerlo desde "Pagar".</p>
            </div>
          </div>
          <button
            onClick={() => setTransferidoDismissed(true)}
            className="text-amber-500 hover:text-amber-700 shrink-0 p-0.5"
            aria-label="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Timeline ── */}
      <StatusTimeline status={project.status} />

      {/* ── 2-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT col (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Description */}
          <div className="panel-card overflow-hidden">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Descripción del cliente</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap break-all overflow-hidden">{project.description}</p>
          </div>

          {/* Chat */}
          <div className="panel-card flex flex-col" style={{ minHeight: 400 }}>
            <h3 className="text-sm font-bold text-slate-700 mb-3">{isAdmin ? 'Chat con el cliente' : 'Chat con el equipo'}</h3>
            <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-96 pr-1">
              {messages.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Sin mensajes aún</p>
              ) : (
                messages.map(m => {
                  const isMine = m.sender_id === user.id
                  return (
                    <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'}`}>
                        {!isMine && (
                          <p className="text-[11px] font-semibold mb-1 opacity-60">{m.sender?.name || '—'}</p>
                        )}
                        {m.body && <Linkify text={m.body} isMine={isMine} />}
                        {m.attachments?.map(a => (
                          <a
                            key={a.id}
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center gap-2 mt-2 text-xs underline ${isMine ? 'text-violet-200' : 'text-violet-600'}`}
                          >
                            {a.mime?.startsWith('image/') ? (
                              <img src={a.url} alt={a.filename} className="rounded-lg max-w-[200px] max-h-32 object-cover mt-1" />
                            ) : (
                              <>
                                <Paperclip className="w-3 h-3" />
                                {a.filename}
                                <span className="opacity-60">({Math.round(a.size / 1024)} KB)</span>
                                <Download className="w-3 h-3" />
                              </>
                            )}
                          </a>
                        ))}
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-violet-300' : 'text-slate-400'}`}>
                          {fmtDateShort(m.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-100 pt-3">
              <label className="p-2.5 bg-slate-100 text-slate-500 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                <Paperclip className="w-4 h-4" />
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4,.mp3,.wav,.ogg"
                  className="hidden"
                  onChange={uploadMessageFile}
                  disabled={uploading}
                />
              </label>
              <textarea
                value={messageBody}
                onChange={e => {
                  setMessageBody(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (messageBody.trim()) sendMessage(e)
                  }
                }}
                rows={1}
                className="panel-input flex-1 resize-none py-2.5 min-h-[44px] max-h-32"
                style={{ overflowY: 'auto' }}
                placeholder="Escribí un mensaje..."
              />
              <button type="submit" className="p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Delivery (admin creates / both see) */}
          <div className="panel-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Entrega</h3>
              {deliveries.length > 0 && (
                <span className="text-xs text-slate-400">{deliveries.length} actualizacion{deliveries.length > 1 ? 'es' : ''}</span>
              )}
            </div>

            {isAdmin && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Link de visualización</label>
                  <input
                    value={deliveryLink}
                    onChange={e => setDeliveryLink(e.target.value)}
                    className="panel-input"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Notas para el cliente</label>
                  <textarea
                    value={deliveryNote}
                    onChange={e => setDeliveryNote(e.target.value)}
                    rows={3}
                    className="panel-input resize-none"
                    placeholder="Describí los cambios..."
                  />
                </div>
                <button
                  onClick={saveDelivery}
                  disabled={savingDelivery || !deliveryNote.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingDelivery ? 'Guardando...' : 'Guardar entrega'}
                </button>
              </div>
            )}

            {/* Delivery history */}
            {deliveries.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Historial (más reciente arriba)</p>
                <div className="space-y-3">
                  {[...deliveries].reverse().map(d => (
                    <div key={d.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50">
                      {editingDelivery === d.id ? (
                        <div className="space-y-2">
                          <input
                            value={editLink}
                            onChange={e => setEditLink(e.target.value)}
                            className="panel-input text-sm"
                            placeholder="Link (opcional)"
                          />
                          <textarea
                            value={editNote}
                            onChange={e => setEditNote(e.target.value)}
                            rows={3}
                            className="panel-input text-sm resize-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => saveEditDelivery(d.id)} className="btn-primary text-xs py-1.5">
                              <Save className="w-3 h-3" /> Guardar
                            </button>
                            <button onClick={() => setEditingDelivery(null)} className="btn-outline text-xs py-1.5">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{d.note}</p>
                              {d.link && (
                                <a href={d.link} target="_blank" rel="noreferrer"
                                  className="flex items-center gap-1 text-xs text-violet-600 mt-1 hover:underline">
                                  <ExternalLink className="w-3 h-3" />
                                  {d.link}
                                </a>
                              )}
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => { setEditingDelivery(d.id); setEditNote(d.note); setEditLink(d.link || '') }}
                                className="p-1 text-slate-400 hover:text-slate-600 ml-2"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2">
                            {fmtDateShort(d.created_at)} por {isAdmin ? 'vos' : 'Clik Agencia'}
                          </p>
                          {d.attachments?.map(a => (
                            <a key={a.id} href={a.url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-xs text-violet-600 mt-1">
                              <Paperclip className="w-3 h-3" /> {a.filename}
                            </a>
                          ))}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT col (1/3) ── */}
        <div className="space-y-4">

          {/* Quotation card (admin) */}
          {isAdmin && (
            <div className="panel-card space-y-4">
              <h3 className="text-sm font-bold text-slate-700">Cotización</h3>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Precio asignado (ARS)</label>
                <input
                  type="number"
                  value={adminPrice}
                  onChange={e => setAdminPrice(e.target.value)}
                  className="panel-input"
                  placeholder="0"
                />
              </div>

              {/* Señado + Cuotas en la misma fila */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Señado</label>
                  <div className="relative">
                    <select
                      value={depositPercentage}
                      onChange={e => setDepositPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                      className="panel-input appearance-none pr-8 cursor-pointer text-sm"
                    >
                      <option value="">Sin seña</option>
                      <option value={25}>25%</option>
                      <option value={50}>50%</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Cuotas</label>
                  <div className="relative">
                    <select
                      value={installments}
                      onChange={e => setInstallments(Number(e.target.value))}
                      className="panel-input appearance-none pr-8 cursor-pointer text-sm"
                    >
                      {[1,2,3,4,5,6,8,10,12].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'cuota' : 'cuotas'}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              {/* Resumen de pagos */}
              {adminPrice && Number(adminPrice) > 0 && (
                <div className="bg-slate-50 rounded-xl p-2.5 text-xs space-y-0.5">
                  {depositPercentage !== '' && (
                    <p className="text-violet-600 font-medium">
                      Seña ({depositPercentage}%): {fmt(Math.round(Number(adminPrice) * Number(depositPercentage) / 100))}
                    </p>
                  )}
                  {(() => {
                    const dep = depositPercentage !== '' ? Math.round(Number(adminPrice) * Number(depositPercentage) / 100) : 0
                    const remaining = Number(adminPrice) - dep
                    if (remaining <= 0) return null
                    if (installments === 1) {
                      return <p className="text-slate-500">Saldo: {fmt(remaining)} (pago único)</p>
                    }
                    return (
                      <p className="text-slate-500">
                        Saldo: {fmt(remaining)} → {installments} × {fmt(Math.round(remaining / installments))}
                      </p>
                    )
                  })()}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Notas internas</label>
                <textarea
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                  rows={3}
                  className="panel-input resize-none"
                />
              </div>

              {service?.supports_maintenance && (
                <div className={`rounded-xl p-3 border ${maintenanceEnabled ? 'border-violet-200 bg-violet-50/40' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Toggle on={maintenanceEnabled} onToggle={() => setMaintenanceEnabled(!maintenanceEnabled)} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Incluir mantenimiento mensual</p>
                      <p className="text-xs text-slate-500">Se cobra por mes. Por defecto: la mitad del precio final.</p>
                    </div>
                  </div>
                  {maintenanceEnabled && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Cuota mensual (ARS)</label>
                      <input
                        type="number"
                        value={maintenanceMonthly}
                        onChange={e => setMaintenanceMonthly(e.target.value)}
                        className="panel-input"
                        placeholder={suggestedMonthly.toString()}
                      />
                      {suggestedMonthly > 0 && (
                        <p className="text-xs text-slate-400 mt-1">Sugerido: {fmt(suggestedMonthly)} (50% del precio)</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={saveQuote}
                disabled={savingQuote}
                className="btn-primary w-full justify-center rounded-xl py-2.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingQuote ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}

          {/* Client: quotation info */}
          {!isAdmin && (
            <div className="panel-card">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Precio cotizado</h3>
              {project.admin_price ? (
                <>
                  <p className="text-2xl font-bold text-slate-900">{fmt(project.admin_price)}</p>
                  {project.deposit_percentage && project.deposit_percentage > 0 ? (
                    <div className="mt-2 space-y-0.5">
                      <p className="text-xs text-violet-600 font-medium">
                        Seña ({project.deposit_percentage}%): {fmt(Math.round(project.admin_price * project.deposit_percentage / 100))}
                      </p>
                      {(() => {
                        const remaining = project.admin_price - Math.round(project.admin_price * project.deposit_percentage / 100)
                        if (project.installments > 1) {
                          return (
                            <p className="text-xs text-slate-500">
                              Saldo {fmt(remaining)} en {project.installments} cuotas de {fmt(Math.round(remaining / project.installments))}
                            </p>
                          )
                        }
                        return <p className="text-xs text-slate-500">Saldo: {fmt(remaining)}</p>
                      })()}
                    </div>
                  ) : project.installments > 1 ? (
                    <p className="text-xs text-slate-500 mt-1">
                      {project.installments} cuotas de {fmt(Math.round(project.admin_price / project.installments))}
                    </p>
                  ) : null}
                  {project.maintenance_enabled && project.maintenance_monthly && (
                    <p className="text-xs text-slate-500 mt-1">
                      + mantenimiento mensual: {fmt(project.maintenance_monthly)}
                    </p>
                  )}
                  {project.status === 'cotizado' && (
                    <div className="flex gap-3 mt-4">
                      <button onClick={acceptQuote} className="btn-primary">
                        <Check className="w-4 h-4" /> Aceptar cotización
                      </button>
                      <button onClick={rejectQuote} className="btn-outline text-red-500 border-red-200 hover:bg-red-50">
                        <X className="w-4 h-4" /> Rechazar
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-3xl text-slate-300 font-bold">—</p>
                  <p className="text-sm text-slate-400 mt-2">
                    Estamos revisando tu solicitud. Te enviaremos una cotización pronto.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Pending payment (client): debajo de Precio cotizado, arriba del historial */}
          {!isAdmin && (pendingProjectPayment || pendingMaintenancePayment) && (
            <div className="space-y-4">
              {pendingProjectPayment && (
                <div className="panel-card">
                  <div className="flex flex-col items-start gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {pendingProjectPayment.installment_number === 1 && project.deposit_percentage && project.deposit_percentage > 0
                          ? 'Seña por pagar'
                          : pendingProjectPayment.installment_number
                            ? `Cuota ${pendingProjectPayment.installment_number} por pagar`
                            : 'Pago único por pagar'}
                      </p>
                      <p className="text-lg font-bold text-slate-900 mt-1">{fmt(pendingProjectPayment.amount)}</p>
                    </div>
                    {pendingProjectPayment.receipts?.length > 0 ? (
                      <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
                        <Clock className="w-4 h-4" />
                        Estamos validando tu pago
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate({
                          to: '/pagar',
                          search: {
                            projectId,
                            proyecto: project.title,
                            total: totalAmount,
                            cuotas: payments.filter(x => x.kind === 'project').length,
                            cuotaActual: pendingProjectPayment.installment_number ?? 1,
                            montoCuota: pendingProjectPayment.amount,
                            esSeña: (pendingProjectPayment.installment_number === 1 && project.deposit_percentage && project.deposit_percentage > 0) ? '1' : '0',
                          },
                        })}
                        className="btn-primary py-2.5 px-6"
                      >
                        {(pendingProjectPayment.installment_number === 1 && project.deposit_percentage && project.deposit_percentage > 0)
                          ? 'Pagar seña'
                          : pendingProjectPayment.installment_number
                            ? `Pagar cuota ${pendingProjectPayment.installment_number}`
                            : 'Pagar'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {pendingMaintenancePayment && (
                <div className="panel-card">
                  <div className="flex flex-col items-start gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Mantenimiento mensual</p>
                      <p className="text-lg font-bold text-slate-900 mt-1">{fmt(pendingMaintenancePayment.amount)}</p>
                      {maintenancePaidThisMonth ? (
                        <p className="text-xs text-emerald-600 font-medium mt-1">✓ Ya pagaste este mes</p>
                      ) : (
                        <p className="text-xs text-amber-600 mt-1">
                          Quedan {maintenanceDaysRemaining} día{maintenanceDaysRemaining !== 1 ? 's' : ''} restantes · Vence el {maintenanceDueDate ? fmtDateShort(maintenanceDueDate.toISOString()) : ''}
                        </p>
                      )}
                    </div>
                    {pendingMaintenancePayment.receipts?.length > 0 ? (
                      <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
                        <Clock className="w-4 h-4" />
                        Estamos validando tu pago
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate({
                          to: '/pagar',
                          search: {
                            projectId,
                            proyecto: project.title,
                            total: totalAmount,
                            cuotas: 0,
                            cuotaActual: 1,
                            montoCuota: pendingMaintenancePayment.amount,
                          },
                        })}
                        disabled={maintenancePaidThisMonth}
                        className="btn-primary py-2.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Pagar mantenimiento
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payments card (history only for client / admin actions) */}
          {payments.length > 0 && (
            <div className="panel-card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700">Historial de pagos</h3>
                <span className="text-xs text-slate-400">
                  {confirmedPayments.length}/{payments.filter(p => p.kind === 'project').length} cuotas
                </span>
              </div>

              {totalAmount > 0 && isAdmin && (
                <div>
                  <p className="text-xs text-slate-500">
                    Cobrado: <strong className="text-slate-800">{fmt(confirmedTotal)}</strong> de {fmt(totalAmount)}
                  </p>
                  {project.next_due_date && (
                    <p className="text-xs text-amber-600 mt-0.5 font-medium">
                      Próx. pago estimado: {new Date(project.next_due_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2.5">
                {payments.map(p => {
                  const isDepositPayment = p.kind === 'project' && p.installment_number === 1 && project.deposit_percentage && project.deposit_percentage > 0
                  const label = p.kind === 'maintenance' ? 'Mantenimiento' : isDepositPayment ? 'Seña' : p.installment_number ? `Cuota ${p.installment_number}` : 'Pago único'
                  const isPendingMaint = p.kind === 'maintenance' && p.status === 'pendiente'
                  const maintDue = isPendingMaint ? new Date(new Date(p.created_at).getTime() + 30 * 24 * 60 * 60 * 1000) : null
                  return (
                    <div key={p.id} className="border border-slate-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-xs text-slate-400">
                            {maintDue ? `Vence el ${fmtDateShort(maintDue.toISOString())}` : fmtDateShort(p.created_at)} · {methodLabels[p.method || ''] || p.method || '—'}
                          </span>
                          <br />
                          <span className="text-[11px] text-slate-400">
                            {label} · {p.status === 'confirmado' ? 'Pagado' : p.status === 'pendiente' ? 'Pendiente de pago' : 'Rechazado'}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">{fmt(p.amount)}</span>
                      </div>

                      {/* Receipts */}
                      {p.receipts?.map(r => (
                        <a
                          key={r.id}
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 mt-1"
                        >
                          {r.mime?.startsWith('image/') ? (
                            <img src={r.url} alt={r.filename} className="w-16 h-16 object-cover rounded-lg border" />
                          ) : (
                            <span className="text-xs text-violet-600 underline">{r.filename}</span>
                          )}
                          <span className="text-xs text-slate-400">
                            {Math.round(r.size / 1024)} KB
                          </span>
                          <Download className="w-3 h-3 text-violet-500" />
                        </a>
                      ))}

                      {/* Admin actions */}
                      {isAdmin && p.status === 'pendiente' && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => confirmPayment(p.id, 'confirmado')}
                            className="btn-primary text-xs py-1 px-3 rounded-lg"
                          >
                            <Check className="w-3 h-3" /> Confirmar
                          </button>
                          <button
                            onClick={() => confirmPayment(p.id, 'rechazado')}
                            className="btn-outline text-xs py-1 px-3 text-red-500 border-red-200 hover:bg-red-50"
                          >
                            <X className="w-3 h-3" /> Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
