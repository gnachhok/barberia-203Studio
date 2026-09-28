import { precio } from "../../utils/fechas";
import { kpis } from "./numerosUtils";

// Los 4 números grandes, cada uno comparado con el mes anterior.
// Un número solo no dice nada: ¿176 turnos es mucho o poco? Depende de cuántos hubo antes.
export default function Kpis({ actual, anterior }) {
  const a = kpis(actual);
  const b = kpis(anterior);
  const huboAntes = anterior.estados.completado > 0;

  const items = [
    { nombre: "Ingresos", valor: precio(a.ingresos), cambio: porcentaje(a.ingresos, b.ingresos) },
    { nombre: "Turnos hechos", valor: a.hechos, cambio: porcentaje(a.hechos, b.hechos) },
    { nombre: "Ticket promedio", valor: precio(a.ticket), cambio: porcentaje(a.ticket, b.ticket) },
    // El ausentismo ya es un %: se compara en puntos (7% → 9% es "+2 pts", no "+28%")
    { nombre: "No vinieron", valor: `${Math.round(a.ausentismo)}%`, cambio: puntos(a.ausentismo, b.ausentismo) },
  ];

  return (
    <section className="grid grid-cols-2 bg-ink text-paper md:col-span-2 md:grid-cols-4">
      {items.map((it) => (
        <div key={it.nombre} className="border-b border-r border-line px-[18px] py-4">
          <p className="label text-[11px]! text-mute">{it.nombre}</p>
          <p className="display my-2 text-[clamp(30px,7vw,40px)]">{it.valor}</p>
          {huboAntes
            ? <span className="label border border-current px-1.5 py-0.5 text-[10px]!">{it.cambio}</span>
            : <span className="label text-[10px]! text-mute">Sin mes anterior</span>}
        </div>
      ))}
    </section>
  );
}

function porcentaje(ahora, antes) {
  if (!antes) return "—";
  const p = Math.round(((ahora - antes) / antes) * 100);
  return p === 0 ? "= igual" : `${p > 0 ? "▲" : "▼"} ${Math.abs(p)}%`;
}

function puntos(ahora, antes) {
  const p = Math.round(ahora - antes);
  return p === 0 ? "= igual" : `${p > 0 ? "▲" : "▼"} ${Math.abs(p)} pts`;
}
