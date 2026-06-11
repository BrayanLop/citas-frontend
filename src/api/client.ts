import axios from 'axios'

// Todas las peticiones pasan por el proxy de Vite (/api -> http://localhost:5202).
export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

const TOKEN_KEY = 'citas.token'

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// Adjunta el JWT actual en cada petición.
api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normaliza los errores para mostrar mensajes legibles en la UI.
export function apiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { detail?: string; title?: string; message?: string }
      | string
      | undefined
    if (typeof data === 'string') {
      if (data.trim()) return data
    } else if (data) {
      if (data.detail) return data.detail
      if (data.title) return data.title
      if (data.message) return data.message
    }
    if (err.response?.status === 401) return 'Sesión expirada o no autorizada.'
    if (!err.response) return 'No se pudo conectar con el servidor. ¿Está corriendo la API?'
    return `Error ${err.response.status}`
  }
  return 'Ocurrió un error inesperado.'
}
