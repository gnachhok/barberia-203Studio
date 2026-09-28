import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { tieneRol } from "../../utils/roles";

// Envuelve páginas que requieren sesión (y opcionalmente un rol).
// - Sin usuario → al login, recordando a dónde volver (?next=...).
// - Con usuario pero sin el rol pedido → a la Home.
// Es solo comodidad: la protección real es el token + roles en el backend.
export default function RutaPrivada({ volverA, roles, children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to={`/login?next=${volverA}`} replace />;
  if (roles && !tieneRol(usuario, ...roles)) return <Navigate to="/" replace />;
  return children;
}
