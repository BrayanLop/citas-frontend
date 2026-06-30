import { useCallback, useEffect, useState } from 'react'
import { citasApi } from '../api/services'
import { apiError } from '../api/client'
import type { CitaResponseDto, EstadoCita } from '../api/types'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

// Las citas del cliente activo: carga, recarga y cambio de estado.
// La UI (filtros, conteos) se queda en la página; aquí va solo la data.
export function useCitas() {
  const { userId } = useAuth()
  const { notify } = useToast()
  const [citas, setCitas] = useState<CitaResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<number | null>(null)

  const recargar = useCallback(() => {
    if (userId == null) return
    setLoading(true)
    citasApi
      .list({ clienteId: userId })
      .then((data) =>
        setCitas([...data].sort((a, b) => b.fechaCita.localeCompare(a.fechaCita))),
      )
      .catch((err) => notify(apiError(err), 'error'))
      .finally(() => setLoading(false))
  }, [userId, notify])

  useEffect(recargar, [recargar])

  const cambiarEstado = useCallback(
    async (cita: CitaResponseDto, estado: EstadoCita) => {
      setBusy(cita.idCita)
      try {
        await citasApi.cambiarEstado(cita.idCita, estado)
        notify(`Cita marcada como ${estado.toLowerCase()}`, 'success')
        recargar()
      } catch (err) {
        notify(apiError(err), 'error')
      } finally {
        setBusy(null)
      }
    },
    [notify, recargar],
  )

  return { citas, loading, busy, recargar, cambiarEstado }
}
