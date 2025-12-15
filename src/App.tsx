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
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
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
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute moduloNombre="Dashboard">
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/modulos"
            element={
              <ProtectedRoute moduloNombre="Módulos">
                <Layout>
                  <ModulosPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/formularios"
            element={
              <ProtectedRoute moduloNombre="Formularios">
                <Layout>
                  <FormulariosPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/acciones"
            element={
              <ProtectedRoute moduloNombre="Acciones">
                <Layout>
                  <AccionesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/grupos"
            element={
              <ProtectedRoute moduloNombre="Grupos">
                <Layout>
                  <GruposPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute moduloNombre="Usuarios">
                <Layout>
                  <UsuariosPage />
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
