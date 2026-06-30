import { useState } from 'react'
import type { ServicioResponseDto } from '../api/types'
import { useServicios } from '../hooks/useServicios'
import { Spinner, EmptyState } from '../components/Spinner'
import { Modal } from '../components/Modal'
import { formatMoneda } from '../lib/format'

const vacio = { nombreServicio: '', valor: '', tiempoEstimado: '' }

export function ServiciosPage() {
  const { servicios, loading, guardar: guardarServicio, eliminar: eliminarServicio } =
    useServicios()
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(vacio)
  const [saving, setSaving] = useState(false)

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
    const ok = await guardarServicio(
      {
        nombreServicio: form.nombreServicio,
        valor: Number(form.valor),
        tiempoEstimado: Number(form.tiempoEstimado),
      },
      editId,
    )
    if (ok) setModal(false)
    setSaving(false)
  }

  async function eliminar(s: ServicioResponseDto) {
    if (!confirm(`¿Eliminar "${s.nombreServicio}"?`)) return
    await eliminarServicio(s)
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
