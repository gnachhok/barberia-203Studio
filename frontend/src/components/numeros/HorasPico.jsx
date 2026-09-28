import { Fragment } from "react";
import { HORARIO } from "../../data/local";
import { DIAS } from "../../utils/fechas";
import Tarjeta from "./Tarjeta";

const HORAS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const DIAS_ABIERTOS = [2, 3, 4, 5, 6]; // martes a sábado (0 = domingo)

// Mapa de calor: día de la semana × hora en que empezó el turno.
// Más oscuro = más gente. Sirve para decidir horarios (¿abrir más tarde los martes?).
export default function HorasPico({ porHora }) {
  const cantidad = {};
  for (const c of porHora) cantidad[`${c.dia}-${c.hora}`] = c.n;
  const max = Math.max(1, ...porHora.map((c) => c.n));

  return (
    <Tarjeta titulo="Horas pico" sub="Turnos hechos en el mes, por día y hora de inicio">
      <div className="label grid grid-cols-[38px_repeat(10,1fr)] gap-[3px] text-[10px]!" role="table" aria-label="Turnos por día y hora">
        <span />
        {HORAS.map((h) => <span key={h} className="pb-1 text-center text-[9px]! tracking-normal! text-ink-mute">{h}</span>)}
        {DIAS_ABIERTOS.map((dow) => (
          <Fragment key={dow}>
            <span className="self-center">{DIAS[dow]}</span>
            {HORAS.map((h) => {
              const cerrado = h >= HORARIO[dow][1];
              const n = cantidad[`${dow}-${h}`] || 0;
              return cerrado ? (
                <span key={h} title="Cerrado" className="aspect-square bg-[repeating-linear-gradient(135deg,transparent_0_3px,rgb(10_10_10/.12)_3px_4px)]" />
              ) : (
                <span key={h} title={`${DIAS[dow]} ${h} h: ${n} turnos`}
                  className="aspect-square border border-ink/10"
                  // La opacidad del negro es proporcional a la hora más llena del mes
                  style={{ backgroundColor: n ? `rgb(10 10 10 / ${(0.12 + (n / max) * 0.88).toFixed(2)})` : undefined }} />
              );
            })}
          </Fragment>
        ))}
      </div>
      <div className="label mt-3 flex items-center gap-1 text-[10px]! text-ink-mute">
        Menos
        {[0, 0.3, 0.55, 0.8, 1].map((o) => <i key={o} className="h-2.5 w-4 border border-ink/10" style={{ backgroundColor: `rgb(10 10 10 / ${o})` }} />)}
        Más
      </div>
    </Tarjeta>
  );
}
