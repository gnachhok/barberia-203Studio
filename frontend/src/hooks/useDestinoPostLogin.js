import { useNavigate, useSearchParams } from "react-router-dom";
import { esStaff } from "../utils/roles";

// Después de ingresar/registrarse: si veníamos de algún lado (?next=reservar),
// volvemos ahí. Si no, un barbero/admin va directo a su agenda y un cliente a la Home.
// Solo se aceptan rutas internas conocidas, para que nadie arme un link que te
// mande a otro sitio después del login.
const DESTINOS = { reservar: "/reservar", "mis-reservas": "/mis-reservas", perfil: "/perfil", panel: "/panel" };

export function useDestinoPostLogin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  return (usuario) => {
    const destino = DESTINOS[params.get("next")] || (esStaff(usuario) ? "/panel" : "/");
    navigate(destino, { replace: true });
  };
}
