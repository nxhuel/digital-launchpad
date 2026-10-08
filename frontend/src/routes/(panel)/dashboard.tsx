import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { AdminStats, User } from '../../types'
import { DollarSign, FolderKanban, Users, Clock, Plus, ChevronRight, ShoppingBag, FileSearch, CheckCircle2 } from 'lucide-react'
import { Pagination } from '../../components/ui/pagination'

export const Route = createFileRoute('/(panel)/dashboard')({
  component: DashboardPage,
})

/* ─── Shared ─── */
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

/* ─── Dates ─── */
function fmtDate(iso: string) {
  const d = new Date(iso)
  const day = d.getDate().toString().padStart(2, '0')
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const mon = months[d.getMonth()]
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const ampm = d.getHours() >= 12 ? 'p.m.' : 'a.m.'
  const h12 = (d.getHours() % 12 || 12).toString().padStart(2, '0')
  return `${day}-${mon}, ${h12}:${m} ${ampm}`
}

/* ═══════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════ */
function AdminDashboard({ stats }: { stats: AdminStats }) {
  const navigate = useNavigate()
  const [recentPage, setRecentPage] = useState(1)

  const pendingQuotes = stats.recent_projects.filter(p => p.status === 'pendiente').length

  const RECENT_PER_PAGE = 3
  const recentTotalPages = Math.max(1, Math.ceil(stats.recent_projects.length / RECENT_PER_PAGE))
  const safeRecentPage = Math.min(recentPage, recentTotalPages)
  const recentProjects = stats.recent_projects.slice(
    (safeRecentPage - 1) * RECENT_PER_PAGE,
    safeRecentPage * RECENT_PER_PAGE
  )

  const kpis = [
    {
      label: 'Proyectos activos',
      value: stats.active_projects,
      icon: FolderKanban,
      highlight: false,
    },
    {
      label: 'Pendientes de cotizar',
      value: stats.recent_projects.filter(p => p.status === 'pendiente').length,
      icon: Clock,
      highlight: pendingQuotes > 0,
    },
    {
      label: 'Ingresos del mes',
      value: fmt(stats.monthly_income),
      icon: DollarSign,
      highlight: false,
    },
    {
      label: 'Clientes',
      value: stats.total_clients,
      icon: Users,
      highlight: false,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Panel general</h1>
        <p className="page-subtitle">Resumen de operaciones y pagos.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div
            key={k.label}
            className={`panel-card flex flex-col gap-3 ${k.highlight ? 'bg-yellow-50 border-yellow-200' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{k.label}</span>
              <k.icon className="w-4.5 h-4.5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 leading-none">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Proyectos recientes</h2>
          <button
            onClick={() => navigate({ to: '/projects' })}
            className="text-sm text-violet-600 font-semibold hover:text-violet-700"
          >
            Ver todos
          </button>
        </div>

        <div className="space-y-2.5">
          {stats.recent_projects.length === 0 ? (
            <p className="text-center text-slate-400 py-12">Sin proyectos aún</p>
          ) : (
            recentProjects.map(p => (
              <div
                key={p.id}
                onClick={() => navigate({ to: `/projects/${p.id}` })}
                className="panel-card cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={p.status} />
                      <span className="text-xs text-slate-400">{p.service?.name}</span>
                    </div>
                    <p className="font-semibold text-slate-900 truncate">{p.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {p.client?.name} · {fmtDate(p.updated_at)}
                    </p>
                  </div>
                  {p.admin_price != null && (
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-slate-400">Precio</p>
                      <p className="font-bold text-slate-900">{fmt(p.admin_price)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination (3 por página) */}
        {stats.recent_projects.length > RECENT_PER_PAGE && (
          <div className="pt-5">
            <Pagination
              page={safeRecentPage}
              totalPages={recentTotalPages}
              onChange={setRecentPage}
              pageSizeLabel={`Mostrando ${(safeRecentPage - 1) * RECENT_PER_PAGE + 1}–${Math.min(
                safeRecentPage * RECENT_PER_PAGE,
                stats.recent_projects.length
              )} de ${stats.recent_projects.length} proyectos`}
            />
          </div>
        )}
      </div>

    </div>
  )
}

/* ═══════════════════════════════════════════
   CLIENTE · MIS PEDIDOS
═══════════════════════════════════════════ */
function ClientDashboard({ user }: { user: User }) {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<any[]>('/projects')
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    activos: projects.filter(p => ['aceptado', 'desarrollo', 'entregado'].includes(p.status)).length,
    cotizados: projects.filter(p => p.status === 'cotizado').length,
    completados: projects.filter(p => p.status === 'completado').length,
  }

  const sorted = [...projects].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const firstName = user.name.split(' ')[0]

  if (loading) return <div className="text-center py-16 text-slate-400">Cargando...</div>

  const stats = [
    { label: 'Pedidos activos', desc: 'En curso con el equipo', value: counts.activos, icon: ShoppingBag, accent: 'bg-violet-100 text-violet-700', highlight: counts.activos > 0 },
    { label: 'En cotización', desc: 'Esperando precio final', value: counts.cotizados, icon: FileSearch, accent: 'bg-amber-100 text-amber-700', highlight: counts.cotizados > 0 },
    { label: 'Pedidos completos', desc: 'Trabajos entregados', value: counts.completados, icon: CheckCircle2, accent: 'bg-emerald-100 text-emerald-700', highlight: false },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Hola, {firstName}</h1>
          <p className="page-subtitle">Acá ves el estado de cada pedido, su cotización y el detalle completo.</p>
        </div>
        <button
          onClick={() => navigate({ to: '/projects/new' })}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nuevo pedido
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div
            key={s.label}
            className={`panel-card flex items-center gap-4 ${s.highlight ? 'border-violet-200 ring-1 ring-violet-100' : ''}`}
          >
            <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.accent}`}>
              <s.icon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">{s.label}</p>
              <p className="text-xs text-slate-400">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Listado */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">
          Todos los pedidos
          <span className="ml-2 text-xs font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 align-middle">
            {sorted.length}
          </span>
        </h2>

        {sorted.length === 0 ? (
          <div className="panel-card text-center py-12">
            <span className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6" />
            </span>
            <p className="font-semibold text-slate-900">No tenés pedidos todavía</p>
            <p className="text-slate-400 mb-5 text-sm mt-1">Contanos qué necesitás y te enviamos la cotización.</p>
            <button
              onClick={() => navigate({ to: '/projects/new' })}
              className="btn-primary mx-auto"
            >
              <Plus className="w-4 h-4" />
              Solicitar un pedido
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(p => (
              <article
                key={p.id}
                onClick={() => navigate({ to: `/projects/${p.id}` })}
                className="panel-card cursor-pointer hover:shadow-md hover:border-violet-200 transition-all !p-0 overflow-hidden"
              >
                <div className="flex items-stretch gap-0">
                  {/* Acento lateral según estado */}
                  <span
                    className={`w-1.5 shrink-0 ${
                      p.status === 'completado' ? 'bg-emerald-400'
                      : p.status === 'rechazado' ? 'bg-red-300'
                      : p.status === 'pendiente' ? 'bg-amber-300'
                      : 'bg-violet-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <StatusBadge status={p.status} />
                      {p.service?.name && (
                        <span className="text-xs text-slate-400">{p.service.name}</span>
                      )}
                      <span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-slate-400">Pedido #{p.id}</span>
                    </div>
                    <p className="font-bold text-slate-900 text-[15px] truncate">{p.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Creado el {fmtDate(p.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 px-5 py-4 shrink-0 border-l border-slate-100">
                    {p.admin_price != null ? (
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Cotización</p>
                        <p className="font-bold text-slate-900 text-lg leading-tight">{fmt(p.admin_price)}</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Cotización</p>
                        <p className="text-sm font-medium text-amber-600">En revisión</p>
                      </div>
                    )}
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   ROOT
═══════════════════════════════════════════ */
function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    apiFetch<User>('/auth/me').then(u => {
      setUser(u)
      if (u.role === 'admin') {
        apiFetch<AdminStats>('/admin/stats').then(setStats).catch(() => {})
      }
    })
  }, [])

  if (!user) return null

  if (user.role === 'client') return <ClientDashboard user={user} />

  if (!stats) return <div className="text-center py-16 text-slate-400">Cargando...</div>

  return <AdminDashboard stats={stats} />
}
