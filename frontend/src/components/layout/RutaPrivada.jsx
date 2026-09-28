import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Envuelve páginas que requieren sesión. Sin usuario → al login, recordando a dónde
// volver (?next=...). Es solo comodidad: la protección real es el token en el backend.
export default function RutaPrivada({ volverA, children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to={`/login?next=${volverA}`} replace />;
  return children;
}
