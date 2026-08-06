export default function VisitSection() {
  const mapsUrl = "https://maps.app.goo.gl/Ty7k55zDgTmu6gEp8";
  const direccion = "Ovidio Lagos 2670, Rosario, Santa Fe";
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`;

  return (
    <section
      id="servicios"
      className="py-32 w-full max-w-7xl mx-auto px-6 md:px-16"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-display text-3xl md:text-5xl text-primary uppercase mb-4">
            Visítanos
          </h2>
          <p className="font-body text-lg text-on-surface-variant mb-10 max-w-md">
            Nuestro equipo de profesionales está preparado para brindarte
            una experiencia única en cada visita. 💈✨ Reservá tu turno y
            descubrí el estándar 203.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4 pb-6 border-b border-white/10">
              <span className="text-primary mt-1">📍</span>
              <div>
                <h4 className="font-label text-primary uppercase mb-1 tracking-wider text-xs">
                  Ubicación
                </h4>
                <p className="font-body text-on-surface-variant">
                  {direccion}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-6 border-b border-white/10">
              <span className="text-primary mt-1">🕐</span>
              <div>
                <h4 className="font-label text-primary uppercase mb-1 tracking-wider text-xs">
                  Horarios
                </h4>
                <ul className="font-body text-on-surface-variant space-y-1">
                  <li className="flex justify-between w-48">
                    <span>Mar - Vie</span> <span>10:00 - 20:00</span>
                  </li>
                  <li className="flex justify-between w-48">
                    <span>Sábados</span> <span>10:00 - 18:00</span>
                  </li>
                  <li className="flex justify-between w-48 text-surface-tint">
                    <span>Domingos</span> <span>Cerrado</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 glass-card px-8 py-4 rounded-full font-label text-xs uppercase tracking-widest text-primary hover:bg-white/10 transition-all flex items-center gap-3 w-fit"
          >
            Ver en el mapa →
          </a>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card rounded-xl h-[500px] w-full p-2 relative overflow-hidden block"
        >
          <iframe
            src={mapsEmbedUrl}
            className="w-full h-full rounded-lg border-0 pointer-events-none grayscale invert-[0.92] contrast-[1.1]"
            loading="lazy"
            title="Ubicación 203 Studio"
          />
        </a>
      </div>
    </section>
  );
}
