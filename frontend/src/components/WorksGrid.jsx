import { Link } from "react-router-dom";
const works = [
  { id: 1, src: "/corte3.jpg", alt: "Corte moderno con fade" },
  { id: 2, src: "/corte2.jpg", alt: "Herramientas de barbero" },
  { id: 3, src: "/corte1.jpg", alt: "Corte textured crop con barba" },
];

export default function WorksGrid() {
  return (
    <section id="trabajos" className="py-32 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-16 mb-16 flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h2 className="font-display text-3xl md:text-5xl text-primary tracking-tighter uppercase">
            Nuestros Trabajos
          </h2>
          <p className="font-label text-xs text-on-surface-variant mt-2 uppercase tracking-widest">
            Galería
          </p>
        </div>
      <Link
        to="/galeria"
        className="btn-ghost px-6 py-2 rounded-full font-label text-xs uppercase tracking-widest text-primary transition-all duration-300"
      >
        Ver Galería
      </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
        <div className="md:col-span-8 glass-card rounded-xl overflow-hidden relative group h-80 md:h-full">
          <img
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
            src={works[0].src}
            alt={works[0].alt}
          />
        </div>
        <div className="md:col-span-4 flex flex-col gap-6 h-full">
          {works.slice(1).map((w) => (
            <div
              key={w.id}
              className="glass-card rounded-xl overflow-hidden relative group flex-1 h-64 md:h-auto"
            >
              <img
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                src={w.src}
                alt={w.alt}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
