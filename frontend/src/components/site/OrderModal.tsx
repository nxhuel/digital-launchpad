import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { X, ImageUp, Loader2, Trash2, ExternalLink } from 'lucide-react'
import { apiFetch, apiUpload, getAccessToken } from '../../lib/api'
import { setPendingOrder } from '../../lib/pendingOrder'
import type { FormQuestion, PendingOrder, PendingOrderExchange, PendingOrderImage, Project } from '../../types'

export interface OrderModalPrefill {
  title?: string
  description?: string
  reference?: string
}

interface OrderModalProps {
  open: boolean
  onClose: () => void
  questions: FormQuestion[]
  prefill: OrderModalPrefill | null
  design: { id: number; name: string; category_name?: string; demo_url?: string } | null
  source: 'custom' | 'template'
}

// Respaldo si la API no responde: las 5 preguntas por defecto (misma redacción que el seed)
const FALLBACK_QUESTIONS: FormQuestion[] = [
  { id: -1, role: 'title', field_type: 'text', text: 'Elegí un título para etiquetar tu tarjeta digital', order: 1, active: true },
  { id: -2, role: 'description', field_type: 'longtext', text: 'Da una breve descripción de lo que esperás como resultado', order: 2, active: true },
  { id: -3, role: 'reference', field_type: 'url', text: '¿Tenés alguna referencia web u otra tarjeta digital que te gustaría compartirnos?', order: 3, active: true },
  { id: -4, role: 'detail', field_type: 'longtext', text: 'Si es posible, explicanos de manera detallada todo lo que querés que tenga tu tarjeta digital, mientras más preciso, mejor va a ser el resultado', order: 4, active: true },
  { id: -5, role: 'images', field_type: 'images', text: 'Adjuntá las imágenes que deseas compartir', order: 5, active: true },
]

