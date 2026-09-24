// Cinta que corre. El texto va DOS veces seguido: la animación mueve la pista
// -50% (exactamente una copia) y vuelve a empezar, así el loop no tiene salto.
export default function Marquee({ items, className = "", tamano = "text-[34px]", duracion = "22s" }) {
  const texto = items.join(" ✕ ") + " ✕";
  return (
    <div className={`overflow-hidden py-3.5 ${className}`}>
      <div className={`marquee-track display gap-10 ${tamano}`} style={{ "--duracion": duracion }} aria-hidden="true">
        <span>{texto}</span>
        <span>{texto}</span>
      </div>
      {/* Para lectores de pantalla: una sola vez y sin animación */}
      <p className="sr-only">{items.join(", ")}</p>
    </div>
  );
}
