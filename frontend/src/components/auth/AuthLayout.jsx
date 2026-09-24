import { Link, NavLink, useSearchParams } from "react-router-dom";

// Marco común de Ingresar y Registrarse: fondo, ficha de papel con troquel y pestañas.
// Cada página pone su formulario como children. Así el diseño vive en un solo lugar.
export default function AuthLayout({ children }) {
  const [params] = useSearchParams();
  const next = params.get("next");
  // Las pestañas conservan el ?next=... para no perder a dónde volver después
  const sufijo = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="relative min-h-screen">
      {/* Fondo: la foto del local muy oscurecida + grano */}
      <div className="grain fixed inset-0 -z-10" aria-hidden="true">
        <img src="/barberia3.jpg" alt="" className="h-full w-full object-cover brightness-[.2] contrast-125 grayscale" />
      </div>

      <header className="flex items-center justify-between px-6 py-4">
        <Link to="/"><img src="/logo.jpg" alt="203 Studio" className="block h-[52px] mix-blend-screen" /></Link>
        <Link to="/" className="label text-mute hover:text-paper">← Volver al inicio</Link>
      </header>

      <main className="flex justify-center px-4 pb-16 pt-6">
        <div className="ficha w-full max-w-[440px]">
          <div className="label flex justify-between px-6 pt-4 text-ink-mute">
            <span>203 Studio · Rosario</span>
            <span>Ficha Nº 0204</span>
          </div>

          {/* Pestañas = dos NavLink. NavLink sabe cuál está activa según la URL */}
          <nav className="label relative mx-6 mt-2 grid grid-cols-2 border-b border-ink/15">
            <Pestana to={`/login${sufijo}`}>Ingresar</Pestana>
            <Pestana to={`/registro${sufijo}`}>Registrarse</Pestana>
          </nav>

          <div className="px-6 pb-2 pt-7">
            {next === "reservar" && (
              <p className="label mb-5 bg-ink px-3.5 py-2.5 text-paper">● Ingresá para terminar tu reserva</p>
            )}
            {children}
          </div>

          <div className="troquel" />
          <div className="flex items-center gap-4 px-6 pb-5 pt-1.5">
            <div className="barcode" />
            <span className="label text-ink-mute">Mar–Sáb</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function Pestana({ to, children }) {
  return (
    <NavLink
      to={to}
      replace
      className={({ isActive }) =>
        `-mb-px border-b-[3px] py-4 text-center transition ${isActive ? "border-ink text-ink" : "border-transparent text-ink-mute hover:text-ink"}`
      }
    >
      {children}
    </NavLink>
  );
}
