import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '../context/AuthContext'

/** Acceso a la sesión. Falla si se usa fuera de <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
