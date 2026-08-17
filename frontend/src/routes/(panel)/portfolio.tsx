import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { PortfolioItem } from '../../types'
import { Plus, Trash2, GripVertical, ExternalLink, Eye, Pencil, X, Check, Globe, Upload } from 'lucide-react'

export const Route = createFileRoute('/(panel)/portfolio')({
  component: PortfolioAdmin,
})

const CATEGORIES = ['Institucional', 'Cafetería', 'Estética', 'Restaurante', 'Tienda', 'Servicios', 'Otro']

function PortfolioAdmin() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [customCategory, setCustomCategory] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = () => apiFetch<PortfolioItem[]>('/portfolio').then(setItems).catch(() => {})
  useEffect(() => { load() }, [])

  const resetForm = () => {
    setTitle(''); setCategory(CATEGORIES[0]); setCustomCategory('')
    setSiteUrl(''); setImageUrl('')
    setEditId(null); setShowForm(false)
  }

  const startEdit = (item: PortfolioItem) => {
    setEditId(item.id)
    setTitle(item.title)
    const isCustom = !CATEGORIES.includes(item.category)
    setCategory(isCustom ? 'Otro' : item.category)
    setCustomCategory(isCustom ? item.category : '')
    setSiteUrl(item.site_url)
    setImageUrl(item.image_url || '')
    setShowForm(true)
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const API_BASE = import.meta.env.VITE_API_URL || '/api'
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${API_BASE}/portfolio/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setImageUrl(data.url)
    } catch {
      alert('No se pudo subir la imagen.')
    }
    setUploading(false)
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          const ext = item.type.split('/')[1] || 'png'
          const renamed = new File([file], `portfolio-${Date.now()}.${ext}`, { type: file.type })
          handleImageUpload(renamed)
        }
        return
      }
    }
  }

  const handleSubmit = async () => {
    const finalCategory = category === 'Otro' && customCategory.trim() ? customCategory.trim() : category
    if (!title.trim() || !siteUrl.trim() || !finalCategory) return
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        category: finalCategory,
        site_url: siteUrl.trim(),
        image_url: imageUrl.trim() || null,
      }
      if (editId) {
        await apiFetch(`/portfolio/${editId}`, { method: 'PATCH', body: JSON.stringify(body) })
      } else {
        await apiFetch('/portfolio', { method: 'POST', body: JSON.stringify({ ...body, order: items.length }) })
      }
      resetForm()
      load()
    } catch {
      alert('No se pudo guardar.')
    }
    setSaving(false)
  }

  const deleteItem = async (id: number, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}" del portfolio?`)) return
    await apiFetch(`/portfolio/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const toggleActive = async (id: number, active: boolean) => {
    await apiFetch(`/portfolio/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) })
    setItems(prev => prev.map(i => i.id === id ? { ...i, active } : i))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Portfolio / Demos</h1>
          <p className="page-subtitle">Trabajos que se muestran en /soluciones-web.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editId ? 'Editar demo' : 'Nueva demo'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Título</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="panel-input" placeholder="Ej: Petshop Luna" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="panel-input">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {category === 'Otro' && (
                <input value={customCategory} onChange={e => setCustomCategory(e.target.value)} className="panel-input mt-2" placeholder="Nombre de la categoría" />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">URL del sitio</label>
              <input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} className="panel-input" placeholder="https://ejemplo.com" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Screenshot / Preview</label>
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg border" />
                  <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-violet-300 transition-colors cursor-pointer"
                  onPaste={handlePaste}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="portfolio-image-upload"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                  />
                  <label htmlFor="portfolio-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    {uploading ? (
                      <p className="text-sm text-slate-400">Subiendo...</p>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-300" />
                        <p className="text-sm text-slate-400">Subí una imagen o pegá un screenshot (Ctrl+V)</p>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">{saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear'}</button>
              <button onClick={resetForm} className="btn-outline">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="panel-card text-center py-12">
            <p className="text-slate-400">No hay demos en el portfolio. ¡Agregá la primera!</p>
          </div>
        ) : items.map(item => (
          <div key={item.id} className={`panel-card flex items-center gap-4 ${!item.active ? 'opacity-50' : ''}`}>
            <div className="text-slate-300 shrink-0">
              <GripVertical className="w-4 h-4" />
            </div>
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="w-20 h-14 object-cover rounded-lg border shrink-0" />
            ) : (
              <div className="w-20 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs shrink-0">
                <Globe className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">{item.title}</p>
              <p className="text-xs text-slate-400">{item.category} · {item.site_url}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500">{item.active ? 'Visible' : 'Oculta'}</span>
              <button onClick={() => toggleActive(item.id, !item.active)} className={`btn-outline text-xs py-1 px-2 ${item.active ? 'text-emerald-600 border-emerald-200' : 'text-slate-400'}`}>
                {item.active ? <Check className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
              <a href={item.site_url} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-1 px-2" onClick={e => e.stopPropagation()}>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button onClick={() => startEdit(item)} className="btn-outline text-xs py-1 px-2">
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={() => deleteItem(item.id, item.title)} className="btn-outline text-xs py-1 px-2 text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
