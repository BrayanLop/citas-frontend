import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { AppLayout } from './components/AppLayout'
import { RequireAuth, RequireEmpresa } from './components/RouteGuards'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { SelectEmpresaPage } from './pages/SelectEmpresaPage'
import { CitasPage } from './pages/CitasPage'
import { AgendarPage } from './pages/AgendarPage'
import { ServiciosPage } from './pages/ServiciosPage'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/empresas"
              element={
                <RequireAuth>
                  <SelectEmpresaPage />
                </RequireAuth>
              }
            />

            <Route
              path="/app"
              element={
                <RequireEmpresa>
                  <AppLayout />
                </RequireEmpresa>
              }
            >
              <Route index element={<Navigate to="citas" replace />} />
              <Route path="citas" element={<CitasPage />} />
              <Route path="agendar" element={<AgendarPage />} />
              <Route path="servicios" element={<ServiciosPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/app/citas" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
