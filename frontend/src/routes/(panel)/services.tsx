import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { Service } from '../../types'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

export const Route = createFileRoute('/(panel)/services')({
  component: ServicesPage,
})


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

interface ServiceForm {
  name: string
  slug: string
  description: string
  base_price: number
  icon: string
  features: string
  order: number
  supports_maintenance: boolean
  active: boolean
}

const emptyForm = (): ServiceForm => ({
  name: '',
  slug: '',
  description: '',
  base_price: 0,
  icon: 'Package',
  features: '',
  order: 1,
  supports_maintenance: false,
  active: true,
})

function ServiceModal({
  open,
  onClose,
  initial,
  onSave,
  title,
}: {
  open: boolean
  onClose: () => void
  initial: ServiceForm
  onSave: (f: ServiceForm) => Promise<void>
  title: string
}) {
  const [form, setForm] = useState<ServiceForm>(initial)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setForm(initial) }, [initial, open])

  if (!open) return null

  const set = (k: keyof ServiceForm, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre</label>
              <input
                value={form.name}
                onChange={e => {
                  set('name', e.target.value)
                  if (!form.slug) set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))
                }}
                className="panel-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug</label>
              <input
                value={form.slug}
                onChange={e => set('slug', e.target.value)}
                className="panel-input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              className="panel-input resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Precio base (ARS)</label>
              <input
                type="number"
                value={form.base_price}
                onChange={e => set('base_price', Number(e.target.value))}
                className="panel-input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Features <span className="text-slate-400 font-normal">(uno por línea)</span>
            </label>
            <textarea
              value={form.features}
              onChange={e => set('features', e.target.value)}
              rows={4}
              className="panel-input resize-none"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Orden</label>
            <input
              type="number"
              value={form.order}
              onChange={e => set('order', Number(e.target.value))}
              className="panel-input"
            />
          </div>

          <div className="flex items-center gap-3">
            <Toggle on={form.supports_maintenance} onToggle={() => set('supports_maintenance', !form.supports_maintenance)} />
            <span className="text-sm text-slate-700">Soporta mantenimiento</span>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary rounded-lg px-6">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Service | null>(null)

  const load = () => apiFetch<Service[]>('/services').then(setServices)
  useEffect(() => { load() }, [])

  const toggleActive = async (s: Service) => {
    await apiFetch(`/services/${s.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: !s.active }),
    })
    setServices(prev => prev.map(x => x.id === s.id ? { ...x, active: !s.active } : x))
  }

  const deleteService = async (id: number) => {
    if (!confirm('¿Eliminar este servicio?')) return
    await apiFetch(`/services/${id}`, { method: 'DELETE' })
    load()
  }

  const openNew = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditTarget(s)
    setModalOpen(true)
  }

  const handleSave = async (form: ServiceForm) => {
    const payload = {
      ...form,
      features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
    }
    if (editTarget) {
      await apiFetch(`/services/${editTarget.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
    } else {
      await apiFetch('/services', { method: 'POST', body: JSON.stringify(payload) })
    }
    setModalOpen(false)
    load()
  }

  const initialForm = (): ServiceForm => {
    if (!editTarget) return emptyForm()
    return {
      name: editTarget.name,
      slug: editTarget.slug,
      description: editTarget.description,
      base_price: editTarget.base_price,
      icon: editTarget.icon || 'Package',
      features: (editTarget.features || []).join('\n'),
      order: editTarget.order,
      supports_maintenance: editTarget.supports_maintenance,
      active: editTarget.active,
    }
  }

  const sorted = [...services].sort((a, b) => a.order - b.order)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Servicios</h1>
          <p className="page-subtitle">Editá el catálogo que ven los clientes.</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map(s => (
          <div key={s.id} className="panel-card">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <span className="text-violet-600 font-bold text-lg">{s.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">{s.name}</p>
                  {s.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{s.description}</p>
                  )}
                </div>
              </div>
              <Toggle on={s.active} onToggle={() => toggleActive(s)} />
            </div>

            <p className="text-sm font-semibold text-slate-700 mb-2">
              {s.base_price > 0
                ? `Desde $ ${s.base_price.toLocaleString('es-AR')}`
                : 'Desde A consultar'}
            </p>

            {s.features && s.features.length > 0 && (
              <ul className="space-y-1 mb-3">
                {s.features.map((f, i) => (
                  <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                    <span className="text-violet-400 mt-0.5 shrink-0">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => openEdit(s)}
                className="btn-outline text-xs py-1.5 px-3"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </button>
              <button
                onClick={() => deleteService(s.id)}
                className="btn-outline text-xs py-1.5 px-3 text-red-500 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <ServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={initialForm()}
        onSave={handleSave}
        title={editTarget ? 'Editar servicio' : 'Nuevo servicio'}
      />
    </div>
  )
}
