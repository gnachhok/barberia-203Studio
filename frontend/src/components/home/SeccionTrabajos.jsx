import { Link } from "react-router-dom";
import { DESTACADAS } from "../../data/galeria";

export default function SeccionTrabajos() {
  return (
    <section id="trabajos" className="border-t border-line">
      <div className="wrap py-24">
        <div className="tag justify-between">
          <div className="flex items-baseline gap-4">
            <span className="label text-mute">02</span>
            <h2 className="display text-[56px]">Trabajos</h2>
          </div>
          <Link to="/galeria" className="label hidden border-b md:inline">Ver galería completa →</Link>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
          {DESTACADAS.map((src, i) => (
            // la del medio baja un poco: rompe la grilla y le da ritmo
            <div key={src} className={`photo-box grain relative aspect-[3/4] overflow-hidden ${i === 1 ? "md:mt-12" : ""}`}>
              <img className="photo h-full w-full object-cover" src={src} alt="Corte hecho en 203 Studio" loading="lazy" />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/galeria" className="btn btn-line">Ver galería →</Link>
        </div>
      </div>
    </section>
  );
}
