const API_BASE = import.meta.env.VITE_API_URL || '/api'

let accessToken: string | null = localStorage.getItem('access_token')
let refreshToken: string | null = localStorage.getItem('refresh_token')

export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function getAccessToken() {
  return accessToken
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!res.ok) {
    clearTokens()
    window.location.href = '/login'
    return null
  }
  const data = await res.json()
  setTokens(data.access_token, data.refresh_token)
  return data.access_token
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    }
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    const detail = payload?.detail
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? (detail[0]?.msg || `Error ${res.status}`).replace(/^Value error, /, '')
          : detail?.message || `Error ${res.status}`
    const error = new Error(message) as Error & { code?: string; status?: number }
    error.code = typeof detail === 'object' && !Array.isArray(detail) ? detail?.code : undefined
    error.status = res.status
    throw error
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export function apiUpload<T = unknown>(path: string, file: File): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)
  const headers: Record<string, string> = {}
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
  return fetch(`${API_BASE}${path}`, { method: 'POST', body: formData, headers }).then(r => {
    if (!r.ok) throw new Error('Upload failed')
    return r.json()
  })
}
