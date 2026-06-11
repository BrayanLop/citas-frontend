import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { citasApi, serviciosApi, usuariosApi } from '../api/services'
import { apiError } from '../api/client'
import type { ServicioResponseDto, UsuarioResponseDto } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/Spinner'
import { formatMoneda } from '../lib/format'

// Suma minutos a "HH:mm" y devuelve "HH:mm:ss".
function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(':').map(Number)
  const total = h * 60 + m + minutos
  const hh = String(Math.floor((total / 60) % 24)).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}:00`
}

export function AgendarPage() {
  const { userId } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const [empleados, setEmpleados] = useState<UsuarioResponseDto[]>([])
  const [servicios, setServicios] = useState<ServicioResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const hoy = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    idEmpleado: '',
    servicioId: '',
    fecha: hoy,
    hora: '09:00',
    observaciones: '',
  })

  useEffect(() => {
    Promise.all([usuariosApi.list('Empleado'), serviciosApi.list()])
      .then(([emps, servs]) => {
        setEmpleados(emps)
        setServicios(servs)
      })
      .catch((err) => notify(apiError(err), 'error'))
      .finally(() => setLoading(false))
  }, [notify])

  const servicioSel = servicios.find((s) => String(s.idServicio) === form.servicioId)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (userId == null) return notify('No se encontró el cliente activo.', 'error')
    if (!form.idEmpleado) return notify('Elige un profesional.', 'error')

    setSaving(true)
    try {
      const horaInicio = `${form.hora}:00`
      const horaFin = servicioSel
        ? sumarMinutos(form.hora, servicioSel.tiempoEstimado)
        : undefined

      await citasApi.create({
        idCliente: userId,
        idEmpleado: Number(form.idEmpleado),
        fechaCita: form.fecha,
        horaEstimadaCita: horaInicio,
        horaEstimadaFin: horaFin,
        observaciones:
          [servicioSel?.nombreServicio, form.observaciones]
            .filter(Boolean)
            .join(' · ') || undefined,
      })
      notify('¡Cita agendada con éxito!', 'success')
      navigate('/app/citas')
    } catch (err) {
      notify(apiError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner label="Preparando el formulario…" />

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Agendar una cita</h1>
          <p className="muted">Elige profesional, fecha y hora.</p>
        </div>
      </div>

      <div className="agendar-grid">
        <form onSubmit={onSubmit} className="card form-card">
          <label className="field">
            <span>Profesional</span>
            <select
              value={form.idEmpleado}
              onChange={(e) => setForm((f) => ({ ...f, idEmpleado: e.target.value }))}
              required
            >
              <option value="">— Selecciona —</option>
              {empleados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombreUsuario}
                </option>
              ))}
            </select>
            {empleados.length === 0 && (
              <small className="field__hint warn">
                No hay empleados registrados en esta empresa.
              </small>
            )}
          </label>

          <label className="field">
            <span>Servicio <em>(opcional)</em></span>
            <select
              value={form.servicioId}
              onChange={(e) => setForm((f) => ({ ...f, servicioId: e.target.value }))}
            >
              <option value="">— Sin servicio —</option>
              {servicios.map((s) => (
                <option key={s.idServicio} value={s.idServicio}>
                  {s.nombreServicio} · {formatMoneda(s.valor)} · {s.tiempoEstimado} min
                </option>
              ))}
            </select>
          </label>

          <div className="grid-2">
            <label className="field">
              <span>Fecha</span>
              <input
                type="date"
                min={hoy}
                value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span>Hora</span>
              <input
                type="time"
                value={form.hora}
                onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
                required
              />
            </label>
          </div>

          <label className="field">
            <span>Observaciones <em>(opcional)</em></span>
            <textarea
              rows={3}
              value={form.observaciones}
              onChange={(e) =>
                setForm((f) => ({ ...f, observaciones: e.target.value }))
              }
              placeholder="¿Algo que el profesional deba saber?"
            />
          </label>

          <button className="btn btn--primary btn--block" disabled={saving}>
            {saving ? 'Agendando…' : 'Confirmar cita'}
          </button>
        </form>

        <aside className="card summary-card">
          <h3>Resumen</h3>
          <div className="summary-row">
            <span>Profesional</span>
            <strong>
              {empleados.find((e) => String(e.id) === form.idEmpleado)?.nombreUsuario ??
                '—'}
            </strong>
          </div>
          <div className="summary-row">
            <span>Servicio</span>
            <strong>{servicioSel?.nombreServicio ?? '—'}</strong>
          </div>
          <div className="summary-row">
            <span>Fecha</span>
            <strong>{form.fecha}</strong>
          </div>
          <div className="summary-row">
            <span>Hora</span>
            <strong>{form.hora}</strong>
          </div>
          {servicioSel && (
            <>
              <div className="summary-row">
                <span>Duración</span>
                <strong>{servicioSel.tiempoEstimado} min</strong>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>{formatMoneda(servicioSel.valor)}</strong>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
