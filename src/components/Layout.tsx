import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/app/citas', label: 'Mis citas', icon: '📅' },
  { to: '/app/agendar', label: 'Agendar', icon: '➕' },
  { to: '/app/servicios', label: 'Servicios', icon: '✂️' },
]

export function Layout() {
  const { nombre, empresaNombre, tenant, signOut, leaveEmpresa } = useAuth()
  const navigate = useNavigate()

  const iniciales = (nombre ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__logo">📆</span>
          <div>
            <strong>Citas</strong>
            <small>{empresaNombre ?? tenant}</small>
          </div>
        </div>

        <nav className="nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav__item ${isActive ? 'is-active' : ''}`}
            >
              <span className="nav__icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__foot">
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => {
              leaveEmpresa()
              navigate('/empresas')
            }}
          >
            ⇄ Cambiar empresa
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar__empresa">
            <span className="chip">{tenant}</span>
            <span className="topbar__empresa-name">{empresaNombre}</span>
          </div>
          <div className="topbar__user">
            <div className="avatar">{iniciales}</div>
            <div className="topbar__user-meta">
              <strong>{nombre}</strong>
              <small>Cliente</small>
            </div>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => {
                signOut()
                navigate('/login')
              }}
            >
              Salir
            </button>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
