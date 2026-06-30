import { createContext, useCallback, useState, type ReactNode } from 'react'

export type ToastKind = 'success' | 'error' | 'info'
interface Toast {
  id: number
  kind: ToastKind
  message: string
}

export interface ToastContextValue {
  notify: (message: string, kind?: ToastKind) => void
}

// El contexto se consume con el hook useToast (ver src/hooks/useToast.ts).
// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextValue | null>(null)
let seq = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = seq++
    setToasts((t) => [...t, { id, kind, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`} role="alert">
            <span className="toast__dot" />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
