import { api } from './client'
import type {
  ClienteAuthResponseDto,
  CitaResponseDto,
  CreateCitaDto,
  CreateServicioDto,
  EmpresaResponseDto,
  LoginClienteDto,
  RegisterClienteDto,
  SelectEmpresaResponseDto,
  ServicioResponseDto,
  UsuarioResponseDto,
} from './types'

// ---- Auth ----
export const authApi = {
  login: (dto: LoginClienteDto) =>
    api.post<ClienteAuthResponseDto>('/Auth/login', dto).then((r) => r.data),
  register: (dto: RegisterClienteDto) =>
    api.post<ClienteAuthResponseDto>('/Auth/register', dto).then((r) => r.data),
  selectEmpresa: (tenant: string) =>
    api
      .post<SelectEmpresaResponseDto>('/Auth/select-empresa', { tenant })
      .then((r) => r.data),
}

// ---- Empresas ----
export const empresasApi = {
  list: () => api.get<EmpresaResponseDto[]>('/Empresas').then((r) => r.data),
}

// ---- Servicios ----
export const serviciosApi = {
  list: () => api.get<ServicioResponseDto[]>('/Servicios').then((r) => r.data),
  create: (dto: CreateServicioDto) =>
    api.post<ServicioResponseDto>('/Servicios', dto).then((r) => r.data),
  update: (id: number, dto: CreateServicioDto) =>
    api.put(`/Servicios/${id}`, dto),
  remove: (id: number) => api.delete(`/Servicios/${id}`),
}

// ---- Citas ----
export const citasApi = {
  list: (params?: { clienteId?: number; empleadoId?: number }) =>
    api.get<CitaResponseDto[]>('/Citas', { params }).then((r) => r.data),
  create: (dto: CreateCitaDto) =>
    api.post<CitaResponseDto>('/Citas', dto).then((r) => r.data),
  cambiarEstado: (id: number, estado: string) =>
    api.patch(`/Citas/${id}`, { estado }),
  remove: (id: number) => api.delete(`/Citas/${id}`),
}

// ---- Usuarios ----
export const usuariosApi = {
  list: (rol?: string) =>
    api
      .get<UsuarioResponseDto[]>('/Usuarios', { params: rol ? { rol } : undefined })
      .then((r) => r.data),
}
