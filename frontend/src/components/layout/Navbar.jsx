import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Navbar común a todas las páginas: logo | cuenta (centrado) | Reservar.
// mostrarReservar=false en la propia página de reserva (ya estás ahí).
export default function Navbar({ mostrarReservar = true }) {
  const { usuario, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-sm">
      {/* Desde md: grilla 1fr | auto | 1fr. Las columnas de los costados siempre miden lo mismo,
          así lo del medio queda centrado de verdad aunque el logo y el botón midan distinto.
          En celular no hay columna del medio: alcanza con flex (logo a un lado, acciones al otro). */}
      <div className="wrap flex h-[72px] items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" aria-label="203 Studio, inicio" className="shrink-0">
          {/* mix-blend-mode: screen vuelve transparente el negro del JPG sobre fondo oscuro */}
          <img src="/logo.jpg" alt="203 Studio" className="block h-[52px] mix-blend-screen" />
        </Link>

        <div className="label hidden md:block">
          {usuario ? <MenuUsuario nombre={usuario.nombre} onSalir={logout} /> : <LinksCuenta />}
        </div>

        <div className="flex items-center justify-end gap-4">
          {!usuario && (
            <Link to="/login" className="label navlink md:hidden">Ingresar</Link>
          )}
          {usuario && (
            <div className="label md:hidden"><MenuUsuario nombre={usuario.nombre} onSalir={logout} compacto /></div>
          )}
          {mostrarReservar && (
            <Link to="/reservar" className="btn btn-solid px-[18px]! py-3!">
              Reservar →
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function LinksCuenta() {
  return (
    <div className="flex gap-7">
      <Link to="/login" className="navlink">Ingresar</Link>
      <Link to="/registro" className="navlink">Registrarse</Link>
    </div>
  );
}

function MenuUsuario({ nombre, onSalir, compacto = false }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  // Cerrar el menú al hacer click afuera
  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e) => { if (!ref.current?.contains(e.target)) setAbierto(false); };
    document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, [abierto]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        className="label text-mute transition hover:text-paper"
      >
        {!compacto && "Hola, "}<span className="text-paper">{nombre}</span> ▾
      </button>
      {abierto && (
        <div className={`absolute top-full z-50 mt-3 min-w-[180px] border border-line bg-ink p-2 ${compacto ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
          <button
            onClick={() => { setAbierto(false); onSalir(); }}
            className="label block w-full px-3 py-3 text-left text-mute hover:bg-paper hover:text-ink"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
