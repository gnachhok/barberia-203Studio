import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* Reemplazar por una imagen real de la barbería */}
        <img
          alt="Fondo estudio"
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
          src="/barberia.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-surface-container-lowest" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 flex flex-col items-start justify-center h-full pt-32">
        <h1 className="font-display text-5xl md:text-8xl text-primary max-w-4xl tracking-tighter leading-[0.9]">
          EL CORTE
          <br />
          PERFECTO
        </h1>
        <p className="font-body text-base md:text-lg text-on-surface-variant mt-8 max-w-lg">
          203 Studio fue creado en 2021 con una visión clara: elevar tu
          imagen a través de un servicio de calidad y atención
          personalizada.
        </p>
        <div className="mt-12 flex gap-6">
          <button
            onClick={() => navigate("/reserva")}
            className="btn-ghost px-8 py-4 rounded-full font-label text-xs uppercase tracking-widest text-primary"
          >
            Agenda tu Turno
          </button>
          <a href="#trabajos" className="btn-editorial py-4">
            Nuestros Servicios
          </a>
        </div>
      </div>
    </section>
  );
}
