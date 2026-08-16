import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { setTokens, apiFetch } from '../lib/api'
import { getPendingOrder, clearPendingOrder } from '../lib/pendingOrder'
import { useEffect, useState } from 'react'
import { Eye, EyeOff, Mail, KeyRound, ArrowLeft, RefreshCw, ShieldCheck, User, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import type { PendingOrder, Project } from '../types'
import imgLogueo from '@/assets/img-logueo.png'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

type Mode = 'login' | 'register' | 'verify' | 'forgot' | 'reset'

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="panel-input panel-input-password"
        placeholder={placeholder}
        required
        minLength={8}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 flex items-center text-slate-400 hover:text-violet-600 transition-colors focus:outline-none focus:text-violet-600"
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
      </button>
    </div>
  )
}

function Field({
  icon,
  children,
  label,
}: {
  icon: ReactNode
  children: ReactNode
  label: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-slate-700">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null
  return <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-md border border-red-100">{message}</p>
}

function InfoBanner({ message }: { message: string }) {
  if (!message) return null
  return <p className="text-sm text-violet-800 bg-violet-50 p-2.5 rounded-md border border-violet-100">{message}</p>
}

function TermsNote() {
  return (
    <p className="text-center text-xs text-slate-400 leading-relaxed">
      Al utilizar una cuenta en Clik aceptás los{' '}
      <Link to="/terminos" className="text-violet-600 hover:text-violet-800 font-medium underline underline-offset-2">
        Términos
      </Link>{' '}
      y la{' '}
      <Link to="/privacidad" className="text-violet-600 hover:text-violet-800 font-medium underline underline-offset-2">
        Política de Privacidad
      </Link>
      .
    </p>
  )
}

function BrandPanel() {
  return (
    <div className="hidden lg:block w-[46%] relative overflow-hidden bg-violet-950">
      <img
        src={imgLogueo}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-violet-950/80 via-violet-950/10 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 p-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-display text-white text-xl font-bold">Clik Agencia</span>
        </div>
        <p className="text-white/85 text-base leading-relaxed max-w-sm">
          Tu espacio para gestionar proyectos, tarjetas digitales y pagos en un solo lugar.
        </p>
      </div>
    </div>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // login / register
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  // verify / reset
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const switchMode = (m: Mode) => {
    setMode(m)
    setError('')
    setInfo('')
    setCode('')
    setBusy(false)
  }

  // Después de autenticarse: si el usuario venía del formulario de tarjetas digitales
  // (pedido pendiente guardado), se crea el proyecto + chat inicial y cae directo ahí.
  // Si no, va al dashboard como siempre.
  const goAfterAuth = async () => {
    const pending = getPendingOrder()
    if (!pending) {
      navigate({ to: '/dashboard' })
      return
    }
    clearPendingOrder()
    try {
      const project = await apiFetch<Project>('/orders/from-form', {
        method: 'POST',
        body: JSON.stringify(pending as PendingOrder),
      })
      navigate({ to: '/projects/$projectId', params: { projectId: String(project.id) } })
    } catch {
      // Si algo falla, no dejar al usuario en un loop: va al dashboard
      navigate({ to: '/dashboard' })
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await apiFetch<{ access_token: string; refresh_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setTokens(data.access_token, data.refresh_token)
      await goAfterAuth()
    } catch (err: any) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setInfo('Confirmá tu correo para poder ingresar. Te enviamos un código a tu email.')
        setMode('verify')
        setBusy(false)
        return
      }
      setError(err.message || 'Error al ingresar')
      setBusy(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8 || !/[A-Z]/.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres y 1 letra mayúscula')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setBusy(true)
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      })
      setCode('')
      setInfo(`Te enviamos un código de verificación a ${email.trim().toLowerCase()}.`)
      setMode('verify')
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta')
    } finally {
      setBusy(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await apiFetch<{ access_token: string; refresh_token: string }>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      })
      setTokens(data.access_token, data.refresh_token)
      await goAfterAuth()
    } catch (err: any) {
      setError(err.message || 'Código incorrecto')
      setBusy(false)
    }
  }

  const handleResend = async () => {
    if (resendIn > 0) return
    setBusy(true)
    setError('')
    try {
      await apiFetch('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setResendIn(60)
      setInfo('Te enviamos un código nuevo. Revisá tu casilla de correo.')
    } catch (err: any) {
      setError(err.message || 'No pudimos reenviar el código')
    } finally {
      setBusy(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await apiFetch<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setInfo(res.message || 'Si el email está registrado, te enviamos un código.')
      setMode('reset')
    } catch (err: any) {
      setError(err.message || 'Error')
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword)) {
      setError('La contraseña debe tener al menos 8 caracteres y 1 letra mayúscula')
      return
    }
    if (newPassword !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setBusy(true)
    try {
      const data = await apiFetch<{ access_token: string; refresh_token: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, new_password: newPassword }),
      })
      setTokens(data.access_token, data.refresh_token)
      await goAfterAuth()
    } catch (err: any) {
      setError(err.message || 'No pudimos restablecer tu contraseña')
      setBusy(false)
    }
  }

  const inputClass = 'panel-input panel-input-icon'

  const titles: Record<Mode, { title: string; subtitle: string }> = {
    login: { title: 'Ingresá a tu panel', subtitle: 'Bienvenido de nuevo a Clik' },
    register: { title: 'Creá tu cuenta', subtitle: 'Empezá a gestionar tus pedidos' },
    verify: { title: 'Confirmá tu correo', subtitle: 'Verificamos tu cuenta para protegerte' },
    forgot: { title: 'Restablecé tu contraseña', subtitle: 'Te enviamos un código por email' },
    reset: { title: 'Nueva contraseña', subtitle: 'Ingresá el código y tu contraseña nueva' },
  }

  return (
    <div className="min-h-screen flex font-body bg-white">
      {/* ── Formulario (izquierda) ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-white via-white to-violet-50/50">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <span className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              Clik <span className="text-violet-600">.</span>
            </span>
          </div>

          <div className="text-center mb-8">
            <h1 className="page-title text-3xl text-slate-900 mb-1.5">{titles[mode].title}</h1>
            <p className="page-subtitle">{titles[mode].subtitle}</p>
          </div>

          {mode === 'login' && (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <Field icon={<Mail className="h-4 w-4" />} label="Email">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className={inputClass} placeholder="tu@email.com" required autoComplete="email" />
                </Field>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                    <button type="button" onClick={() => switchMode('forgot')}
                      className="text-xs text-violet-600 hover:text-violet-800 font-medium">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <PasswordInput value={password} onChange={setPassword}
                    placeholder="••••••••" autoComplete="current-password" />
                </div>
                <ErrorBanner message={error} />
                <button type="submit" disabled={busy}
                  className="btn-primary w-full justify-center py-2.5 text-base disabled:opacity-60">
                  {busy ? 'Ingresando…' : 'Ingresar'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => switchMode('register')}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                  No tengo cuenta, registrarme
                </button>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <TermsNote />
              </div>
            </>
          )}

          {mode === 'register' && (
            <>
              <form onSubmit={handleRegister} className="space-y-4">
                <Field icon={<User className="h-4 w-4" />} label="Nombre">
                  <input value={name} onChange={e => setName(e.target.value)}
                    className={inputClass} placeholder="Tu nombre" required autoComplete="name" />
                </Field>
                <Field icon={<Mail className="h-4 w-4" />} label="Email">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className={inputClass} placeholder="tu@email.com" required autoComplete="email" />
                </Field>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Contraseña</label>
                  <PasswordInput value={password} onChange={setPassword}
                    placeholder="Mín. 8 caracteres y 1 mayúscula" autoComplete="new-password" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Repetir contraseña</label>
                  <PasswordInput value={confirm} onChange={setConfirm}
                    placeholder="Repetí tu contraseña" autoComplete="new-password" />
                </div>
                <ErrorBanner message={error} />
                <button type="submit" disabled={busy}
                  className="btn-primary w-full justify-center py-2.5 text-base disabled:opacity-60">
                  {busy ? 'Creando cuenta…' : 'Crear cuenta'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => switchMode('login')}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                  Ya tengo cuenta, quiero ingresar
                </button>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <TermsNote />
              </div>
            </>
          )}

          {mode === 'verify' && (
            <>
              <InfoBanner message={info} />
              <p className="text-sm text-slate-500 text-center mb-4 mt-2">
                Escribí el código de 6 dígitos que te enviamos a <span className="font-semibold text-slate-700">{email.trim().toLowerCase()}</span>
              </p>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Código de verificación</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="panel-input panel-input-icon text-center tracking-[0.5em] font-bold text-lg"
                      placeholder="••••••"
                      inputMode="numeric"
                      autoFocus
                      required
                      maxLength={6}
                    />
                  </div>
                </div>
                <ErrorBanner message={error} />
                <button type="submit" disabled={busy || code.length !== 6}
                  className="btn-primary w-full justify-center py-2.5 text-base disabled:opacity-60">
                  {busy ? 'Verificando…' : 'Confirmar correo'}
                </button>
                <button type="button" onClick={handleResend} disabled={busy || resendIn > 0}
                  className="w-full flex items-center justify-center gap-2 text-sm text-violet-600 hover:text-violet-800 font-medium disabled:opacity-60 py-1">
                  <RefreshCw className="h-4 w-4" />
                  {resendIn > 0 ? `Reenviar código en ${resendIn}s` : 'No me llegó el código, reenviar'}
                </button>
              </form>
              <div className="mt-4 text-center">
                <button onClick={() => switchMode('login')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium">
                  ← Volver a ingresar
                </button>
              </div>
              <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Verificamos tu correo para proteger tu cuenta
              </div>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <p className="text-sm text-slate-500 text-center mb-5">
                Ingresá tu email y te enviamos un código para crear una contraseña nueva.
              </p>
              <form onSubmit={handleForgot} className="space-y-4">
                <Field icon={<Mail className="h-4 w-4" />} label="Email">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className={inputClass} placeholder="tu@email.com" required autoComplete="email" />
                </Field>
                <ErrorBanner message={error} />
                <button type="submit" disabled={busy}
                  className="btn-primary w-full justify-center py-2.5 text-base disabled:opacity-60">
                  {busy ? 'Enviando…' : 'Enviar código'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => switchMode('login')}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                  Volver al ingreso
                </button>
              </div>
            </>
          )}

          {mode === 'reset' && (
            <>
              <InfoBanner message={info} />
              <form onSubmit={handleReset} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Código recibido por email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="panel-input panel-input-icon text-center tracking-[0.5em] font-bold text-lg"
                      placeholder="••••••"
                      inputMode="numeric"
                      autoFocus
                      required
                      maxLength={6}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Contraseña nueva</label>
                  <PasswordInput value={newPassword} onChange={setNewPassword}
                    placeholder="Mín. 8 caracteres y 1 mayúscula" autoComplete="new-password" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Repetir contraseña</label>
                  <PasswordInput value={confirm} onChange={setConfirm}
                    placeholder="Repetí la contraseña nueva" autoComplete="new-password" />
                </div>
                <ErrorBanner message={error} />
                <button type="submit" disabled={busy || code.length !== 6}
                  className="btn-primary w-full justify-center py-2.5 text-base disabled:opacity-60">
                  {busy ? 'Guardando…' : 'Guardar nueva contraseña'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => switchMode('login')}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium">
                  <ArrowLeft className="h-3 w-3" /> Volver al ingreso
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-10 text-center border-t border-slate-100 pt-5 flex items-center justify-center gap-4">
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-600">← Volver al inicio</Link>
          </div>
        </div>
      </div>

      {/* ── Panel de marca (derecha, solo desktop) ── */}
      <BrandPanel />
    </div>
  )
}
