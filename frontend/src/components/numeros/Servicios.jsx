import { precio } from "../../utils/fechas";
import Tarjeta from "./Tarjeta";
import { FONDO_CSS } from "./numerosUtils";

const METODOS = [
  { clave: "efectivo", nombre: "Efectivo", textura: "liso", icono: "■" },
  { clave: "transferencia", nombre: "Transferencia", textura: "raya", icono: "▨" },
  { clave: "tarjeta", nombre: "Tarjeta", textura: "punto", icono: "▦" },
];

// Servicios más pedidos + cómo se cobró (efectivo / transferencia)
export default function Servicios({ servicios, metodos }) {
  const totalTurnos = servicios.reduce((s, x) => s + x.n, 0);
  const totalCobrado = Object.values(metodos).reduce((s, x) => s + x, 0);
  const cobros = METODOS.filter((m) => metodos[m.clave]).map((m) => ({ ...m, pct: (metodos[m.clave] / totalCobrado) * 100 }));

  return (
    <Tarjeta titulo="Lo más pedido" sub="Turnos hechos por servicio">
      {totalTurnos === 0 && <p className="text-ink-mute">Todavía no hay turnos hechos.</p>}
      <ul className="grid gap-3">
        {servicios.map((s) => (
          <li key={s.nombre} className="grid gap-1.5">
            <div className="flex justify-between gap-3">
              <span>{s.nombre}</span>
              <span className="label text-[11px]!">{s.n} · {precio(s.total)}</span>
            </div>
            <div className="h-3.5 border-[1.5px] border-ink">
              <div className="h-full bg-ink" style={{ width: `${(s.n / totalTurnos) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>

      {cobros.length > 0 && (
        <>
          <p className="label mt-5 text-[11px]! text-ink-mute">Cobrado</p>
          <div className="mt-2 flex h-[18px] border-[1.5px] border-ink">
            {cobros.map((c) => <div key={c.clave} className={FONDO_CSS[c.textura]} style={{ width: `${c.pct}%` }} />)}
          </div>
          <div className="label mt-1.5 flex flex-wrap justify-between gap-2 text-[11px]!">
            {cobros.map((c) => <span key={c.clave}>{c.icono} {c.nombre} {Math.round(c.pct)}%</span>)}
          </div>
        </>
      )}
    </Tarjeta>
  );
}
