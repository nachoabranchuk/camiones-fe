import axios from "axios";
import type {
  Modulo,
  Formulario,
  Accion,
  Grupo,
  User,
  CreateModuloDto,
  UpdateModuloDto,
  CreateFormularioDto,
  UpdateFormularioDto,
  CreateAccionDto,
  UpdateAccionDto,
  CreateGrupoDto,
  UpdateGrupoDto,
  CreateUserDto,
  UpdateUserDto,
  Marca,
  TipoCarga,
  Chofer,
  Camion,
  Viaje,
  DashboardReportes,
  CreateMarcaDto,
  UpdateMarcaDto,
  CreateTipoCargaDto,
  UpdateTipoCargaDto,
  CreateChoferDto,
  UpdateChoferDto,
  CreateCamionDto,
  UpdateCamionDto,
  CreateViajeDto,
  UpdateViajeDto,
  FinalizarViajeDto,
} from "../types";

const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {
              refreshToken,
            },
          );
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  },
);

// Modulos
export const modulosApi = {
  getAll: async (): Promise<Modulo[]> => {
    const response = await api.get<Modulo[]>("/modulos");
    return response.data;
  },
  getById: async (id: number): Promise<Modulo> => {
    const response = await api.get<Modulo>(`/modulos/${id}`);
    return response.data;
  },
  create: async (data: CreateModuloDto): Promise<Modulo> => {
    const response = await api.post<Modulo>("/modulos", data);
    return response.data;
  },
  update: async (id: number, data: UpdateModuloDto): Promise<Modulo> => {
    const response = await api.put<Modulo>(`/modulos/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/modulos/${id}`);
  },
};

// Formularios
export const formulariosApi = {
  getAll: async (): Promise<Formulario[]> => {
    const response = await api.get<Formulario[]>("/formularios");
    return response.data;
  },
  getById: async (id: number): Promise<Formulario> => {
    const response = await api.get<Formulario>(`/formularios/${id}`);
    return response.data;
  },
  create: async (data: CreateFormularioDto): Promise<Formulario> => {
    const response = await api.post<Formulario>("/formularios", data);
    return response.data;
  },
  update: async (
    id: number,
    data: UpdateFormularioDto,
  ): Promise<Formulario> => {
    const response = await api.put<Formulario>(`/formularios/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/formularios/${id}`);
  },
};

// Acciones
export const accionesApi = {
  getAll: async (): Promise<Accion[]> => {
    const response = await api.get<Accion[]>("/acciones");
    return response.data;
  },
  getById: async (id: number): Promise<Accion> => {
    const response = await api.get<Accion>(`/acciones/${id}`);
    return response.data;
  },
  create: async (data: CreateAccionDto): Promise<Accion> => {
    const response = await api.post<Accion>("/acciones", data);
    return response.data;
  },
  update: async (id: number, data: UpdateAccionDto): Promise<Accion> => {
    const response = await api.put<Accion>(`/acciones/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/acciones/${id}`);
  },
  getPredefinedActions: async (): Promise<
    Array<{ key: string; label: string }>
  > => {
    const response = await api.get<Array<{ key: string; label: string }>>(
      "/acciones/predefinidas/listado",
    );
    return response.data;
  },
  getPredefinedActionsWithGrupos: async (): Promise<
    Array<{
      key: string;
      label: string;
      formulario: string;
      accionNombre: string;
      accionId: number;
      formularios: Array<{ id: number; nombre: string }>;
      grupos: Array<{ id: number; nombre: string }>;
      existsInDb: boolean;
      dbId?: number;
    }>
  > => {
    const response = await api.get<
      Array<{
        key: string;
        label: string;
        formulario: string;
        accionNombre: string;
        accionId: number;
        formularios: Array<{ id: number; nombre: string }>;
        grupos: Array<{ id: number; nombre: string }>;
        existsInDb: boolean;
        dbId?: number;
      }>
    >("/acciones/predefinidas/con-grupos");
    return response.data;
  },
  verifyMatch: async (): Promise<{
    totalInDb: number;
    acciones: Array<{
      id: number;
      nombre: string;
      formulario: string;
      modulo: string;
      key: string;
    }>;
  }> => {
    const response = await api.get("/acciones/verify-match");
    return response.data;
  },
};

// Grupos
export const gruposApi = {
  getAll: async (): Promise<Grupo[]> => {
    const response = await api.get<Grupo[]>("/grupos");
    return response.data;
  },
  getById: async (id: number): Promise<Grupo> => {
    const response = await api.get<Grupo>(`/grupos/${id}`);
    return response.data;
  },
  create: async (data: CreateGrupoDto): Promise<Grupo> => {
    const response = await api.post<Grupo>("/grupos", data);
    return response.data;
  },
  update: async (id: number, data: UpdateGrupoDto): Promise<Grupo> => {
    const response = await api.put<Grupo>(`/grupos/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/grupos/${id}`);
  },
};

