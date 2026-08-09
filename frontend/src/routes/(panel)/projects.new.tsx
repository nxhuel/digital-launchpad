import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { Service, Project } from '../../types'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/(panel)/projects/new')({
  component: NewProjectPage,
})


function NewProjectPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', description: '', references: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    apiFetch<Service[]>('/services').then(s => {
      const active = s.filter(s => s.active)
      // Tarjetas Digitales siempre primero; el resto sigue el orden del catálogo
      setServices([
        ...active.filter(x => x.slug === 'tarjetas-digitales'),
        ...active.filter(x => x.slug !== 'tarjetas-digitales'),
      ])
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService) return
    setSubmitting(true)
    try {
      await apiFetch<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          service_id: selectedService,
          title: form.title,
          description: form.description + (form.references ? `\n\nReferencias:\n${form.references}` : ''),
        }),
      })
      toast.success('Solicitud enviada. Te contactamos pronto.')
      navigate({ to: '/dashboard' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back */}
      <button
        onClick={() => navigate({ to: '/dashboard' })}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al dashboard
      </button>

      {/* Title */}
      <div>
        <h1 className="page-title">Solicitar nuevo pedido</h1>
        <p className="page-subtitle">Elegí el tipo de pedido y contanos tu idea.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Step 1: Service selection */}
        <div>
          <h2 className="font-bold text-slate-900 text-lg mb-4">1. Elegí el tipo de pedido</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map(s => {
              const isSelected = selectedService === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedService(s.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-violet-500 bg-violet-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-violet-600 font-bold text-sm">{s.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{s.name}</p>
                      {s.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                      )}
                      {s.features && s.features.length > 0 && (
                        <ul className="mt-2 space-y-0.5">
                          {s.features.map((f, i) => (
                            <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                              <span className="text-violet-400 mt-0.5 shrink-0">•</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-2">
                        <span className="text-xs border border-slate-200 rounded-full px-2 py-0.5 text-slate-500">
                          {s.base_price > 0 ? `Desde $ ${s.base_price.toLocaleString('es-AR')}` : 'Desde a consultar'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2: Idea details */}
        <div>
          <h2 className="font-bold text-slate-900 text-lg mb-4">2. Contanos sobre tu idea</h2>
          <div className="panel-card space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre del pedido
              </label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="panel-input"
                placeholder="Ej: Invitación casamiento, Web para mi negocio, Sistema de turnos"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contanos tu idea
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={5}
                className="panel-input resize-none"
                placeholder={
                  services.find(s => s.id === selectedService)?.slug === 'tarjetas-digitales'
                    ? 'Contanos tu idea: de qué trata, fecha y lugar, música que te gusta, fotos, horarios, sedes...'
                    : 'Contanos qué necesitás: de qué trata, secciones, funcionalidades, colores, referencias...'
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Referencias <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.references}
                onChange={e => setForm({ ...form, references: e.target.value })}
                rows={3}
                className="panel-input resize-none"
                placeholder="Links, fotos, inspiraciones o sitios que te gusten..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pb-8">
          <button
            type="submit"
            disabled={submitting || !selectedService || !form.title || !form.description}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 text-base rounded-xl"
          >
            {submitting ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      </form>
    </div>
  )
}
