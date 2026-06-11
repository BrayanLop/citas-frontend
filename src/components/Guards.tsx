import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

/** Exige identidad global (login/register). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Exige además haber seleccionado una empresa (token con tenant). */
export function RequireEmpresa({ children }: { children: ReactNode }) {
  const { isAuthenticated, hasEmpresa } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasEmpresa) return <Navigate to="/empresas" replace />
  return <>{children}</>
}
