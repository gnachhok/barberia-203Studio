import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Rollo from "../components/galeria/Rollo";
import AntesDespues from "../components/galeria/AntesDespues";
import { FOTOS, ANTES_DESPUES } from "../data/galeria";

export default function Galeria() {
  return (
    <>
      <Navbar />
      <main>
        <section className="wrap flex flex-wrap items-end justify-between gap-6 pb-10 pt-16">
          <div>
            {/* relative + z-10: el título grande (line-height .85 + tilde) tapaba este link y se comía el click */}
            <Link to="/" className="label relative z-10 inline-block py-1.5 text-mute hover:text-paper">← Inicio</Link>
            <h1 className="display mt-4 text-[clamp(72px,11vw,160px)]">Galería<span className="punto-claro">.</span></h1>
          </div>
          <p className="label flex items-center gap-2.5 text-mute"><span className="text-lg">⟷</span> Arrastrá el rollo</p>
        </section>

        <Rollo fotos={FOTOS} />

        <section className="border-t border-line">
          <div className="wrap py-24">
            <div className="tag flex-wrap justify-between">
              <h2 className="display text-[56px]">El cambio</h2>
              <span className="label text-mute">Deslizá para ver el antes</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {ANTES_DESPUES.map((par, i) => <AntesDespues key={i} {...par} />)}
            </div>
          </div>
        </section>

        <section className="bg-paper text-ink">
          <div className="wrap flex flex-wrap items-center justify-between gap-6 py-[72px]">
            <h2 className="display text-[clamp(44px,6vw,80px)]">¿Te copaste<br />con alguno?</h2>
            <Link to="/reservar" className="btn btn-dark">Agendar turno →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
