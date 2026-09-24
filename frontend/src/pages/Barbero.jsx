import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import InstagramIcon from "../components/ui/InstagramIcon";
import { BARBEROS, iniciales } from "../data/barberos";

// Una sola página para todos los barberos: lee el slug de la URL (/barberos/nico)
// y arma el perfil con esos datos. Un barbero nuevo = un registro más, no otra página.
export default function Barbero() {
  const { slug } = useParams();
  const indice = BARBEROS.findIndex((b) => b.slug === slug);
  const b = BARBEROS[indice];

  useEffect(() => {
    if (b) document.title = `${b.nombre} ${b.apellido} · 203 Studio`;
    return () => { document.title = "203 Studio · Barbería"; };
  }, [b]);

  if (!b) return <Navigate to="/#nosotros" replace />;

  // El "otro" barbero para el bloque del final (con más de dos, el siguiente en la lista)
  const otro = BARBEROS[(indice + 1) % BARBEROS.length];
  const dos = (n) => String(n).padStart(2, "0");

  return (
    <>
      <Navbar />
      <main>
        <section className="wrap grid items-start gap-14 pb-24 pt-12 md:grid-cols-[.9fr_1.1fr]">
          <div className="grain relative aspect-[4/5] border-2 border-paper">
            {b.foto ? (
              <img src={b.foto} alt={`${b.nombre} ${b.apellido}`} className="photo h-full w-full object-cover" />
            ) : (
              <div className="vacio">
                <span className="display text-[120px] text-[#333]">{iniciales(b)}</span>
                <span className="label">Foto próximamente</span>
              </div>
            )}
            <div className="sticker right-[-14px] top-5">Nº {dos(indice + 1)}</div>
          </div>

          <div>
            <Link to="/#nosotros" className="label relative z-10 inline-block py-1.5 text-mute hover:text-paper">← Quiénes cortan</Link>
            <p className="label mt-8 text-mute">Barbero {dos(indice + 1)} / {dos(BARBEROS.length)}</p>
            <h1 className="display mt-3.5 text-[clamp(64px,8.5vw,128px)]">{b.nombre}<br />{b.apellido}</h1>
            <p className="mb-9 mt-7 max-w-[520px] text-xl leading-relaxed text-[#cfcdc8]">{b.frase}</p>

            {/* Ficha de datos: grilla 2x2 con líneas finas */}
            <dl className="grid grid-cols-2 border-t border-line">
              {b.datos.map(([k, v], i) => (
                <div key={k} className={`border-b border-line py-4 ${i % 2 === 0 ? "border-r pr-4" : "pl-4"}`}>
                  <dt className="label mb-1.5 text-mute">{k}</dt>
                  <dd className="text-lg font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-9 flex flex-wrap gap-4">
              {/* El slug viaja en la URL: la reserva ya abre con este barbero elegido */}
              <Link to={`/reservar?barbero=${b.slug}`} className="btn btn-solid">Reservar con {b.apodo} →</Link>
              <a
                href={`https://www.instagram.com/${b.instagram}/`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Instagram de ${b.nombre}`}
                className="label inline-flex h-[60px] items-center gap-3 border-2 border-paper px-5 transition hover:bg-paper hover:text-ink"
              >
                <InstagramIcon size={22} /> @{b.instagram}
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="wrap py-24">
            <h2 className="display mb-10 text-[56px]">Preguntas rápidas</h2>
            {b.preguntas.map(([pregunta, respuesta], i) => (
              <div key={pregunta} className="grid grid-cols-[48px_1fr] items-baseline gap-6 border-t border-line py-7 last:border-b md:grid-cols-[80px_1fr_1.2fr]">
                <span className="label text-mute">{dos(i + 1)}</span>
                <p className="text-lg text-[#cfcdc8]">{pregunta}</p>
                <p className="display col-start-2 text-4xl leading-none md:col-start-auto">{respuesta}</p>
              </div>
            ))}
          </div>
        </section>

        {otro !== b && (
          <Link to={`/barberos/${otro.slug}`} className="group grid grid-cols-[1fr_auto] items-center gap-8 bg-paper text-ink md:grid-cols-[auto_1fr_auto]">
            <div className="grain relative my-6 ml-6 hidden aspect-square w-[180px] md:block">
              <div className="vacio bg-[repeating-linear-gradient(135deg,#dcdad4_0_12px,#e5e3dd_12px_24px)]!">
                <span className="display text-[56px] text-[#bbb]">{iniciales(otro)}</span>
              </div>
            </div>
            <div className="py-10 pl-6 md:pl-0">
              <p className="label text-ink-mute">Conocé también a</p>
              <p className="display mt-2.5 text-[clamp(48px,7vw,96px)]">{otro.nombre} {otro.apellido}</p>
            </div>
            <span className="display pr-8 text-[80px] transition-transform duration-300 group-hover:translate-x-3" aria-hidden="true">→</span>
          </Link>
        )}
      </main>
      <Footer />
    </>
  );
}
