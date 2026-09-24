import { useNavigate, useSearchParams } from "react-router-dom";

// Después de ingresar/registrarse: si veníamos de algún lado (?next=reservar),
// volvemos ahí; si no, a la Home. Solo se aceptan rutas internas conocidas,
// para que nadie arme un link que te mande a otro sitio después del login.
const DESTINOS = { reservar: "/reservar" };

export function useDestinoPostLogin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const destino = DESTINOS[params.get("next")] || "/";
  return () => navigate(destino, { replace: true });
}
