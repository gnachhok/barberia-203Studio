import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { esStaff } from "../../utils/roles";

// Secciones del sitio. Las de la Home son anclas (/#nosotros): ScrollManager baja hasta ahí.
const SECCIONES = [
  { to: "/", nombre: "Inicio", activa: (p) => p === "/" },
  { to: "/#nosotros", nombre: "Barberos", activa: (p) => p.startsWith("/barberos") },
  { to: "/galeria", nombre: "Galería", activa: (p) => p === "/galeria" },
  { to: "/#contacto", nombre: "Contacto", activa: () => false },
];

// Opciones del menú "Hola, nombre ▾" (y del menú del celular).
// "Mi agenda" solo le aparece a barberos y admin.
const opcionesCuenta = (usuario) => [
  ...(esStaff(usuario) ? [{ to: "/panel", nombre: "Mi agenda" }] : []),
  { to: "/mis-reservas", nombre: "Mis reservas" },
  { to: "/perfil", nombre: "Mi perfil" },
];

// Navbar común a todas las páginas.
// - secciones=false en la Home: ahí cada sección ya tiene su botón y quedaba sobrecargado.
// - mostrarReservar=false en la propia página de reserva (ya estás ahí).
// Desde xl: logo (+ secciones) | cuenta centrada | Reservar. Abajo de xl: logo | Reservar | Menú
// (en pantallas medianas las secciones + la cuenta no entran sin pisarse).
export default function Navbar({ secciones = true, mostrarReservar = true }) {
  const { usuario, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-sm">
      {/* Grilla 1fr | auto | 1fr: las columnas de los costados siempre miden lo mismo,
          así lo del medio queda centrado de verdad aunque los costados midan distinto */}
      <div className="wrap flex h-[72px] items-center justify-between gap-4 xl:grid xl:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-8">
          <Link to="/" aria-label="203 Studio, inicio" className="shrink-0">
            {/* mix-blend-mode: screen vuelve transparente el negro del JPG sobre fondo oscuro */}
            <img src="/logo.jpg" alt="203 Studio" className="block h-[52px] mix-blend-screen" />
          </Link>
          {secciones && (
            <nav aria-label="Secciones" className="label hidden gap-6 xl:flex">
              {SECCIONES.map((s) => (
                <Link
                  key={s.nombre}
                  to={s.to}
                  aria-current={s.activa(pathname) ? "page" : undefined}
                  className={`navlink ${s.activa(pathname) ? "border-paper! text-paper!" : ""}`}
                >
                  {s.nombre}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="label hidden xl:block">
          {usuario ? <MenuUsuario nombre={usuario.nombre} onSalir={logout} /> : <LinksCuenta />}
        </div>

        <div className="flex items-center justify-end gap-3">
          {mostrarReservar && (
            <Link to="/reservar" className="btn btn-solid px-[18px]! py-3!">Reservar →</Link>
          )}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            className="label border-2 border-line px-3 py-3 transition hover:border-paper xl:hidden"
          >
            {menuAbierto ? "Cerrar ✕" : "Menú ☰"}
          </button>
        </div>
      </div>

      {/* Menú del celular: secciones + cuenta */}
      {menuAbierto && (
        <div id="menu-movil" className="entra border-t border-line bg-ink xl:hidden">
          <nav aria-label="Secciones" className="wrap flex flex-col py-2">
            {SECCIONES.map((s) => (
              <Link
                key={s.nombre}
                to={s.to}
                onClick={cerrarMenu}
                aria-current={s.activa(pathname) ? "page" : undefined}
                className="display border-b border-line py-4 text-[32px] last:border-0"
              >
                {s.nombre}
              </Link>
            ))}
          </nav>
          <div className="wrap label flex flex-wrap items-center gap-6 border-t border-line py-5 text-mute">
            {usuario ? (
              <>
                <span className="basis-full">Hola, <span className="text-paper">{usuario.nombre}</span></span>
                {opcionesCuenta(usuario).map((o) => (
                  <Link key={o.to} to={o.to} onClick={cerrarMenu} className="text-paper">{o.nombre}</Link>
                ))}
                <button onClick={() => { cerrarMenu(); logout(); }} className="label border-b text-mute">Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={cerrarMenu} className="text-paper">Ingresar</Link>
                <Link to="/registro" onClick={cerrarMenu} className="border-b text-paper">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
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

function MenuUsuario({ nombre, onSalir }) {
  const { usuario } = useAuth();
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
        Hola, <span className="text-paper">{nombre}</span> ▾
      </button>
      {abierto && (
        <div className="absolute left-1/2 top-full z-50 mt-3 min-w-[200px] -translate-x-1/2 border border-line bg-ink p-2">
          {opcionesCuenta(usuario).map((o) => (
            <Link
              key={o.to}
              to={o.to}
              onClick={() => setAbierto(false)}
              className="label block px-3 py-3 text-paper hover:bg-paper hover:text-ink"
            >
              {o.nombre}
            </Link>
          ))}
          <div className="my-1 border-t border-line" />
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
