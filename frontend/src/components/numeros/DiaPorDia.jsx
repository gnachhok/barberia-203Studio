import { useNavigate } from "react-router-dom";
import { iso } from "../../utils/fechas";
import Tarjeta from "./Tarjeta";
import { FONDO_CSS, diasAbiertos } from "./numerosUtils";

// Una barra por cada día que abrió el local. El más lleno, en negro.
// Son divs y no un SVG: con flex se adaptan solas al ancho del celular sin deformar los números.
// Tocar una barra abre la agenda de ese día.
export default function DiaPorDia({ mes, porDia, barberoId }) {
  const navigate = useNavigate();
  const hoy = iso(new Date());
  const cantidad = Object.fromEntries(porDia.map((d) => [d.fecha, d.n]));
  const dias = diasAbiertos(mes).map((d) => ({ ...d, n: cantidad[d.fecha] || 0, futuro: d.fecha > hoy }));
  const max = Math.max(1, ...dias.map((d) => d.n));
  const hayDatos = dias.some((d) => d.n > 0);

  const abrir = (fecha) => navigate(`/panel?fecha=${fecha}${barberoId ? `&barbero=${barberoId}` : ""}`);

  return (
    <Tarjeta titulo="Día por día" sub="Turnos hechos cada día que abrió. Tocá uno para ver su agenda." className="md:col-span-2">
      <div className="flex h-[170px] items-end gap-[3px] border-b-[1.5px] border-ink sm:gap-1.5">
        {dias.map((d) => {
          const esMax = hayDatos && d.n === max;
          return (
            <button key={d.fecha} onClick={() => abrir(d.fecha)} disabled={d.futuro}
              aria-label={`${d.dia}: ${d.n} turnos`} title={`${d.dia}: ${d.n} turnos`}
              className="group flex h-full min-w-0 flex-1 flex-col justify-end disabled:cursor-default">
              {esMax && <span className="label mb-1 text-center text-[10px]!">{d.n}</span>}
              {d.n > 0 && (
                <span className={`block border-[1.5px] border-b-0 border-ink transition group-hover:bg-ink ${esMax ? FONDO_CSS.liso : FONDO_CSS.raya}`}
                  style={{ height: `${(d.n / max) * 82}%` }} />
              )}
            </button>
          );
        })}
      </div>
      {/* Números de día: el sábado más marcado, para ubicar las semanas de un vistazo */}
      <div className="mt-1.5 flex gap-[3px] sm:gap-1.5">
        {dias.map((d) => (
          <span key={d.fecha} className={`label min-w-0 flex-1 text-center text-[9px]! tracking-normal! ${d.dow === 6 ? "text-ink" : "text-ink-mute"} ${d.futuro ? "opacity-40" : ""}`}>
            {d.dia}
          </span>
        ))}
      </div>
    </Tarjeta>
  );
}
