import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { citasApi } from '../api/services'
import { apiError } from '../api/client'
import type { CitaResponseDto, EstadoCita } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
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
  const { userId } = useAuth()
  const { notify } = useToast()
  const [citas, setCitas] = useState<CitaResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'Todas' | EstadoCita>('Todas')
  const [busy, setBusy] = useState<number | null>(null)

  const cargar = useCallback(() => {
    if (userId == null) return
    setLoading(true)
    citasApi
      .list({ clienteId: userId })
      .then((data) =>
        setCitas(
          [...data].sort((a, b) => b.fechaCita.localeCompare(a.fechaCita)),
        ),
      )
      .catch((err) => notify(apiError(err), 'error'))
      .finally(() => setLoading(false))
  }, [userId, notify])

  useEffect(cargar, [cargar])

  const visibles = useMemo(
    () => (filtro === 'Todas' ? citas : citas.filter((c) => c.estado === filtro)),
    [citas, filtro],
  )

  async function cambiarEstado(c: CitaResponseDto, estado: EstadoCita) {
    setBusy(c.idCita)
    try {
      await citasApi.cambiarEstado(c.idCita, estado)
      notify(`Cita marcada como ${estado.toLowerCase()}`, 'success')
      cargar()
    } catch (err) {
      notify(apiError(err), 'error')
    } finally {
      setBusy(null)
    }
  }

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
