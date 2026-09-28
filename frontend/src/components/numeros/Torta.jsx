import Tarjeta from "./Tarjeta";
import { Muestra } from "./Texturas";
import { TEXTURAS } from "./numerosUtils";

// Cómo terminaron los turnos del mes, en una dona.
// Truco: un círculo de radio 15.9155 mide 100 de circunferencia, así que cada
// porcentaje es directamente el largo del trazo (stroke-dasharray="30 70" = 30%).
const R = 15.9155;

export default function Torta({ estados }) {
  const partes = [
    { nombre: "Hechos", n: estados.completado, textura: "liso" },
    { nombre: "Cancelados", n: estados.cancelado, textura: "raya" },
    { nombre: "No vinieron", n: estados.ausente, textura: "punto" },
    // Solo en el mes en curso: los que todavía no llegaron
    { nombre: "Por venir", n: estados.confirmado, textura: "vacio" },
  ].filter((p) => p.n > 0 || p.textura !== "vacio");
  const total = partes.reduce((s, p) => s + p.n, 0);

  // Cada porción arranca donde terminó la anterior. Se calcula antes del render (render puro).
  let acumulado = 0;
  const arcos = partes.map((p) => {
    const pct = total ? (p.n / total) * 100 : 0;
    const arco = { ...p, pct, desde: acumulado };
    acumulado += pct;
    return arco;
  });
  const hechosPct = total ? Math.round((estados.completado / total) * 100) : 0;

  return (
    <Tarjeta titulo="Cómo terminaron" sub={`${total} turnos reservados en el mes`}>
      {total === 0 ? (
        <p className="text-ink-mute">Todavía no hay turnos este mes.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-6">
          <svg viewBox="0 0 42 42" className="size-[170px]" role="img" aria-label={`${hechosPct}% de los turnos se hicieron`}>
            {arcos.map((a) => (
              <circle key={a.nombre} cx="21" cy="21" r={R} fill="none" strokeWidth="7"
                stroke={TEXTURAS[a.textura].chica}
                strokeDasharray={`${a.pct} ${100 - a.pct}`}
                // 25 = empezar arriba (las 12) en vez de a las 3, que es donde arranca un círculo en SVG
                strokeDashoffset={25 - a.desde} />
            ))}
            <circle cx="21" cy="21" r={R + 3.6} fill="none" stroke="var(--color-ink)" strokeWidth=".35" />
            <circle cx="21" cy="21" r={R - 3.6} fill="none" stroke="var(--color-ink)" strokeWidth=".35" />
            <text x="21" y="22" textAnchor="middle" className="font-display" fontSize="7">{hechosPct}%</text>
            <text x="21" y="26.5" textAnchor="middle" className="font-mono" fontSize="2.3" letterSpacing=".1">HECHOS</text>
          </svg>
          <ul className="grid min-w-[170px] flex-1 gap-2.5">
            {arcos.map((a) => (
              <li key={a.nombre} className="grid grid-cols-[22px_1fr_auto] items-center gap-2.5">
                <Muestra textura={a.textura} />
                <span>{a.nombre}</span>
                <b className="font-semibold">{a.n} · {Math.round(a.pct)}%</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Tarjeta>
  );
}