export function OrderModal({ open, onClose, questions, prefill, design, source }: OrderModalProps) {
  const navigate = useNavigate()
  const effectiveQuestions = questions.length > 0 ? questions : FALLBACK_QUESTIONS

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clave estable por pregunta: las de rol fijo se keyean por rol (sobrevive al
  // cambio fallback → API), las personalizadas por su id real.
  const keyOf = (q: FormQuestion) => (q.role ? `role:${q.role}` : `q:${q.id}`)

  // Reset del formulario cada vez que se abre
  useEffect(() => {
    if (!open) return
    const init: Record<string, string> = {}
    for (const q of effectiveQuestions) {
      if (q.role === 'title') init[keyOf(q)] = prefill?.title ?? ''
      else if (q.role === 'description') init[keyOf(q)] = prefill?.description ?? ''
      else if (q.role === 'reference') init[keyOf(q)] = prefill?.reference ?? ''
      else init[keyOf(q)] = ''
    }
    setAnswers(init)
    setFiles([])
    setPreviews(prev => { prev.forEach(u => URL.revokeObjectURL(u)); return [] })
    setError('')
    setSubmitting(false)
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }, [open])

  // Limpia el timer si el componente se desmonta
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    previews.forEach(u => URL.revokeObjectURL(u))
  }, [])

  if (!open) return null

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? [])
    if (list.length === 0) return
    setFiles(prev => [...prev, ...list])
    setPreviews(prev => [...prev, ...list.map(f => URL.createObjectURL(f))])
  }

  const removeFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => {
      URL.revokeObjectURL(prev[i])
      return prev.filter((_, idx) => idx !== i)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validación: todos los campos activos deben estar completos
    for (const q of effectiveQuestions) {
      if (q.field_type === 'images') {
        if (files.length === 0) {
          setError('Adjuntá al menos una imagen')
          return
        }
      } else if (!(answers[keyOf(q)] ?? '').trim()) {
        setError('Completá todos los campos para poder enviar')
        return
      }
    }
    setError('')
    setSubmitting(true)
    try {
      // Sube las imágenes (antes del login: endpoint público con rate-limit)
      const uploaded: PendingOrderImage[] = []
      for (const f of files) {
        const res = await apiUpload<{ url: string; filename: string; mime: string; size: number }>(
          '/public/order/upload',
          f,
        )
        uploaded.push(res)
      }

      const exchanges: PendingOrderExchange[] = []
      for (const q of effectiveQuestions) {
        if (q.role === 'title' || q.role === 'description' || q.role === 'reference') continue
        if (q.field_type === 'images') {
          if (uploaded.length > 0) exchanges.push({ question: q.text, answer: '', images: uploaded })
        } else {
          const ans = (answers[keyOf(q)] ?? '').trim()
          if (ans) exchanges.push({ question: q.text, answer: ans, images: [] })
        }
      }

      const order: PendingOrder = {
        title: (answers['role:title'] ?? '').trim(),
        description: (answers['role:description'] ?? '').trim(),
        references: (answers['role:reference'] ?? '').trim(),
        design_id: design?.id ?? null,
        design_name: design?.name ?? '',
        source,
        exchanges,
      }

      if (getAccessToken()) {
        // Ya logueado: crea el proyecto directo y entra a él
        const project = await apiFetch<Project>('/orders/from-form', {
          method: 'POST',
          body: JSON.stringify(order),
        })
        toast.success('Pedido creado. Arrancamos con esto 💜')
        onClose()
        navigate({ to: '/projects/$projectId', params: { projectId: String(project.id) } })
      } else {
        // Sin cuenta: se guarda el pedido y se redirige a login/registro
        setPendingOrder(order)
        onClose()
        toast.success('solicitud enviada! inicia sesión para recibir avances de tu tarjeta digital :)', {
          duration: 10000,
          action: {
            label: 'Iniciar sesión',
            onClick: () => {
              if (timerRef.current) clearTimeout(timerRef.current)
              navigate({ to: '/login' })
            },
          },
        })
        timerRef.current = window.setTimeout(() => {
          navigate({ to: '/login' })
        }, 10000)
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar la solicitud. Intentalo de nuevo.')
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow'

  const renderField = (q: FormQuestion, index: number) => {
    const isImages = q.field_type === 'images'
    const value = answers[keyOf(q)] ?? ''
    return (
      <div key={q.id}>
        <label className="flex items-start gap-2 text-sm font-semibold text-slate-800 mb-1.5">
          <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-[11px] font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span>{q.text}</span>
        </label>
        {isImages ? (
          <div>
            <div className="flex flex-wrap gap-2.5">
              {previews.map((url, i) => (
                <div key={i} className="relative w-20 h-24 rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Quitar imagen ${i + 1}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-24 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-violet-400 hover:text-violet-500 hover:bg-violet-50/40 flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <ImageUp className="w-5 h-5" />
                <span className="text-[10px] font-semibold">Agregar</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={pickFiles}
            />
            <p className="text-xs text-slate-400 mt-2">Podés adjuntar varias imágenes (fotos, referencias, capturas).</p>
          </div>
        ) : q.field_type === 'longtext' ? (
          <textarea
            value={value}
            onChange={e => setAnswers(prev => ({ ...prev, [keyOf(q)]: e.target.value }))}
            rows={q.role === 'detail' ? 5 : 4}
            className={`${inputClass} resize-none`}
            placeholder="Contanos..."
            required
          />
        ) : (
          <input
            type={q.field_type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={e => setAnswers(prev => ({ ...prev, [keyOf(q)]: e.target.value }))}
            className={inputClass}
            placeholder={q.field_type === 'url' ? 'https://...' : 'Tu respuesta'}
            required
          />
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-slate-900 text-lg leading-tight">
              {source === 'template' && design ? `Contratar "${design.name}"` : 'Diseño 100% personalizado'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {source === 'template'
                ? 'Te precargamos los primeros datos con esta plantilla. Podés editarlos.'
                : 'Contanos qué imaginás y lo hacemos realidad.'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {source === 'template' && design && design.demo_url && (
            <a
              href={design.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-violet-600 font-medium hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Ver la plantilla de referencia
            </a>
          )}

          {effectiveQuestions.map((q, i) => renderField(q, i))}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-md border border-red-100">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary rounded-xl px-6 disabled:opacity-60"
            >
              {submitting ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
