import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router no hace scroll solo al navegar:
// - si la URL tiene #ancla (ej: /#nosotros) baja hasta esa sección
// - si no, vuelve arriba de todo (si no, la página nueva abre scrolleada)
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
