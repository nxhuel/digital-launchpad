import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { AdminStats, User } from '../../types'
import { DollarSign, FolderKanban, Users, Clock, Plus, ChevronRight } from 'lucide-react'

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

  const pendingQuotes = stats.recent_projects.filter(p => p.status === 'pendiente').length

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

      {/* Income by Service Chart */}
      {stats.income_by_service && stats.income_by_service.length > 0 && (
        <div className="panel-card space-y-4">
          <h2 className="text-base font-bold text-slate-900">Ingresos por servicio (Histórico)</h2>
          <div className="space-y-3">
            {stats.income_by_service
              .sort((a, b) => b.income - a.income)
              .map(item => {
                const maxIncome = Math.max(...stats.income_by_service.map(x => x.income));
                const percentage = maxIncome > 0 ? (item.income / maxIncome) * 100 : 0;
                return (
                  <div key={item.service_name} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.service_name}</span>
                      <span className="font-bold text-slate-900">{fmt(item.income)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-violet-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

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
            stats.recent_projects.map(p => (
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
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   CLIENT DASHBOARD
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Hola, {firstName} 👋</h1>
          <p className="page-subtitle">Estos son tus proyectos.</p>
        </div>
        <button
          onClick={() => navigate({ to: '/projects/new' })}
          className="btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" />
          Solicitar nuevo proyecto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Activos', value: counts.activos, highlight: counts.activos > 0 },
          { label: 'En cotización', value: counts.cotizados, highlight: counts.cotizados > 0 },
          { label: 'Completados', value: counts.completados, highlight: false },
        ].map(c => (
          <div
            key={c.label}
            className={`panel-card ${c.highlight ? 'border-violet-200 bg-violet-50/30' : ''}`}
          >
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Project list */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Mis proyectos</h2>
        {sorted.length === 0 ? (
          <div className="panel-card text-center py-12">
            <p className="text-slate-400 mb-4">No tenés proyectos todavía</p>
            <button
              onClick={() => navigate({ to: '/projects/new' })}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Solicitar un proyecto
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(p => (
              <div
                key={p.id}
                onClick={() => navigate({ to: `/projects/${p.id}` })}
                className="panel-card cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={p.status} />
                      {p.service?.name && (
                        <span className="text-xs text-slate-400">{p.service.name}</span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-900 truncate">{p.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Creado el {fmtDate(p.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {p.admin_price != null && (
                      <div className="text-right">
                        <p className="text-[11px] text-slate-400">Precio</p>
                        <p className="font-bold text-slate-900">{fmt(p.admin_price)}</p>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
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
