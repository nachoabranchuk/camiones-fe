import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import ModulosPage from "./pages/ModulosPage";
import FormulariosPage from "./pages/FormulariosPage";
import AccionesPage from "./pages/AccionesPage";
import GruposPage from "./pages/GruposPage";
import UsuariosPage from "./pages/UsuariosPage";
import ViajesPage from "./pages/ViajesPage";
import ReportsPage from "./pages/ReportsPage";
import ChoferesPage from "./pages/ChoferesPage";
import CamionesPage from "./pages/CamionesPage";
import MarcasPage from "./pages/MarcasPage";
import TiposCargaPage from "./pages/TiposCargaPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/modulos"
            element={
              <ProtectedRoute seccion="Modulos">
                <Layout>
                  <ModulosPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/formularios"
            element={
              <ProtectedRoute seccion="Formularios">
                <Layout>
                  <FormulariosPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/acciones"
            element={
              <ProtectedRoute seccion="Acciones">
                <Layout>
                  <AccionesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/grupos"
            element={
              <ProtectedRoute seccion="Grupos">
                <Layout>
                  <GruposPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute seccion="Usuarios">
                <Layout>
                  <UsuariosPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/viajes"
            element={
              <ProtectedRoute>
                <Layout>
                  <ViajesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/choferes"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChoferesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/camiones"
            element={
              <ProtectedRoute>
                <Layout>
                  <CamionesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marcas"
            element={
              <ProtectedRoute>
                <Layout>
                  <MarcasPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tipos-carga"
            element={
              <ProtectedRoute>
                <Layout>
                  <TiposCargaPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReportsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
