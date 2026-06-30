import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle: string
  children: ReactNode
}

/** Layout de dos columnas para las pantallas de autenticación. */
export function AuthShell({ title, subtitle, children }: Props) {
  return (
    <div className="auth">
      <div className="auth__art">
        <div className="auth__art-inner">
          <span className="auth__logo">📆</span>
          <h1>Citas</h1>
          <p>
            Reserva, gestiona y confirma tus citas con tus negocios favoritos en
            segundos.
          </p>
          <ul className="auth__features">
            <li>✓ Agenda en tiempo real</li>
            <li>✓ Varias empresas, una sola cuenta</li>
            <li>✓ Recordatorios de tus citas</li>
          </ul>
        </div>
      </div>
      <div className="auth__panel">
        <div className="auth__card">
          <h2>{title}</h2>
          <p className="auth__sub">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
