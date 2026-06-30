import { useCallback, useEffect, useState } from 'react'
import { serviciosApi } from '../api/services'
import { apiError } from '../api/client'
import type { CreateServicioDto, ServicioResponseDto } from '../api/types'
import { useToast } from './useToast'

// Catálogo de servicios de la empresa: lista + alta/edición/baja.
// `guardar` devuelve true si todo salió bien, para que la página decida
// si cierra el modal; los errores ya se notifican aquí dentro.
export function useServicios() {
  const { notify } = useToast()
  const [servicios, setServicios] = useState<ServicioResponseDto[]>([])
  const [loading, setLoading] = useState(true)

  const recargar = useCallback(() => {
    setLoading(true)
    serviciosApi
      .list()
      .then(setServicios)
      .catch((err) => notify(apiError(err), 'error'))
      .finally(() => setLoading(false))
  }, [notify])

  useEffect(recargar, [recargar])

  const guardar = useCallback(
    async (dto: CreateServicioDto, id: number | null): Promise<boolean> => {
      try {
        if (id == null) {
          await serviciosApi.create(dto)
          notify('Servicio creado', 'success')
        } else {
          await serviciosApi.update(id, dto)
          notify('Servicio actualizado', 'success')
        }
        recargar()
        return true
      } catch (err) {
        notify(apiError(err), 'error')
        return false
      }
    },
    [notify, recargar],
  )

  const eliminar = useCallback(
    async (servicio: ServicioResponseDto) => {
      try {
        await serviciosApi.remove(servicio.idServicio)
        notify('Servicio eliminado', 'success')
        recargar()
      } catch (err) {
        notify(apiError(err), 'error')
      }
    },
    [notify, recargar],
  )

  return { servicios, loading, recargar, guardar, eliminar }
}
