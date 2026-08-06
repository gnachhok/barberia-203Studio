import { Link, NavLink, useNavigate } from "react-router-dom";

// Clases del link según esté activo o no (misma lógica para todos los links del navbar)
const linkClass = ({ isActive }) =>
  `font-label text-xs uppercase tracking-widest pb-1 transition-all duration-300 ${
    isActive
      ? "text-primary border-b border-primary"
      : "text-on-surface-variant hover:text-primary"
  }`;

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 mx-auto max-w-7xl h-16">
      <Link to="/" className="h-16 flex items-center">
        <span className="font-display text-2xl tracking-tight text-primary">
          203 STUDIO
        </span>
      </Link>

      <div className="hidden md:flex gap-8 items-center">
        <NavLink to="/" end className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/galeria" className={linkClass}>
          Galería
        </NavLink>
        <NavLink to="/servicios" className={linkClass}>
          Servicios
        </NavLink>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/login")}
          className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all duration-300 hidden md:block"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/reserva")}
          className="font-label text-xs uppercase tracking-widest bg-primary text-on-primary px-6 py-2 rounded-full hover:opacity-80 transition-all"
        >
          Reserva
        </button>
      </div>
    </nav>
  );
}
