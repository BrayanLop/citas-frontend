// Tipos espejo de los DTOs del backend (Citas.Application.*)

export interface RegisterClienteDto {
  nombre: string
  apellido: string
  email: string
  celular?: string
  password: string
}

export interface LoginClienteDto {
  email: string
  password: string
}

export interface ClienteAuthResponseDto {
  token: string
  personaId: number
  nombre: string
  expiraUtc: string
}

export interface SelectEmpresaResponseDto {
  token: string
  tenant: string
  empresaNombre: string
  userId: number
  expiraUtc: string
}

export interface EmpresaResponseDto {
  id: string
  nombre: string
  activo: boolean
}

export interface ServicioResponseDto {
  idServicio: number
  nombreServicio: string
  valor: number
  tiempoEstimado: number
}

export interface CreateServicioDto {
  nombreServicio: string
  valor: number
  tiempoEstimado: number
}

export type EstadoCita = 'Pendiente' | 'Confirmada' | 'Atendida' | 'Cancelada'

export interface CitaResponseDto {
  idCita: number
  idCliente: number
  idEmpleado: number
  estado: EstadoCita
  fechaCita: string
  // TimeSpan se serializa como "HH:mm:ss"
  horaEstimadaCita: string
  horaEstimadaFin?: string | null
  observaciones?: string | null
  nombreCliente?: string | null
  nombreEmpleado?: string | null
}

export interface CreateCitaDto {
  idCliente: number
  idEmpleado: number
  fechaCita: string
  horaEstimadaCita: string
  horaEstimadaFin?: string | null
  observaciones?: string | null
}

export interface UsuarioResponseDto {
  id: number
  nombreUsuario: string
  personaId?: number | null
  rol?: string | null
}
