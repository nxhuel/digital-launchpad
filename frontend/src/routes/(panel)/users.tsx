import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { User, Project } from '../../types'
import { Search, Trash2 } from 'lucide-react'
import { Pagination } from '../../components/ui/pagination'

export const Route = createFileRoute('/(panel)/users')({
  component: UsersPage,
})

interface ClientWithProjects extends User {
  projects?: Project[]
  project_count?: number
  expanded?: boolean
}

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

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      className={`toggle-track ${on ? 'on' : 'off'}`}
      onClick={onToggle}
      role="switch"
      aria-checked={on}
    >
      <span className="toggle-thumb" />
    </div>
  )
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

function UsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<ClientWithProjects[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    apiFetch<ClientWithProjects[]>('/admin/users')
      .then(us => setUsers(us.map(u => ({ ...u, expanded: false }))))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const toggleActive = async (userId: number, active: boolean) => {
    await apiFetch(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, active } : u))
  }

  const toggleRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin'
    const label = newRole === 'admin' ? 'hacer admin' : 'quitar admin'
    if (!window.confirm(`¿Seguro que querés ${label} a este usuario?`)) return
    try {
      await apiFetch(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch {
      alert('No se pudo cambiar el rol. Verificá que no te estés quitando tu propio admin.')
    }
  }

  const deleteUser = async (userId: number, name: string) => {
    if (!window.confirm(`¿Eliminar al usuario "${name}"? Esta acción no se puede deshacer.`)) return
    try {
      await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' })
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch {
      alert('No se pudo eliminar el usuario.')
    }
  }

  const toggleExpanded = async (userId: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u
      if (!u.expanded && !u.projects) {
        // load projects
        apiFetch<Project[]>('/projects', { method: 'GET' }).then(all => {
          const mine = all.filter(p => p.client_id === userId)
          setUsers(prev2 => prev2.map(u2 => u2.id === userId ? { ...u2, projects: mine, expanded: true } : u2))
        }).catch(() => {})
        return { ...u, expanded: true }
      }
      return { ...u, expanded: !u.expanded }
    }))
  }

  // Load projects for all users initially (admin endpoint should provide project count)
  useEffect(() => {
    apiFetch<Project[]>('/projects').then(allProjects => {
      setUsers(prev => prev.map(u => ({
        ...u,
        projects: allProjects.filter(p => p.client_id === u.id),
      })))
    }).catch(() => {})
  }, [users.length]) // run once when users are loaded

  const PER_PAGE = 5
  const q = search.trim().toLowerCase()
  const filtered = users.filter(
    u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageUsers = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Clientes</h1>
        <p className="page-subtitle">Cuentas registradas y sus proyectos.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="panel-input panel-input-icon"
          placeholder="Buscar por nombre o email..."
        />
      </div>

      {/* Client cards */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="panel-card text-center py-12">
            <p className="text-slate-400">No hay clientes registrados</p>
          </div>
        ) : pageUsers.length === 0 ? (
          <div className="panel-card text-center py-12">
            <p className="text-slate-400">No se encontraron clientes con ese filtro</p>
          </div>
        ) : (
          pageUsers.map(u => (
            <div key={u.id} className="panel-card overflow-hidden">
              {/* Client header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{u.name}</p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Alta: {fmtDate(u.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Proyectos</p>
                    <p className="text-xl font-bold text-slate-900">{u.projects?.length ?? u.project_count ?? 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Activa</span>
                    <Toggle on={u.active} onToggle={() => toggleActive(u.id, !u.active)} />
                  </div>
                  <button
                    onClick={() => toggleRole(u.id, u.role)}
                    className={`btn-outline text-xs py-1.5 px-3 ${u.role === 'admin' ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : ''}`}
                  >
                    {u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                  </button>
                  <button
                    onClick={() => toggleExpanded(u.id)}
                    className="btn-outline text-xs py-1.5"
                  >
                    {u.expanded ? 'Ocultar' : 'Ver proyectos'}
                  </button>
                  <button
                    onClick={() => deleteUser(u.id, u.name)}
                    className="btn-outline text-xs py-1.5 px-3 text-red-500 border-red-200 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Projects sub-list */}
              {u.expanded && u.projects && u.projects.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {u.projects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => navigate({ to: `/projects/${p.id}` })}
                      className="flex items-center justify-between gap-4 py-2.5 px-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <StatusBadge status={p.status} />
                        <p className="text-sm text-slate-800 truncate">{p.title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {p.admin_price != null && (
                          <span className="text-sm text-slate-500">
                            $ {p.admin_price.toLocaleString('es-AR')} · {fmtDate(p.updated_at)}
                          </span>
                        )}
                        {p.admin_price == null && (
                          <span className="text-sm text-slate-400">{fmtDate(p.updated_at)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {u.expanded && u.projects?.length === 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-400 text-center py-2">Sin proyectos</p>
                </div>
              )}
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
          )} de ${filtered.length} clientes`}
        />
      )}
    </div>
  )
}
