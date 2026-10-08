import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { apiFetch, apiUpload } from '../../lib/api'
import type { CardCategoryItem, CardDesignItem, User } from '../../types'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, X, Loader2, ExternalLink, ImageUp, ChevronUp, ChevronDown, CreditCard } from 'lucide-react'

export const Route = createFileRoute('/(panel)/tarjetas')({
  component: TarjetasPage,
})

const TAG_STYLES: Record<string, string> = {
  Popular: 'bg-violet-600 text-white',
  Nuevo: 'bg-emerald-600 text-white',
  Elegante: 'bg-[#7C4E36] text-[#FDFBF7]',
  Premium: 'bg-indigo-600 text-white',
  Minimal: 'bg-zinc-800 text-white',
}

const KNOWN_TAGS = ['Popular', 'Nuevo', 'Elegante', 'Premium', 'Minimal']

interface SavePayload {
  name: string
  demoUrl: string
  categoryId: number | null
  newCategory: string
  tag: string
  discount: string
  file: File | null
}

function TarjetasPage() {
  const [designs, setDesigns] = useState<CardDesignItem[]>([])
  const [categories, setCategories] = useState<CardCategoryItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CardDesignItem | null>(null)

  const load = async () => {
    const [ds, cats] = await Promise.all([
      apiFetch<CardDesignItem[]>('/admin/card-catalog/designs'),
      apiFetch<CardCategoryItem[]>('/admin/card-catalog/categories'),
    ])
    setDesigns(ds)
    setCategories(cats)
  }

  useEffect(() => {
    apiFetch<User>('/auth/me').then(u => {
      setUser(u)
      load()
        .catch(() => toast.error('No se pudo cargar el catálogo'))
        .finally(() => setLoading(false))
    })
  }, [])

  const existingTags = useMemo(() => {
    const set = new Set(KNOWN_TAGS)
    designs.forEach(d => {
      if (d.tag) set.add(d.tag)
    })
    return [...set].sort()
  }, [designs])

  const save = async (data: SavePayload) => {
    let categoryId = data.categoryId
    if (data.newCategory.trim()) {
      const cat = await apiFetch<CardCategoryItem>('/admin/card-catalog/categories', {
        method: 'POST',
        body: JSON.stringify({ name: data.newCategory.trim() }),
      })
      categoryId = cat.id
      setCategories(prev => [...prev, cat])
    }
    if (categoryId == null) {
      toast.error('Elegí una categoría')
      return
    }

    const payload = {
      name: data.name.trim(),
      category_id: categoryId,
      tag: data.tag.trim() || null,
      discount_label: data.discount.trim() || null,
      demo_url: data.demoUrl.trim() || null,
    }

    let design: CardDesignItem
    if (editing) {
      design = await apiFetch<CardDesignItem>(`/admin/card-catalog/designs/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } else {
      design = await apiFetch<CardDesignItem>('/admin/card-catalog/designs', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    }

    if (data.file) {
      await apiUpload(`/admin/card-catalog/designs/${design.id}/image`, data.file)
    }

    toast.success(editing ? 'Tarjeta actualizada' : 'Tarjeta subida al catálogo')
    setModalOpen(false)
    setEditing(null)
    await load()
  }

  const remove = async (d: CardDesignItem) => {
    if (!confirm(`¿Eliminar "${d.name}" del catálogo?`)) return
    await apiFetch(`/admin/card-catalog/designs/${d.id}`, { method: 'DELETE' })
    toast.success('Tarjeta eliminada')
    load()
  }

  const [reordering, setReordering] = useState(false)

  const moveCategory = async (index: number, dir: -1 | 1) => {
    if (reordering) return
    const target = index + dir
    if (target < 0 || target >= categories.length) return
    const next = [...categories]
    ;[next[index], next[target]] = [next[target], next[index]]
    setCategories(next)
    setReordering(true)
    try {
      await apiFetch('/admin/card-catalog/categories/reorder', {
        method: 'POST',
        body: JSON.stringify({ order: next.map(c => c.id) }),
      })
    } catch {
      toast.error('No se pudo reordenar las categorías')
      load()
    } finally {
      setReordering(false)
    }
  }

  const moveDesign = async (index: number, dir: -1 | 1) => {
    if (reordering) return
    const target = index + dir
    if (target < 0 || target >= designs.length) return
    // Solo se reordena dentro de la misma categoría
    if (designs[target].category_id !== designs[index].category_id) return
    const next = [...designs]
    ;[next[index], next[target]] = [next[target], next[index]]
    setDesigns(next)
    setReordering(true)
    try {
      await apiFetch('/admin/card-catalog/designs/reorder', {
        method: 'POST',
        body: JSON.stringify({ order: next.map(d => d.id) }),
      })
    } catch {
      toast.error('No se pudo reordenar las tarjetas')
      load()
    } finally {
      setReordering(false)
    }
  }

  if (user && user.role !== 'admin') {
    return <div className="max-w-3xl mx-auto panel-card text-center py-12 text-slate-400">Sin acceso</div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Tarjetas digitales</h1>
          <p className="page-subtitle">
            Subí las invitaciones que creaste: aparecen automáticamente en la web.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" /> Nueva tarjeta
        </button>
      </div>

      {/* Orden de categorías (se ve en la web) */}
      {!loading && categories.length > 0 && (
        <div className="panel-card">
          <h2 className="text-sm font-bold text-slate-700">Orden de categorías</h2>
          <p className="text-xs text-slate-400 mt-0.5 mb-3">
            Así aparecen las categorías en la web. Mové con las flechas.
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c, i) => (
              <div
                key={c.id}
                className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-white pl-3.5 pr-1 py-1 shadow-sm"
              >
                <span className="text-xs font-semibold text-slate-700 mr-1">{c.name}</span>
                <button
                  onClick={() => moveCategory(i, -1)}
                  disabled={reordering || i === 0}
                  className="p-1 rounded-full text-slate-400 hover:text-violet-600 hover:bg-violet-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Mover arriba"
                  aria-label={`Mover ${c.name} arriba`}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveCategory(i, 1)}
                  disabled={reordering || i === categories.length - 1}
                  className="p-1 rounded-full text-slate-400 hover:text-violet-600 hover:bg-violet-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Mover abajo"
                  aria-label={`Mover ${c.name} abajo`}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando...</div>
      ) : designs.length === 0 ? (
        <div className="panel-card text-center py-14">
          <span className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7" />
          </span>
          <p className="text-slate-400 mb-4 text-sm">Todavía no subiste tarjetas al catálogo</p>
          <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Subir la primera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {designs.map((d, i) => {
            const canMoveUp = i > 0 && designs[i - 1].category_id === d.category_id
            const canMoveDown = i < designs.length - 1 && designs[i + 1].category_id === d.category_id
            return (
              <div key={d.id} className="panel-card p-3 flex flex-col gap-3">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100">
                  {d.image_url ? (
                    <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageUp className="w-8 h-8" />
                    </div>
                  )}
                  {d.discount_label && (
                    <div className="absolute top-1.5 right-[-40px] z-30 rotate-45 w-[160px] py-0.5 text-center bg-gradient-to-r from-red-600 via-rose-500 to-fuchsia-600 text-white text-[9px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis shadow ring-1 ring-white/30 pointer-events-none">
                      {d.discount_label}
                    </div>
                  )}
                  {d.tag && (
                    <span
                      className={`absolute top-2 left-2 text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md ${TAG_STYLES[d.tag] || 'bg-violet-600 text-white'}`}
                    >
                      {d.tag}
                    </span>
                  )}
                  {!d.active && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white">
                      Oculto
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{d.name}</p>
                  <p className="text-xs text-slate-400 truncate">{d.category?.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  {/* Reordenar dentro de la categoría */}
                  <div className="flex flex-col mr-0.5">
                    <button
                      onClick={() => moveDesign(i, -1)}
                      disabled={reordering || !canMoveUp}
                      className="p-0.5 text-slate-400 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Mover arriba"
                      aria-label={`Mover ${d.name} arriba`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDesign(i, 1)}
                      disabled={reordering || !canMoveDown}
                      className="p-0.5 text-slate-400 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Mover abajo"
                      aria-label={`Mover ${d.name} abajo`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {d.demo_url && (
                    <a
                      href={d.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-xs py-1.5 px-2.5"
                      title="Abrir la invitación"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Ver
                    </a>
                  )}
                  <button
                    onClick={() => { setEditing(d); setModalOpen(true) }}
                    className="btn-outline text-xs py-1.5 px-2.5 ml-auto"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => remove(d)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <DesignModal
        open={modalOpen}
        editing={editing}
        categories={categories}
        existingTags={existingTags}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={save}
      />

    </div>
  )
}

function DesignModal({ open,
  editing,
  categories,
  existingTags,
  onClose,
  onSave,
}: {
  open: boolean
  editing: CardDesignItem | null
  categories: CardCategoryItem[]
  existingTags: string[]
  onClose: () => void
  onSave: (data: SavePayload) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [newCategory, setNewCategory] = useState('')
  const [tag, setTag] = useState('')
  const [customTag, setCustomTag] = useState('')
  const [discount, setDiscount] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  // Libera el object URL del preview al cerrar el modal
  useEffect(() => {
    if (!open && objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name)
      setDemoUrl(editing.demo_url || '')
      setCategoryId(String(editing.category_id))
      setNewCategory('')
      setTag(editing.tag || '')
      setCustomTag('')
      setDiscount(editing.discount_label || '')
      setFile(null)
      setPreview(editing.image_url)
    } else {
      setName('')
      setDemoUrl('')
      setCategoryId(categories[0] ? String(categories[0].id) : '')
      setNewCategory('')
      setTag('')
      setCustomTag('')
      setDiscount('')
      setFile(null)
      setPreview(null)
    }
  }, [open, editing, categories])

  if (!open) return null

  const applyImage = (f: File) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(f)
    objectUrlRef.current = url
    setFile(f)
    setPreview(url)
  }

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    applyImage(f)
  }

  // Permite pegar la imagen directo (captura de pantalla con Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile()
        if (!blob) continue
        e.preventDefault()
        applyImage(new File([blob], blob.name || 'captura.png', { type: blob.type }))
        return
      }
    }
  }

  const effectiveTag = tag === '__custom__' ? customTag : tag

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({
        name,
        demoUrl,
        categoryId: categoryId === '' || categoryId === '__new__' ? null : Number(categoryId),
        newCategory,
        tag: effectiveTag,
        discount,
        file,
      })
    } catch {
      toast.error('No se pudo guardar la tarjeta')
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
            {editing ? 'Editar tarjeta' : 'Subir tarjeta digital'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} onPaste={handlePaste} className="px-6 py-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre de la tarjeta</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="panel-input"
              placeholder="Ej: Boda Julieta y Riso"
              autoFocus
              required
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">URL de la invitación</label>
            <input
              value={demoUrl}
              onChange={e => setDemoUrl(e.target.value)}
              className="panel-input"
              placeholder="https://...lovable.app/"
              type="url"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="panel-input"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="__new__">+ Crear categoría nueva...</option>
            </select>
            {categoryId === '__new__' && (
              <input
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="panel-input mt-2"
                placeholder="Nombre de la nueva categoría"
              />
            )}
          </div>

          {/* Etiqueta */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Etiqueta (opcional)</label>
            <select value={tag} onChange={e => setTag(e.target.value)} className="panel-input">
              <option value="">Sin etiqueta</option>
              {existingTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="__custom__">+ Otra etiqueta...</option>
            </select>
            {tag === '__custom__' && (
              <input
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                className="panel-input mt-2"
                placeholder="Ej: Exclusiva"
              />
            )}
          </div>

          {/* Descuento / promo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tira de descuento / promo (opcional)
            </label>
            <input
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              className="panel-input"
              placeholder='Ej: -20% NAVIDAD'
              maxLength={100}
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Si lo completás, se muestra una tira inclinada tipo moño en la esquina de la tarjeta
              en la web. Dejalo vacío para quitarla.
            </p>
            {discount.trim() && (
              <div className="mt-2 relative w-28 h-24 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <div className="absolute top-1 right-[-38px] z-30 rotate-45 w-[130px] py-0.5 text-center bg-gradient-to-r from-red-600 via-rose-500 to-fuchsia-600 text-white text-[8px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis shadow ring-1 ring-white/30">
                  {discount}
                </div>
              </div>
            )}
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Imagen de preview</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-28 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                {preview ? (
                  <img src={preview} alt="Preview de la tarjeta" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageUp className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
                <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline text-xs py-2">
                  {file ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </button>
                {file && <p className="text-xs text-emerald-600 font-medium">Imagen seleccionada: {file.name}</p>}
                {editing?.image_url && !file && (
                  <p className="text-xs text-slate-400">Tiene una imagen actual</p>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Podés pegar la captura directo: copiá la imagen y presioná <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold">V</kbd> dentro del formulario.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="btn-primary rounded-lg px-6 disabled:opacity-50"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : editing ? 'Guardar cambios' : 'Subir tarjeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
