import axios from "axios";

// Una sola instancia de axios para toda la app.
// La URL se puede cambiar con VITE_API_URL en un .env (ej: al deployar).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

export const TOKEN_KEY = "203-token";

// Interceptor: antes de cada request, si hay token lo agrega en el header.
// Así ningún componente tiene que acordarse de mandarlo a mano.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Saca el mensaje de error que manda el backend ({ error: "..." }) o uno genérico
export function mensajeDeError(err, porDefecto = "Algo salió mal. Probá de nuevo en un rato.") {
  if (!err.response) return "No pudimos conectarnos con el servidor. Revisá tu conexión.";
  return err.response.data?.error || porDefecto;
}
