import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, empresasApi } from '../api/services'
import { apiError } from '../api/client'
import type { EmpresaResponseDto } from '../api/types'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { Spinner, EmptyState } from '../components/Spinner'

export function SelectEmpresaPage() {
  const { nombre, signInEmpresa, signOut } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [empresas, setEmpresas] = useState<EmpresaResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => {
    empresasApi
      .list()
      .then(setEmpresas)
      .catch((err) => notify(apiError(err), 'error'))
      .finally(() => setLoading(false))
  }, [notify])

  async function elegir(empresa: EmpresaResponseDto) {
    setSelecting(empresa.id)
    try {
      const res = await authApi.selectEmpresa(empresa.id)
      signInEmpresa({
        token: res.token,
        tenant: res.tenant,
        empresaNombre: res.empresaNombre || empresa.nombre,
        userId: res.userId,
      })
      notify(`Entraste a ${res.empresaNombre || empresa.nombre}`, 'success')
      navigate('/app/citas')
    } catch (err) {
      notify(apiError(err), 'error')
    } finally {
      setSelecting(null)
    }
  }

  const activas = empresas.filter((e) => e.activo)

  return (
    <div className="picker">
      <header className="picker__head">
        <div>
          <h1>Hola, {nombre} 👋</h1>
          <p>Elige la empresa con la que quieres agendar.</p>
        </div>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => {
            signOut()
            navigate('/login')
          }}
        >
          Cerrar sesión
        </button>
      </header>

      {loading ? (
        <Spinner label="Cargando empresas…" />
      ) : activas.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="No hay empresas disponibles"
          hint="Pide a un administrador que registre una empresa para empezar."
        />
      ) : (
        <div className="empresa-grid">
          {activas.map((e) => (
            <button
              key={e.id}
              className="empresa-card"
              onClick={() => elegir(e)}
              disabled={selecting !== null}
            >
              <div className="empresa-card__logo">{e.nombre.charAt(0).toUpperCase()}</div>
              <div className="empresa-card__body">
                <strong>{e.nombre}</strong>
                <span className="chip chip--soft">{e.id}</span>
              </div>
              <span className="empresa-card__cta">
                {selecting === e.id ? '…' : '→'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
