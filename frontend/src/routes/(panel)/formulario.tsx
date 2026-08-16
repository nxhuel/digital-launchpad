import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { FormQuestion, User } from '../../types'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, X, Loader2, ChevronUp, ChevronDown, RotateCcw, ClipboardList } from 'lucide-react'

export const Route = createFileRoute('/(panel)/formulario')({
  component: FormularioPage,
})

const ROLE_LABELS: Record<string, string> = {
  title: 'Título del pedido',
  description: 'Descripción',
  reference: 'Referencia',
  detail: 'Detalle (va al chat)',
  images: 'Imágenes (va al chat)',
}

const FIELD_LABELS: Record<string, string> = {
  text: 'Texto corto',
  longtext: 'Texto largo',
  url: 'URL / enlace',
  images: 'Imágenes',
}

const FIELD_OPTIONS: { value: string; label: string }[] = [
  { value: 'text', label: 'Texto corto' },
  { value: 'longtext', label: 'Texto largo' },
  { value: 'url', label: 'URL / enlace' },
  { value: 'images', label: 'Imágenes' },
]

function FormularioPage() {
  const [questions, setQuestions] = useState<FormQuestion[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FormQuestion | null>(null)

  const load = () => {
    apiFetch<FormQuestion[]>('/form-questions')
      .then(setQuestions)
      .catch(() => toast.error('No se pudieron cargar las preguntas'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    apiFetch<User>('/auth/me').then(u => {
      setUser(u)
      load()
    })
  }, [])

  if (user && user.role !== 'admin') {
    return <div className="max-w-3xl mx-auto panel-card text-center py-12 text-slate-400">Sin acceso</div>
  }

  const active = questions.filter(q => q.active)
  const hidden = questions.filter(q => !q.active)

  const move = async (index: number, dir: -1 | 1) => {
    if (reordering) return
    const target = index + dir
    if (target < 0 || target >= active.length) return
    const next = [...active]
    ;[next[index], next[target]] = [next[target], next[index]]
    setQuestions([...next, ...hidden])
    setReordering(true)
    try {
      const ordered = await apiFetch<FormQuestion[]>('/form-questions/reorder', {
        method: 'POST',
        body: JSON.stringify({ order: next.map(q => q.id) }),
      })
      setQuestions(ordered)
    } catch {
      toast.error('No se pudo reordenar')
      load()
    } finally {
      setReordering(false)
    }
  }

  const remove = async (q: FormQuestion) => {
    if (!confirm(`¿Ocultar la pregunta "${q.text.slice(0, 60)}..."? Podés restaurarla después.`)) return
    await apiFetch(`/form-questions/${q.id}`, { method: 'DELETE' })
    toast.success('Pregunta ocultada')
    load()
  }

  const restore = async (q: FormQuestion) => {
    await apiFetch(`/form-questions/${q.id}`, { method: 'PATCH', body: JSON.stringify({ active: true }) })
    toast.success('Pregunta restaurada')
    load()
  }

  const save = async (text: string, fieldType: string) => {
    if (editing) {
      await apiFetch(`/form-questions/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ text: text.trim(), field_type: fieldType }),
      })
      toast.success('Pregunta actualizada')
    } else {
      await apiFetch<FormQuestion>('/form-questions', {
        method: 'POST',
        body: JSON.stringify({ text: text.trim(), field_type: fieldType }),
      })
      toast.success('Pregunta creada')
    }
    setModalOpen(false)
    setEditing(null)
    load()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Formulario de pedidos</h1>
          <p className="page-subtitle">
            Las preguntas que ven tus clientes al pedir una tarjeta digital. Los cambios se
            reflejan al instante en la web.
          </p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" /> Nueva pregunta
        </button>
      </div>

      {/* Nota sobre roles fijos */}
      <div className="rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-xs text-violet-700 leading-relaxed">
        <strong>Título, Descripción y Referencia</strong> se autocompletan en el proyecto.{' '}
        <strong>Detalle e Imágenes</strong> arrancan el chat del pedido. Podés editar su texto,
        reordenarlas y ocultarlas, pero no cambiar su tipo de campo para no romper el flujo.
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando...</div>
      ) : active.length === 0 ? (
        <div className="panel-card text-center py-14">
          <p className="text-3xl mb-3"><ClipboardList className="w-8 h-8 mx-auto text-slate-300" /></p>
          <p className="text-slate-400 mb-4 text-sm">No hay preguntas activas</p>
          <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Crear la primera
          </button>
        </div>
      ) : (
        <div className="panel-card divide-y divide-slate-100">
          {active.map((q, i) => (
            <div key={q.id} className="flex items-center gap-3 py-3 px-1">
              {/* Reordenar */}
              <div className="flex flex-col">
                <button
                  onClick={() => move(i, -1)}
                  disabled={reordering || i === 0}
                  className="p-0.5 text-slate-400 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Mover arriba"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={reordering || i === active.length - 1}
                  className="p-0.5 text-slate-400 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Mover abajo"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="w-5 shrink-0 text-xs font-bold text-slate-300">{i + 1}</span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{q.text}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {q.role && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                      {ROLE_LABELS[q.role] || q.role}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {FIELD_LABELS[q.field_type] || q.field_type}
                  </span>
                  {!q.role && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                      Personalizada
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => { setEditing(q); setModalOpen(true) }}
                className="btn-outline text-xs py-1.5 px-2.5"
                title="Editar"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => remove(q)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Ocultar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ocultas */}
      {hidden.length > 0 && (
        <div className="panel-card">
          <h2 className="text-sm font-bold text-slate-700 mb-1">Ocultas</h2>
          <p className="text-xs text-slate-400 mb-3">No aparecen en el formulario de la web.</p>
          <div className="space-y-2">
            {hidden.map(q => (
              <div key={q.id} className="flex items-center gap-3 border border-slate-100 rounded-lg px-3 py-2 bg-slate-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-500 line-through">{q.text}</p>
                  {q.role && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-200 text-slate-500 mt-0.5 inline-block">
                      {ROLE_LABELS[q.role] || q.role}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => restore(q)}
                  className="btn-outline text-xs py-1.5 px-2.5"
                  title="Restaurar"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <QuestionModal
        open={modalOpen}
        editing={editing}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={save}
      />
    </div>
  )
}

function QuestionModal({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean
  editing: FormQuestion | null
  onClose: () => void
  onSave: (text: string, fieldType: string) => Promise<void>
}) {
  const [text, setText] = useState('')
  const [fieldType, setFieldType] = useState('text')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setText(editing.text)
      setFieldType(editing.field_type)
    } else {
      setText('')
      setFieldType('text')
    }
  }, [open, editing])

  if (!open) return null

  const isRoleLocked = !!editing?.role

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSaving(true)
    try {
      await onSave(text, fieldType)
    } catch {
      toast.error('No se pudo guardar la pregunta')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">
            {editing ? 'Editar pregunta' : 'Nueva pregunta'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Texto de la pregunta</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              className="panel-input resize-none"
              placeholder="¿Qué querés saber del cliente?"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de campo</label>
            <select
              value={fieldType}
              onChange={e => setFieldType(e.target.value)}
              className="panel-input"
              disabled={isRoleLocked}
            >
              {FIELD_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {isRoleLocked && (
              <p className="text-xs text-slate-400 mt-1.5">
                Este campo es fijo porque alimenta el autocompletado del pedido.
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !text.trim()} className="btn-primary rounded-lg px-6 disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
