import PricingCard from "./PricingCard";

const services = [
  {
    label: "Servicio Especializado",
    title: "Barba Sola",
    price: "$12.000",
    features: [
      "Duración: 30min",
      "Perfilado y diseño de precisión",
      "Adaptado a la forma del rostro",
    ],
    ctaText: "Seleccionar",
    highlighted: false,
  },
  {
    label: "Servicio Básico",
    title: "Corte Simple",
    price: "$18.000",
    features: [
      "Duración: 1hs",
      "Corte a tijera o máquina",
      "Peinado con productos de línea exclusiva",
    ],
    ctaText: "Seleccionar",
    highlighted: false,
  },
  {
    label: "Experiencia Completa",
    badge: "Popular",
    title: "Corte y Barba",
    price: "$22.000",
    features: [
      "Duración: 1hs",
      "Recorte y perfilado de barba",
      "Hidratación facial post-afeitado",
    ],
    ctaText: "Seleccionar Experiencia",
    highlighted: true,
  },
];

export default function ServicesGrid() {
  return (
    <section
      className="relative w-full pt-36 pb-32"
      style={{
        backgroundImage:
          "linear-gradient(rgba(5,5,5,0.7), rgba(5,5,5,0.7)), url('/barberia3.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: "#050505",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col items-center">
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl md:text-7xl tracking-tight text-primary mb-4">
            Servicios
          </h1>
          <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto">
            Precisión técnica y elegancia fluida. Seleccioná el servicio que
            mejor se adapte a tu estilo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {services.map((s) => (
            <PricingCard key={s.title} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
