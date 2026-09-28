import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Encabezado del panel + pestañas Agenda | Números.
// Son dos rutas (/panel y /panel/numeros) y no un useState: así el "atrás"
// del celular y recargar la página te dejan donde estabas.
export default function PanelEncabezado() {
  const { logout } = useAuth();
  const pestaña = ({ isActive }) =>
    `label flex-1 border-b-[3px] py-3.5 text-center ${isActive ? "border-ink" : "border-transparent text-ink-mute"}`;

  return (
    <>
      {/* Simple: acá no hace falta el navbar del sitio */}
      <header className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
        <span className="display text-xl">203 · Panel</span>
        <div className="label flex gap-4 text-ink-mute">
          <Link to="/" className="hover:text-ink">Ver sitio</Link>
          <button onClick={logout} className="hover:text-ink">Salir</button>
        </div>
      </header>
      <nav className="flex border-b border-ink/10" aria-label="Secciones del panel">
        {/* end: sin esto, /panel también quedaría activo estando en /panel/numeros */}
        <NavLink to="/panel" end className={pestaña}>Agenda</NavLink>
        <NavLink to="/panel/numeros" className={pestaña}>Números</NavLink>
      </nav>
    </>
  );
}
