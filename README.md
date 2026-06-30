# Citas · Frontend

Frontend en **React + TypeScript + Vite** para la API de Citas (.NET).
Repositorio **independiente** del backend (`Citas.slnx`), con su propio control de versiones.
Asume que la API vive en `../Citas/Citas`.

## Requisitos

- Node.js 18+ (probado con 24; la imagen Docker usa Node 20)
- La API de Citas corriendo en `http://localhost:5202`

## Cómo correrlo (desarrollo)

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

## Scripts

| Script            | Qué hace                                                        |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con recarga en caliente (puerto 5173).  |
| `npm run build`   | Compila TypeScript (`tsc -b`) y genera el bundle en `dist/`.   |
| `npm run preview` | Sirve localmente el `dist/` ya compilado para probar el build. |

## Cómo correrlo (Docker / producción)

La imagen es **multi-stage**: compila con Node y sirve los estáticos con **nginx**.

```bash
docker build -t citas-frontend .
docker run -p 8080:80 citas-frontend
```

Abre http://localhost:8080

En este modo el proxy a la API **no lo hace Vite sino nginx** (ver `nginx.conf`):
reenvía `/api/...` a `http://api:8080`, es decir, espera un servicio llamado **`api`**
accesible en la misma red Docker (por ejemplo, vía `docker-compose` o `--network`).
Si tu API usa otro host/puerto, ajústalo en `nginx.conf`.

## ¿Por qué un proxy?

La API **no expone CORS**, así que el front siempre llama a `/api/...` y algo lo
reenvía a la API. Así el navegador nunca hace una petición cross-origin:

- **Desarrollo:** lo reenvía **Vite** a `http://localhost:5202` (ver `vite.config.ts`).
- **Producción (Docker):** lo reenvía **nginx** a `http://api:8080` (ver `nginx.conf`).

Si cambias el puerto del backend, ajústalo en el archivo correspondiente.

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
Dockerfile    build multi-stage (Node) + nginx para servir estáticos
nginx.conf    fallback de SPA + proxy /api a la API en producción
```
