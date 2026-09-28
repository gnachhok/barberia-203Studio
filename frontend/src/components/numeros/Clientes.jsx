import { MESES, desdeIso } from "../../utils/fechas";
import Tarjeta from "./Tarjeta";

// Los que más vinieron en el mes y los que hace rato no vuelven (con teléfono para escribirles).
// Solo clientes con cuenta: a los cargados a mano no hay forma de reconocerlos entre visitas.
export default function Clientes({ frecuentes, sinVenir, diasSinVenir }) {
  return (
    <Tarjeta titulo="Clientes" sub="Los fieles y los que hace rato no vienen">
      <p className="label mb-1 text-[11px]!">Los que más vinieron</p>
      {frecuentes.length === 0 && <p className="py-2 text-ink-mute">Nadie con cuenta todavía este mes.</p>}
      <ul>
        {frecuentes.map((c, i) => (
          <li key={i} className="flex justify-between gap-3 border-t border-ink/10 py-2.5 first:border-t-0">
            <span>{c.nombre} {c.apellido}</span>
            <span className="label text-[11px]! text-ink-mute">{c.veces} {c.veces === 1 ? "vez" : "veces"}</span>
          </li>
        ))}
      </ul>

      <p className="label mb-1 mt-4 text-[11px]!">Hace +{diasSinVenir} días que no vienen</p>
      {sinVenir.length === 0 && <p className="py-2 text-ink-mute">Ninguno. Todos volvieron.</p>}
      <ul>
        {sinVenir.map((c, i) => {
          const d = desdeIso(c.ultima);
          return (
            <li key={i} className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 border-t border-ink/10 py-2.5 first:border-t-0">
              <span>{c.nombre} {c.apellido}</span>
              <span className="label text-[11px]! text-ink-mute">
                última: {d.getDate()} {MESES[d.getMonth()]}
                {c.telefono && <> · <a href={`tel:${c.telefono}`} className="border-b">{c.telefono}</a></>}
              </span>
            </li>
          );
        })}
      </ul>
    </Tarjeta>
  );
}
