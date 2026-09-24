import { createContext, useContext, useState } from "react";
import { api, TOKEN_KEY } from "../api/client";

const USUARIO_KEY = "203-usuario";

// El usuario logueado lo necesitan componentes que no tienen relación entre sí
// (Navbar, Reservar, Login...). En vez de pasarlo por props de padre a hijo en
// toda la app ("prop drilling"), lo ponemos en un Context y cada uno lo lee con useAuth().
const AuthContext = createContext(null);

function leerUsuarioGuardado() {
  try {
    const guardado = localStorage.getItem(USUARIO_KEY);
    return guardado && localStorage.getItem(TOKEN_KEY) ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Al cargar la página recuperamos la sesión de localStorage (si había)
  const [usuario, setUsuario] = useState(leerUsuarioGuardado);

  function guardarSesion({ usuario, token }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    setUsuario(usuario);
  }

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    guardarSesion(data);
    return data.usuario;
  }

  async function registro(datos) {
    const { data } = await api.post("/auth/registro", datos);
    guardarSesion(data);
    return data.usuario;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth tiene que usarse dentro de <AuthProvider>");
  return ctx;
}
