import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { setTokens, apiFetch } from '../lib/api'
import { useState } from 'react'
import type { User } from '../types'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isRegister) {
      try {
        await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        })
      } catch (err: any) {
        setError(err.message)
        return
      }
    }

    try {
      const data = await apiFetch<{ access_token: string; refresh_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setTokens(data.access_token, data.refresh_token)
      navigate({ to: '/dashboard' })
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-body relative"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1129&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="w-full max-w-sm panel-card relative z-10">
        <h1 className="page-title mb-1 text-center text-violet-700">Clik Agencia</h1>
        <p className="page-subtitle text-center mb-6">
          {isRegister ? 'Creá tu cuenta para empezar' : 'Ingresá a tu panel'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Nombre</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="panel-input"
                required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="panel-input"
              required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="panel-input"
              required minLength={6} />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

          <button type="submit" className="btn-primary w-full justify-center py-2.5 text-base">
            {isRegister ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            {isRegister ? 'Ya tengo cuenta, quiero ingresar' : 'No tengo cuenta, registrarme'}
          </button>
        </div>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <a href="/" className="text-xs text-slate-400 hover:text-slate-600">← Volver al inicio</a>
        </div>
      </div>
    </div>
  )
}
