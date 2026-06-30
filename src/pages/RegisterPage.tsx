import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/services'
import { apiError } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { AuthShell } from '../components/AuthShell'

export function RegisterPage() {
  const { signInGlobal } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    celular: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.register({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        celular: form.celular || undefined,
        password: form.password,
      })
      signInGlobal({ token: res.token, personaId: res.personaId, nombre: res.nombre })
      notify('¡Cuenta creada! Elige una empresa para empezar.', 'success')
      navigate('/empresas')
    } catch (err) {
      notify(apiError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Crea tu cuenta" subtitle="Empieza a agendar en menos de un minuto">
      <form onSubmit={onSubmit} className="auth-form">
        <div className="grid-2">
          <label className="field">
            <span>Nombre</span>
            <input value={form.nombre} onChange={set('nombre')} required />
          </label>
          <label className="field">
            <span>Apellido</span>
            <input value={form.apellido} onChange={set('apellido')} required />
          </label>
        </div>
        <label className="field">
          <span>Correo electrónico</span>
          <input type="email" value={form.email} onChange={set('email')} required />
        </label>
        <label className="field">
          <span>Celular <em>(opcional)</em></span>
          <input value={form.celular} onChange={set('celular')} placeholder="3001234567" />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            minLength={6}
            required
          />
        </label>
        <button className="btn btn--primary btn--block" disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Registrarme'}
        </button>
      </form>
      <p className="auth-alt">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </AuthShell>
  )
}
