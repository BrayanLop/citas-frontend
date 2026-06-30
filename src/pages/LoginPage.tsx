import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/services'
import { apiError } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { AuthShell } from '../components/AuthShell'

export function LoginPage() {
  const { signInGlobal } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      signInGlobal({ token: res.token, personaId: res.personaId, nombre: res.nombre })
      notify(`¡Hola de nuevo, ${res.nombre}!`, 'success')
      navigate('/empresas')
    } catch (err) {
      notify(apiError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Bienvenido de vuelta" subtitle="Ingresa para agendar tus citas">
      <form onSubmit={onSubmit} className="auth-form">
        <label className="field">
          <span>Correo electrónico</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
          />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>
        <button className="btn btn--primary btn--block" disabled={loading}>
          {loading ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>
      <p className="auth-alt">
        ¿No tienes cuenta? <Link to="/register">Crea una aquí</Link>
      </p>
    </AuthShell>
  )
}
