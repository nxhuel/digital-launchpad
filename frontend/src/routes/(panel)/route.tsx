import { createFileRoute, Outlet, useNavigate, redirect, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getAccessToken, clearTokens, apiFetch } from '../../lib/api'
import type { User, Notification } from '../../types'
import { Bell, LogOut, LayoutDashboard, FolderKanban, Package, Users, Menu, X, ChevronRight, Wallet, CreditCard } from 'lucide-react'
import fondoDashboard from '@/assets/fondo-dashboard.png'

export const Route = createFileRoute('/(panel)')(({
  beforeLoad: () => {
    if (!getAccessToken()) {
      throw redirect({ to: '/login' })
    }
  },
  component: PanelLayout,
}))

function PanelLayout() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: s => s.location.pathname })
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    apiFetch<User>('/auth/me').then(setUser).catch(() => {
      clearTokens()
      navigate({ to: '/login' })
    })
  }, [])

  useEffect(() => {
    if (!user) return
    apiFetch<Notification[]>('/notifications').then(setNotifications)
    const interval = setInterval(() => {
      apiFetch<Notification[]>('/notifications').then(setNotifications)
    }, 15000)
    return () => clearInterval(interval)
  }, [user])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id: number) => {
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await apiFetch('/notifications/read-all', { method: 'POST' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const logout = () => {
    clearTokens()
    navigate({ to: '/' })
  }

  if (!user) return null

  const isAdmin = user.role === 'admin'

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { to: '/projects', label: 'Proyectos', icon: FolderKanban, adminOnly: true },
    { to: '/tarjetas', label: 'Tarjetas digitales', icon: CreditCard, adminOnly: true },
    { to: '/services', label: 'Servicios', icon: Package, adminOnly: true },
    { to: '/users', label: 'Clientes', icon: Users, adminOnly: true },
    { to: '/finanzas', label: 'Finanzas', icon: Wallet, adminOnly: true },
  ]

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen bg-[#f8f8f8] text-slate-900 font-body">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Admin only) */}
      {isAdmin && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#2e1065] border-r border-white/10 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
          {/* Logo */}
          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-900/40 shrink-0">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight font-display leading-tight">Clik Agencia</h1>
                <p className="text-[11px] text-violet-200/70">Panel interno</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.filter(i => !i.adminOnly || isAdmin).map(item => {
              const isActive = pathname === item.to || pathname.startsWith(item.to + '/')
              return (
                <button
                  key={item.to}
                  onClick={() => { navigate({ to: item.to }); setSidebarOpen(false) }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-violet-500/25 text-white border-l-[3px] border-violet-300'
                      : 'text-violet-100/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-200' : 'text-violet-200/70'}`} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* User footer */}
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/15 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-violet-200/70 capitalize">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 lg:px-6 bg-[#2e1065] sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button className="lg:hidden text-violet-100 p-1 hover:text-white transition-colors" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
            )}
            {!isAdmin && (
              <h1 className="text-lg font-bold text-white tracking-tight font-display">Clik Agencia</h1>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg hover:bg-white/10 text-violet-100 hover:text-white transition-colors"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
                    <span className="font-semibold text-sm text-slate-900">Notificaciones</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-violet-600 font-medium hover:text-violet-700">
                          Marcar todas leídas
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-slate-400 text-center">Sin notificaciones</p>
                  ) : (
                    notifications.map(n => (
                      <button
                        key={n.id}
                        onClick={() => {
                          markRead(n.id)
                          if (n.link) navigate({ to: n.link })
                          setNotifOpen(false)
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start gap-2 ${!n.read ? 'bg-violet-50/50' : ''}`}
                      >
                        {!n.read && <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-violet-500" />}
                        <div className={!n.read ? '' : 'pl-3.5'}>
                          <p className="text-sm font-medium text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-violet-100 hover:text-white font-medium px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto p-5 lg:p-8"
          style={{
            backgroundColor: '#f8f8f8',
            backgroundImage: `url(${fondoDashboard})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
