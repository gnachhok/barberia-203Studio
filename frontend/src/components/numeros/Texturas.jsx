import { TEXTURAS } from "./numerosUtils";

// En B&N no se pueden separar las partes de un gráfico por color: se separan por TEXTURA.
// Bonus: se entiende igual para quien no distingue colores, o si lo imprimís.

// Los <pattern> se definen UNA vez en la página y todos los gráficos los usan con url(#id).
// Van en un <svg> de tamaño 0 (no display:none: los navegadores no pintan patterns ocultos así).
export function DefsTexturas() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        {/* "-s": para la torta, que dibuja en un viewBox chiquito (42 unidades) */}
        <Raya id="raya-s" lado={1.6} grosor={0.7} />
        <Punto id="punto-s" lado={1.8} radio={0.45} />
        <Raya id="raya" lado={8} grosor={3} />
        <Punto id="punto" lado={7} radio={1.6} />
      </defs>
    </svg>
  );
}

function Raya({ id, lado, grosor }) {
  return (
    <pattern id={id} width={lado} height={lado} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width={lado} height={lado} fill="var(--color-paper)" />
      <rect width={grosor} height={lado} fill="var(--color-ink)" />
    </pattern>
  );
}

function Punto({ id, lado, radio }) {
  return (
    <pattern id={id} width={lado} height={lado} patternUnits="userSpaceOnUse">
      <rect width={lado} height={lado} fill="var(--color-paper)" />
      <circle cx={lado / 2} cy={lado / 2} r={radio} fill="var(--color-ink)" />
    </pattern>
  );
}

// Cuadradito de leyenda
export function Muestra({ textura }) {
  return (
    <svg viewBox="0 0 22 22" className="size-[22px] shrink-0 border-[1.5px] border-ink" aria-hidden="true">
      <rect width="22" height="22" fill={TEXTURAS[textura].grande} />
    </svg>
  );
}
