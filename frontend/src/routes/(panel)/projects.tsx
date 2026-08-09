import { createFileRoute, useNavigate, Outlet, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { Project, Service, User } from '../../types'
import { Search, ChevronDown } from 'lucide-react'
import { Pagination } from '../../components/ui/pagination'

export const Route = createFileRoute('/(panel)/projects')({
  component: ProjectsPage,
})

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

function fmtDate(iso: string) {
  const d = new Date(iso)
  const day = d.getDate().toString().padStart(2, '0')
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const mon = months[d.getMonth()]
  const h12 = (d.getHours() % 12 || 12).toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const ampm = d.getHours() >= 12 ? 'p.m.' : 'a.m.'
  return `${day}-${mon}, ${h12}:${m} ${ampm}`
}

function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const matchChild = useRouterState({ select: s => s.location.pathname.startsWith('/projects/') })

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const loadProjects = () => apiFetch<Project[]>('/projects').then(setProjects)

  useEffect(() => {
    apiFetch<User>('/auth/me').then(u => {
      setUser(u)
      loadProjects()
    })
  }, [])

  const isAdmin = user?.role === 'admin'

  const statuses = ['', 'pendiente', 'cotizado', 'aceptado', 'desarrollo', 'entregado', 'completado', 'rechazado']

  const PER_PAGE = 10

  // Busca por título, nombre del cliente y fechas (formato corto e ISO)
  const searchable = (p: Project) =>
    [
      p.title,
      p.client?.name ?? '',
      p.created_at.slice(0, 10),
      fmtDate(p.created_at),
      p.updated_at.slice(0, 10),
      fmtDate(p.updated_at),
    ]
      .join(' ')
      .toLowerCase()

  const filtered = projects
    .filter(p => !search.trim() || searchable(p).includes(search.trim().toLowerCase()))
    .filter(p => !statusFilter || p.status === statusFilter)
    // Admin: más nuevo arriba. Cliente: conserva el orden del backend (updated_at desc).
    .sort((a, b) => (isAdmin ? b.created_at.localeCompare(a.created_at) : 0))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageProjects = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  if (matchChild) return <Outlet />

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Proyectos</h1>
        <p className="page-subtitle">
          {isAdmin ? 'Gestioná cotizaciones, estados y entregas.' : 'Seguí el estado de tus proyectos.'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="panel-input panel-input-icon"
            placeholder="Buscar por título, cliente o fecha..."
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="panel-input pr-8 appearance-none cursor-pointer w-44"
          >
            <option value="">Todos los estados</option>
            {statuses.slice(1).map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Project cards */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="panel-card text-center py-12">
            <p className="text-slate-400">No se encontraron proyectos</p>
          </div>
        ) : (
          pageProjects.map(p => (
            <div
              key={p.id}
              onClick={() => navigate({ to: `/projects/${p.id}` })}
              className="panel-card cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusBadge status={p.status} />
                    {p.service?.name && (
                      <span className="text-xs text-slate-400">{p.service.name}</span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900">{p.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {p.client?.name ? `${p.client.name} · ` : ''}
                    {fmtDate(p.updated_at)}
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

      {/* Pagination */}
      {filtered.length > 0 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={setPage}
          pageSizeLabel={`Mostrando ${(safePage - 1) * PER_PAGE + 1}–${Math.min(
            safePage * PER_PAGE,
            filtered.length
          )} de ${filtered.length} proyectos`}
        />
      )}
    </div>
  )
}
