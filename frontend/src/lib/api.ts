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
  return apiUploadForm<T>(path, formData)
}

function parseErrorPayload(res: Response, payload: unknown): Error & { code?: string; status?: number } {
  const detail = (payload as { detail?: unknown } | null)?.detail
  const message =
    typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? (detail[0]?.msg || `Error ${res.status}`).replace(/^Value error, /, '')
        : (detail as { message?: string } | undefined)?.message || `Error ${res.status}`
  const error = new Error(message) as Error & { code?: string; status?: number }
  error.code = typeof detail === 'object' && !Array.isArray(detail) ? (detail as { code?: string })?.code : undefined
  error.status = res.status
  return error
}

export async function apiDownload(path: string): Promise<Blob> {
  const doGet = (token: string | null) => {
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    return fetch(`${API_BASE}${path}`, { headers })
  }

  let res = await doGet(accessToken)

  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      res = await doGet(newToken)
    }
  }

  if (!res.ok) {
    throw parseErrorPayload(res, await res.json().catch(() => null))
  }
  return res.blob()
}

export async function downloadCsv(path: string, filename: string): Promise<void> {
  const blob = await apiDownload(path)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function apiUploadForm<T = unknown>(path: string, form: FormData): Promise<T> {
  const doPost = (token: string | null) => {
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    return fetch(`${API_BASE}${path}`, { method: 'POST', body: form, headers })
  }

  let res = await doPost(accessToken)

  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      res = await doPost(newToken)
    }
  }

  if (!res.ok) {
    throw parseErrorPayload(res, await res.json().catch(() => null))
  }
  if (res.status === 204) return undefined as T
  return res.json()
}