// Usuarios
export const usuariosApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/users");
    return response.data;
  },
  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post<User>("/users", data);
    return response.data;
  },
  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Auth
export const authApi = {
  login: async (correo: string, contrasena: string) => {
    const response = await api.post("/auth/login", { correo, contrasena });
    return response.data;
  },
  register: async (data: {
    nombre: string;
    apellido: string;
    correo: string;
    contrasena: string;
    telefono: string;
  }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
  requestPasswordReset: async (correo: string) => {
    const response = await api.post<{ message: string }>(
      "/auth/request-password-reset",
      { correo }
    );
    return response.data;
  },
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
  getModulosAccesibles: async () => {
    const response = await api.get("/auth/modulos-accesibles");
    return response.data;
  },
  puedeAccederModulo: async (moduloNombre: string) => {
    const response = await api.get(`/auth/puede-acceder/${moduloNombre}`);
    return response.data;
  },
  refreshPermissions: async () => {
    const response = await api.get("/auth/modulos-accesibles");
    return response.data;
  },
  getAccionesAccesibles: async () => {
    const response = await api.get("/auth/acciones-accesibles");
    return response.data;
  },
  getUserGrupos: async () => {
    const response = await api.get("/auth/user-grupos");
    return response.data;
  },
  debugPermissions: async () => {
    const response = await api.get("/auth/debug-permissions");
    return response.data;
  },
};

// Reportes
export const reportesApi = {
  getDashboard: async (): Promise<DashboardReportes> => {
    const response = await api.get<DashboardReportes>("/reportes/dashboard");
    return response.data;
  },
};

// Marcas
export const marcasApi = {
  getAll: (activoOnly = true) =>
    api.get<Marca[]>("/marcas", { params: { activo: activoOnly } }).then((r) => r.data),
  getById: (id: string) => api.get<Marca>(`/marcas/${id}`).then((r) => r.data),
  create: (data: CreateMarcaDto) => api.post<Marca>("/marcas", data).then((r) => r.data),
  update: (id: string, data: UpdateMarcaDto) =>
    api.put<Marca>(`/marcas/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/marcas/${id}`),
};

// Tipos de Carga
export const tiposCargaApi = {
  getAll: (activoOnly = true) =>
    api.get<TipoCarga[]>("/tipos-carga", { params: { activo: activoOnly } }).then((r) => r.data),
  getById: (id: string) => api.get<TipoCarga>(`/tipos-carga/${id}`).then((r) => r.data),
  create: (data: CreateTipoCargaDto) =>
    api.post<TipoCarga>("/tipos-carga", data).then((r) => r.data),
  update: (id: string, data: UpdateTipoCargaDto) =>
    api.put<TipoCarga>(`/tipos-carga/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/tipos-carga/${id}`),
};

// Choferes
export const choferesApi = {
  getAll: (activoOnly = true) =>
    api.get<Chofer[]>("/choferes", { params: { activo: activoOnly } }).then((r) => r.data),
  getById: (id: string) => api.get<Chofer>(`/choferes/${id}`).then((r) => r.data),
  create: (data: CreateChoferDto) =>
    api.post<Chofer>("/choferes", data).then((r) => r.data),
  update: (id: string, data: UpdateChoferDto) =>
    api.put<Chofer>(`/choferes/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/choferes/${id}`),
};

// Camiones
export const camionesApi = {
  getAll: (activoOnly = true) =>
    api.get<Camion[]>("/camiones", { params: { activo: activoOnly } }).then((r) => r.data),
  getById: (id: string) => api.get<Camion>(`/camiones/${id}`).then((r) => r.data),
  create: (data: CreateCamionDto) =>
    api.post<Camion>("/camiones", data).then((r) => r.data),
  update: (id: string, data: UpdateCamionDto) =>
    api.put<Camion>(`/camiones/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/camiones/${id}`),
};

// Viajes
export const viajesApi = {
  getAll: (params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    choferId?: string;
    estado?: string;
    origen?: string;
    destino?: string;
  }) => api.get<Viaje[]>("/viajes", { params }).then((r) => r.data),
  getById: (id: string) => api.get<Viaje>(`/viajes/${id}`).then((r) => r.data),
  create: (data: CreateViajeDto) =>
    api.post<Viaje>("/viajes", data).then((r) => r.data),
  update: (id: string, data: UpdateViajeDto) =>
    api.put<Viaje>(`/viajes/${id}`, data).then((r) => r.data),
  finalizar: (id: string, data: FinalizarViajeDto) =>
    api.put<Viaje>(`/viajes/${id}/finalizar`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/viajes/${id}`),
};

export default api;
