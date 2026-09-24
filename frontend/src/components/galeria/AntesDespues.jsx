import { useState } from "react";

// Comparador antes/después. Truco: un <input type="range"> invisible encima de todo.
// El navegador ya resuelve mouse, touch y teclado; nosotros solo leemos su valor
// (0 a 100) y lo pasamos a la variable CSS --p, que mueve línea, perilla y recorte.
// Las fotos van a color a propósito: acá importa ver el detalle del corte.
export default function AntesDespues({ antes, despues }) {
  const [p, setP] = useState(50);

  return (
    <div className="group relative aspect-[4/5] overflow-hidden border-2 border-paper" style={{ "--p": `${p}%` }}>
      <img src={despues} alt="Después" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />

      {/* "Antes" encima, recortado con clip-path hasta --p */}
      <div className="absolute inset-0 [clip-path:inset(0_calc(100%-var(--p))_0_0)]">
        {antes ? (
          <img src={antes} alt="Antes" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="vacio">
            <span className="display text-[40px] text-[#666]">Antes</span>
            <span className="label">Foto próximamente</span>
          </div>
        )}
      </div>

      <span className="label pointer-events-none absolute left-3.5 top-3.5 bg-ink px-2.5 py-1.5">Antes</span>
      <span className="label pointer-events-none absolute right-3.5 top-3.5 bg-ink px-2.5 py-1.5">Después</span>

      <input
        type="range" min="0" max="100" value={p}
        onChange={(e) => setP(Number(e.target.value))}
        aria-label="Comparar antes y después"
        className="peer absolute inset-0 m-0 h-full w-full cursor-ew-resize opacity-0"
      />
      <div className="pointer-events-none absolute inset-y-0 left-[var(--p)] w-0.5 -translate-x-px bg-paper" />
      <div className="label pointer-events-none absolute left-[var(--p)] top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-paper text-sm! text-ink peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-paper">
        ⟷
      </div>
    </div>
  );
}
