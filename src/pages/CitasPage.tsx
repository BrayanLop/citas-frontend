import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { EstadoCita } from '../api/types'
import { useCitas } from '../hooks/useCitas'
import { Spinner, EmptyState } from '../components/Spinner'
import {
  estadoBadge,
  formatFecha,
  formatHora,
  siguientesEstados,
} from '../lib/format'

const filtros: Array<{ key: 'Todas' | EstadoCita; label: string }> = [
  { key: 'Todas', label: 'Todas' },
  { key: 'Pendiente', label: 'Pendientes' },
  { key: 'Confirmada', label: 'Confirmadas' },
  { key: 'Atendida', label: 'Atendidas' },
  { key: 'Cancelada', label: 'Canceladas' },
]

export function CitasPage() {
  const { citas, loading, busy, cambiarEstado } = useCitas()
  const [filtro, setFiltro] = useState<'Todas' | EstadoCita>('Todas')

  const visibles = useMemo(
    () => (filtro === 'Todas' ? citas : citas.filter((c) => c.estado === filtro)),
    [citas, filtro],
  )

  const resumen = useMemo(() => {
    const prox = citas.filter(
      (c) => c.estado === 'Pendiente' || c.estado === 'Confirmada',
    ).length
    return { total: citas.length, prox }
  }, [citas])

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Mis citas</h1>
          <p className="muted">
            {resumen.total} en total · {resumen.prox} próximas
          </p>
        </div>
        <Link to="/app/agendar" className="btn btn--primary">
          + Agendar cita
        </Link>
      </div>

      <div className="tabs">
        {filtros.map((f) => (
          <button
            key={f.key}
            className={`tab ${filtro === f.key ? 'is-active' : ''}`}
            onClick={() => setFiltro(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Cargando tus citas…" />
      ) : visibles.length === 0 ? (
        <EmptyState
          icon="🗓️"
          title="No tienes citas aquí"
          hint="Agenda tu primera cita para verla en este listado."
        />
      ) : (
        <div className="cita-list">
          {visibles.map((c) => {
            const badge = estadoBadge(c.estado)
            const acciones = siguientesEstados(c.estado)
            return (
              <article key={c.idCita} className="cita-card">
                <div className="cita-card__date">
                  <span className="cita-card__day">
                    {new Date(c.fechaCita).getDate()}
                  </span>
                  <span className="cita-card__mon">{formatFecha(c.fechaCita)}</span>
                </div>

                <div className="cita-card__main">
                  <div className="cita-card__top">
                    <strong>{c.nombreEmpleado ?? `Empleado #${c.idEmpleado}`}</strong>
                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  </div>
                  <div className="cita-card__meta">
                    <span>🕒 {formatHora(c.horaEstimadaCita)}
                      {c.horaEstimadaFin ? ` – ${formatHora(c.horaEstimadaFin)}` : ''}
                    </span>
                    {c.observaciones && <span>📝 {c.observaciones}</span>}
                  </div>
                </div>

                <div className="cita-card__actions">
                  {acciones.length === 0 ? (
                    <span className="muted small">Sin acciones</span>
                  ) : (
                    acciones.map((a) => (
                      <button
                        key={a}
                        className={`btn btn--sm ${
                          a === 'Cancelada' ? 'btn--danger-ghost' : 'btn--soft'
                        }`}
                        disabled={busy === c.idCita}
                        onClick={() => cambiarEstado(c, a)}
                      >
                        {a === 'Confirmada' && 'Confirmar'}
                        {a === 'Atendida' && 'Marcar atendida'}
                        {a === 'Cancelada' && 'Cancelar'}
                      </button>
                    ))
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
