import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { FinanceEntry, MonthlyExpense, User } from '../../types'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, X, TrendingUp, TrendingDown, Loader2, ChevronDown, ChevronsDown, ChevronsUp, Receipt } from 'lucide-react'

export const Route = createFileRoute('/(panel)/finanzas')({
  component: FinanzasPage,
})

const MONTHS_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function fmt(n: number) {
  return '$ ' + n.toLocaleString('es-AR')
}

function fmtDayMonth(d: string) {
  const [, m, day] = d.split('-')
  return `${parseInt(day)}/${parseInt(m)}`
}

function monthLabel(key: string) {
  const [y, m] = key.split('-')
  return `${MONTHS_FULL[parseInt(m) - 1]} ${y}`
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}

interface Row {
  entry: FinanceEntry
  running: number
}

interface MonthGroup {
  key: string
  label: string
  rows: Row[]
  income: number
  expense: number
}

/* ─── Monthly expenses modal ─── */
function MonthlyExpensesModal({
  open,
  onClose,
  currentMonth,
  onRefresh,
}: {
  open: boolean
  onClose: () => void
  currentMonth: string
  onRefresh?: () => void
}) {
  const [allExpenses, setAllExpenses] = useState<MonthlyExpense[]>([])
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [serviceName, setServiceName] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(todayISO())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    setSelectedMonth(currentMonth)
    setLoading(true)
    apiFetch<MonthlyExpense[]>('/monthly-expenses').then(data => {
      setAllExpenses(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [open, currentMonth])

  // Filter expenses for selected month
  const expenses = allExpenses.filter(e => e.month_key === selectedMonth)

  // Get unique months with expenses (sorted desc)
  const availableMonths = useMemo(() => {
    const map = new Map<string, number>()
    allExpenses.forEach(e => {
      map.set(e.month_key, (map.get(e.month_key) || 0) + e.amount)
    })
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
  }, [allExpenses])

  // Always include current month even if empty
  const allMonths = useMemo(() => {
    const keys = new Set(availableMonths.map(([k]) => k))
    if (!keys.has(currentMonth)) {
      return [[currentMonth, 0] as const, ...availableMonths]
    }
    return availableMonths
  }, [availableMonths, currentMonth])

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = Number(amount)
    if (!serviceName.trim() || !value || value <= 0) return
    setSaving(true)
    try {
      const created = await apiFetch<MonthlyExpense>('/monthly-expenses', {
        method: 'POST',
        body: JSON.stringify({
          service_name: serviceName.trim(),
          amount: value,
          payment_date: paymentDate,
        }),
      })
      setAllExpenses(prev => [created, ...prev])
      setServiceName('')
      setAmount('')
      setPaymentDate(todayISO())
      toast.success('Gasto registrado')
      onRefresh?.()
    } finally {
      setSaving(false)
    }
  }

  const removeExpense = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return
    await apiFetch(`/monthly-expenses/${id}`, { method: 'DELETE' })
    setAllExpenses(prev => prev.filter(e => e.id !== id))
    toast.success('Gasto eliminado')
    onRefresh?.()
  }

  if (!open) return null

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Gastos del mes</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month selector mini cards */}
        <div className="px-6 pt-4 pb-3 shrink-0">
          <p className="text-xs font-medium text-slate-400 mb-2">Seleccioná un mes</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allMonths.map(([mk, totalAmt]) => (
              <button
                key={mk}
                type="button"
                onClick={() => setSelectedMonth(mk)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                  selectedMonth === mk
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                }`}
              >
                <span className="block">{monthLabel(mk)}</span>
                <span className={`block text-[10px] mt-0.5 ${selectedMonth === mk ? 'text-amber-500' : 'text-slate-400'}`}>
                  {totalAmt > 0 ? fmt(totalAmt) : 'Sin gastos'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={addExpense} className="px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-5">
              <label className="block text-xs font-medium text-slate-500 mb-1">Servicio</label>
              <input
                value={serviceName}
                onChange={e => setServiceName(e.target.value)}
                className="panel-input text-sm"
                placeholder="Ej: Hosting, Dominio..."
                required
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-slate-500 mb-1">Monto</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="panel-input text-sm"
                placeholder="$"
                required
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-slate-500 mb-1">Fecha de pago</label>
              <input
                type="date"
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="panel-input text-sm"
                required
              />
            </div>
            <div className="col-span-1">
              <button
                type="submit"
                disabled={saving || !serviceName.trim() || !amount || Number(amount) <= 0}
                className="btn-primary h-9 px-3 text-sm disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </form>

        {/* Table */}
        <div className="px-6 py-4 overflow-auto flex-1 min-h-0">
          {loading ? (
            <p className="text-center text-slate-400 text-sm py-6">Cargando...</p>
          ) : expenses.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-6">Sin gastos este mes</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-semibold">Servicio</th>
                  <th className="pb-2 font-semibold text-right">Monto</th>
                  <th className="pb-2 font-semibold text-right">Fecha</th>
                  <th className="pb-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id} className="group border-b border-slate-50">
                    <td className="py-2.5 text-slate-800 font-medium">{exp.service_name}</td>
                    <td className="py-2.5 text-right text-amber-500 font-semibold">{fmt(exp.amount)}</td>
                    <td className="py-2.5 text-right text-slate-500">{fmtDayMonth(exp.payment_date)}</td>
                    <td className="py-2.5">
                      <button
                        onClick={() => removeExpense(exp.id, exp.service_name)}
                        className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200">
                  <td className="py-2.5 font-bold text-slate-900">Total</td>
                  <td className="py-2.5 text-right font-bold text-amber-500">{fmt(total)}</td>
                  <td />
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Entry form modal ─── */
function EntryModal({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean
  editing: FinanceEntry | null
  onClose: () => void
  onSave: (data: { date: string; description: string; income: number | null; expense: number | null }) => Promise<void>
}) {
  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('income')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setDate(editing.date)
      setDescription(editing.description)
      setType(editing.income ? 'income' : 'expense')
      setAmount(String(editing.income || editing.expense || ''))
    } else {
      setDate(todayISO())
      setDescription('')
      setType('income')
      setAmount('')
    }
  }, [open, editing])

  if (!open) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = Number(amount)
    if (!description.trim() || !value || value <= 0) return
    setSaving(true)
    try {
      await onSave({
        date,
        description: description.trim(),
        income: type === 'income' ? value : null,
        expense: type === 'expense' ? value : null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">
            {editing ? 'Editar movimiento' : 'Registrar movimiento'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="panel-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="panel-input"
              placeholder="Ej: adq. de dominio, pago cliente, hosting..."
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  type === 'income'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Ingreso
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : 'border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                <TrendingDown className="w-4 h-4" /> Egreso
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto (ARS)</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="panel-input"
              placeholder="0"
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !description.trim() || !amount || Number(amount) <= 0}
              className="btn-primary rounded-lg px-6 disabled:opacity-50"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : editing ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Page ─── */
function FinanzasPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FinanceEntry | null>(null)
  const [gastosOpen, setGastosOpen] = useState(false)

  useEffect(() => {
    apiFetch<User>('/auth/me').then(u => {
      if (u.role !== 'admin') {
        navigate({ to: '/dashboard' })
        return
      }
      setUser(u)
      Promise.all([
        apiFetch<FinanceEntry[]>('/finances'),
        apiFetch<MonthlyExpense[]>('/monthly-expenses'),
      ]).then(([e, me]) => { setEntries(e); setMonthlyExpenses(me) }).finally(() => setLoading(false))
    })
  }, [])

  const load = () => apiFetch<FinanceEntry[]>('/finances').then(setEntries)

  const groups = useMemo<MonthGroup[]>(() => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    let running = 0
    const map = new Map<string, MonthGroup>()
    for (const e of sorted) {
      running += (e.income || 0) - (e.expense || 0)
      const key = e.date.slice(0, 7)
      const group = map.get(key) || { key, label: monthLabel(key), rows: [], income: 0, expense: 0 }
      group.rows.push({ entry: e, running })
      group.income += e.income || 0
      group.expense += e.expense || 0
      map.set(key, group)
    }
    return [...map.values()]
  }, [entries])

  const now = new Date()
  const monthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  const monthIncome = entries.filter(e => e.date.startsWith(monthKey)).reduce((s, e) => s + (e.income || 0), 0)
  const monthExpense = entries.filter(e => e.date.startsWith(monthKey)).reduce((s, e) => s + (e.expense || 0), 0)

  // Meses colapsables: por defecto solo queda abierto el mes actual
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set())
  const [userTouched, setUserTouched] = useState(false)

  const defaultOpen = () => {
    const set = new Set<string>()
    if (groups.some(g => g.key === monthKey)) set.add(monthKey)
    else if (groups.length) set.add(groups[groups.length - 1].key)
    return set
  }

  useEffect(() => {
    if (groups.length === 0 || userTouched) return
    setOpenMonths(prev => (prev.size > 0 ? prev : defaultOpen()))
  }, [groups])

  const isOpen = (key: string) => openMonths.has(key)
  const toggleMonth = (key: string) => {
    setUserTouched(true)
    setOpenMonths(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const expandAll = () => {
    setUserTouched(true)
    setOpenMonths(new Set(groups.map(g => g.key)))
  }

  const collapseAll = () => {
    setUserTouched(true)
    setOpenMonths(defaultOpen())
  }

  const lastGroup = groups[groups.length - 1]
  const finalRunning = lastGroup ? lastGroup.rows[lastGroup.rows.length - 1].running : 0

  const save = async (data: { date: string; description: string; income: number | null; expense: number | null }) => {
    if (editing) {
      await apiFetch(`/finances/${editing.id}`, { method: 'PATCH', body: JSON.stringify(data) })
      toast.success('Movimiento actualizado')
    } else {
      await apiFetch('/finances', { method: 'POST', body: JSON.stringify(data) })
      toast.success('Movimiento registrado')
    }
    setModalOpen(false)
    setEditing(null)
    load()
  }

  const remove = async (id: number, description: string) => {
    if (!confirm(`¿Eliminar "${description}"?`)) return
    await apiFetch(`/finances/${id}`, { method: 'DELETE' })
    toast.success('Movimiento eliminado')
    load()
  }

  if (!user) return <div className="text-center py-16 text-slate-400">Cargando...</div>

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Finanzas</h1>
          <p className="page-subtitle">Registrá ingresos y egresos de forma simple, mes a mes.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setGastosOpen(true)} className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-amber-400 text-amber-600 font-medium text-sm hover:bg-amber-50 transition-colors">
            <Receipt className="w-4 h-4" />
            Gastos del mes
          </button>
          <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary shrink-0">
            <Plus className="w-4 h-4" />
            Registrar movimiento
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel-card">
          <p className="text-sm text-slate-500">Ingresos del mes</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{fmt(monthIncome)}</p>
        </div>
        <div className="panel-card">
          <p className="text-sm text-slate-500">Egresos del mes</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{fmt(monthExpense)}</p>
        </div>
        <div className="panel-card">
          <p className="text-sm text-slate-500">Gastos del mes</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{fmt(monthlyExpenses.filter(e => e.month_key === monthKey).reduce((s, e) => s + e.amount, 0))}</p>
        </div>
        <div className="panel-card bg-violet-50/40 border-violet-200">
          <p className="text-sm text-slate-500">Saldo acumulado</p>
          <p className={`text-2xl font-bold mt-1 ${finalRunning >= 0 ? 'text-slate-900' : 'text-red-500'}`}>
            {fmt(finalRunning)}
          </p>
        </div>
      </div>

      {/* Ledger */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando...</div>
      ) : entries.length === 0 ? (
        <div className="panel-card text-center py-14">
          <p className="text-3xl mb-3">📒</p>
          <p className="text-slate-400 mb-4 text-sm">Todavía no registraste movimientos</p>
          <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary">
            <Plus className="w-4 h-4" />
            Registrar el primero
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Ledger toolbar */}
          {groups.length > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-slate-400">Libro contable · {groups.length} meses</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={expandAll}
                  className="text-xs font-medium text-violet-600 hover:text-violet-800 px-2.5 py-1.5 rounded-lg hover:bg-violet-50 transition-colors flex items-center gap-1"
                >
                  <ChevronsDown className="w-3.5 h-3.5" /> Expandir todos
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
                >
                  <ChevronsUp className="w-3.5 h-3.5" /> Contraer todo
                </button>
              </div>
            </div>
          )}

          {/* Single card with collapsible months */}
          <div className="panel-card overflow-hidden p-0">
            {groups.map((g, i) => (
              <div key={g.key} className={i < groups.length - 1 ? 'border-b border-slate-100' : ''}>
                {/* Month header (collapsible) */}
                <button
                  type="button"
                  onClick={() => toggleMonth(g.key)}
                  aria-expanded={isOpen(g.key)}
                  className="w-full bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-3 flex items-center justify-between text-white text-left"
                >
                  <span className="flex items-center gap-3">
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${isOpen(g.key) ? 'rotate-180' : ''}`} />
                    <span className="font-bold text-lg tracking-wide">{g.label}</span>
                    <span className="text-xs font-semibold bg-white/20 rounded-full px-2.5 py-0.5">
                      {g.rows.length} mov.
                    </span>
                  </span>
                  <span className="text-sm text-white/90">
                    <span className="text-white/70">Ingresos {fmt(g.income)}</span>
                    <span className="mx-2 text-white/40">·</span>
                    <span className="text-white/70">Egresos {fmt(g.expense)}</span>
                  </span>
                </button>

                {/* Table */}
                {isOpen(g.key) && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                          <th className="px-5 py-2.5 font-semibold w-24">Fecha</th>
                          <th className="px-3 py-2.5 font-semibold">Descripción</th>
                          <th className="px-3 py-2.5 font-semibold text-right w-32">Ingreso</th>
                          <th className="px-3 py-2.5 font-semibold text-right w-32">Egreso</th>
                          <th className="px-3 py-2.5 font-semibold text-right w-32">Saldo</th>
                          <th className="px-4 py-2.5 w-20" />
                        </tr>
                      </thead>
                      <tbody>
                        {g.rows.map(({ entry, running }) => (
                          <tr key={entry.id} className="group border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{fmtDayMonth(entry.date)}</td>
                            <td className="px-3 py-3 text-slate-800 font-medium">{entry.description}</td>
                            <td className="px-3 py-3 text-right text-emerald-600 font-semibold whitespace-nowrap">
                              {entry.income ? fmt(entry.income) : '—'}
                            </td>
                            <td className="px-3 py-3 text-right text-red-500 font-semibold whitespace-nowrap">
                              {entry.expense ? fmt(entry.expense) : '—'}
                            </td>
                            <td className={`px-3 py-3 text-right font-bold whitespace-nowrap ${running < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                              {running < 0 ? '−' : ''}{fmt(Math.abs(running))}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
                                <button
                                  onClick={() => { setEditing(entry); setModalOpen(true) }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                  title="Editar"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => remove(entry.id, entry.description)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {/* Month subtotal/Saldo */}
                        <tr className="bg-slate-50">
                          <td className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Saldo {g.label}</td>
                          <td />
                          <td className="px-3 py-3 text-right text-emerald-600 font-bold whitespace-nowrap">{fmt(g.income)}</td>
                          <td className="px-3 py-3 text-right text-red-500 font-bold whitespace-nowrap">{fmt(g.expense)}</td>
                          <td className={`px-3 py-3 text-right font-bold whitespace-nowrap ${g.rows[g.rows.length - 1].running < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                            {fmt(g.rows[g.rows.length - 1].running)}
                          </td>
                          <td />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <EntryModal
        open={modalOpen}
        editing={editing}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={save}
      />

      <MonthlyExpensesModal
        open={gastosOpen}
        onClose={() => setGastosOpen(false)}
        currentMonth={monthKey}
        onRefresh={() => apiFetch<MonthlyExpense[]>('/monthly-expenses').then(setMonthlyExpenses)}
      />
    </div>
  )
}
