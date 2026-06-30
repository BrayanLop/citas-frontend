import { useContext } from 'react'
import { ToastContext, type ToastContextValue } from '../context/ToastContext'

/** Acceso a las notificaciones. Falla si se usa fuera de <ToastProvider>. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
