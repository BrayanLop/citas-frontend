import { useEffect, useState } from 'react'
import { serviciosApi } from '../api/services'
import { apiError } from '../api/client'
import type { ServicioResponseDto } from '../api/types'
import { useToast } from '../context/ToastContext'
import { Spinner, EmptyState } from '../components/Spinner'
import { Modal } from '../components/Modal'
import { formatMoneda } from '../lib/format'

const vacio = { nombreServicio: '', valor: '', tiempoEstimado: '' }

export function ServiciosPage() {
  const { notify } = useToast()
  const [servicios, setServicios] = useState<ServicioResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(vacio)
  const [saving, setSaving] = useState(false)

  function cargar() {
    setLoading(true)
    serviciosApi
      .list()
      .then(setServicios)
      .catch((err) => notify(apiError(err), 'error'))
      .finally(() => setLoading(false))
  }
  useEffect(cargar, []) // eslint-disable-line react-hooks/exhaustive-deps

  function abrirNuevo() {
    setEditId(null)
    setForm(vacio)
    setModal(true)
  }

  function abrirEditar(s: ServicioResponseDto) {
    setEditId(s.idServicio)
    setForm({
      nombreServicio: s.nombreServicio,
      valor: String(s.valor),
      tiempoEstimado: String(s.tiempoEstimado),
    })
    setModal(true)
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const dto = {
      nombreServicio: form.nombreServicio,
      valor: Number(form.valor),
      tiempoEstimado: Number(form.tiempoEstimado),
    }
    try {
      if (editId == null) {
        await serviciosApi.create(dto)
        notify('Servicio creado', 'success')
      } else {
        await serviciosApi.update(editId, dto)
        notify('Servicio actualizado', 'success')
      }
      setModal(false)
      cargar()
    } catch (err) {
      notify(apiError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(s: ServicioResponseDto) {
    if (!confirm(`¿Eliminar "${s.nombreServicio}"?`)) return
    try {
      await serviciosApi.remove(s.idServicio)
      notify('Servicio eliminado', 'success')
      cargar()
    } catch (err) {
      notify(apiError(err), 'error')
    }
  }

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Servicios</h1>
          <p className="muted">Catálogo de servicios de la empresa.</p>
        </div>
        <button className="btn btn--primary" onClick={abrirNuevo}>
          + Nuevo servicio
        </button>
      </div>

      {loading ? (
        <Spinner label="Cargando servicios…" />
      ) : servicios.length === 0 ? (
        <EmptyState
          icon="✂️"
          title="Aún no hay servicios"
          hint="Crea el primero para que tus clientes puedan elegirlo al agendar."
        />
      ) : (
        <div className="servicio-grid">
          {servicios.map((s) => (
            <article key={s.idServicio} className="servicio-card">
              <div className="servicio-card__icon">✂️</div>
              <div className="servicio-card__body">
                <strong>{s.nombreServicio}</strong>
                <div className="servicio-card__meta">
                  <span className="price">{formatMoneda(s.valor)}</span>
                  <span className="chip chip--soft">⏱ {s.tiempoEstimado} min</span>
                </div>
              </div>
              <div className="servicio-card__actions">
                <button className="icon-btn" onClick={() => abrirEditar(s)} title="Editar">
                  ✏️
                </button>
                <button className="icon-btn" onClick={() => eliminar(s)} title="Eliminar">
                  🗑️
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modal}
        title={editId == null ? 'Nuevo servicio' : 'Editar servicio'}
        onClose={() => setModal(false)}
      >
        <form onSubmit={guardar} className="auth-form" id="servicio-form">
          <label className="field">
            <span>Nombre del servicio</span>
            <input
              value={form.nombreServicio}
              onChange={(e) => setForm((f) => ({ ...f, nombreServicio: e.target.value }))}
              required
            />
          </label>
          <div className="grid-2">
            <label className="field">
              <span>Valor (COP)</span>
              <input
                type="number"
                min="0"
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span>Duración (min)</span>
              <input
                type="number"
                min="1"
                value={form.tiempoEstimado}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tiempoEstimado: e.target.value }))
                }
                required
              />
            </label>
          </div>
          <button className="btn btn--primary btn--block" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
