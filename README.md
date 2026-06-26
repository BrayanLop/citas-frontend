# Citas · Frontend

Frontend en **React + TypeScript + Vite** para la API de Citas (.NET).
Repositorio **independiente** del backend (`Citas.slnx`), con su propio control de versiones.
Asume que la API vive en `../Citas/Citas`.

## Requisitos

- Node.js 18+ (probado con 24)
- La API de Citas corriendo en `http://localhost:5202`

## Cómo correrlo

1. **Levanta el backend** con el perfil HTTP (importante: evita el redirect a HTTPS):

   ```bash
   cd ../Citas/Citas
   cp appsettings.Example.json appsettings.json   # solo la 1ª vez: pon tu conexión y la clave JWT
   dotnet run --launch-profile http
   ```

2. **Levanta el frontend:**

   ```bash
   npm install
   npm run dev
   ```

   Abre http://localhost:5173

## ¿Por qué un proxy?

La API **no expone CORS**, así que el front llama a `/api/...` y Vite lo reenvía
a `http://localhost:5202` (ver `vite.config.ts`). Así el navegador nunca hace
una petición cross-origin. Si cambias el puerto del backend, ajústalo ahí.

## Flujo de la app (espejo de los endpoints)

1. **Registro / Login** (`POST /Auth/register`, `/Auth/login`) → token global + `personaId`.
2. **Elegir empresa** (`GET /Empresas`, `POST /Auth/select-empresa`) → token con `tenant` + `userId`.
3. **Mis citas** (`GET /Citas?clienteId=`), agendar (`POST /Citas`),
   cambiar estado (`PATCH /Citas/{id}`).
4. **Servicios** (`GET/POST/PUT/DELETE /Servicios`).

Empleados para agendar se cargan de `GET /Usuarios?rol=Empleado`.

## Estructura

```
src/
  api/        cliente axios, tipos (DTOs) y funciones por endpoint
  context/    sesión (AuthContext) y notificaciones (ToastContext)
  components/ Layout, Modal, Spinner, guards de ruta
  pages/      Login, Register, SelectEmpresa, Citas, Agendar, Servicios
  lib/        formato de fechas/horas/moneda y estados de cita
  styles/     index.css (tema completo)
```
