import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { setAuthToken } from '../api/client'

interface SessionState {
  // Identidad global (tras login/register)
  personaId: number | null
  nombre: string | null
  // Empresa seleccionada (tras select-empresa)
  tenant: string | null
  empresaNombre: string | null
  userId: number | null // Id del usuario cliente dentro del tenant
}

interface AuthContextValue extends SessionState {
  isAuthenticated: boolean
  hasEmpresa: boolean
  signInGlobal: (data: { token: string; personaId: number; nombre: string }) => void
  signInEmpresa: (data: {
    token: string
    tenant: string
    empresaNombre: string
    userId: number
  }) => void
  signOut: () => void
  leaveEmpresa: () => void
}

const STORAGE_KEY = 'citas.session'

const empty: SessionState = {
  personaId: null,
  nombre: null,
  tenant: null,
  empresaNombre: null,
  userId: null,
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSession(): SessionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(loadSession)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [session])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...session,
      isAuthenticated: session.personaId !== null,
      hasEmpresa: session.tenant !== null,
      signInGlobal: ({ token, personaId, nombre }) => {
        setAuthToken(token)
        setSession({ ...empty, personaId, nombre })
      },
      signInEmpresa: ({ token, tenant, empresaNombre, userId }) => {
        setAuthToken(token)
        setSession((s) => ({ ...s, tenant, empresaNombre, userId }))
      },
      leaveEmpresa: () => {
        setSession((s) => ({ ...s, tenant: null, empresaNombre: null, userId: null }))
      },
      signOut: () => {
        setAuthToken(null)
        setSession(empty)
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
