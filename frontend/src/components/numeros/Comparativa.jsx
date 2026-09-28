import { precio } from "../../utils/fechas";
import Tarjeta from "./Tarjeta";
import { FONDO_CSS } from "./numerosUtils";

const TEXTURAS = ["liso", "raya", "punto"];

// Barberos lado a lado. Solo en la vista de todo el local (admin).
export default function Comparativa({ porBarbero }) {
  // Turnos de cuentas borradas vienen sin nombre: no suman a la comparación
  const barberos = porBarbero.filter((b) => b.nombre);
  const total = barberos.reduce((s, b) => s + b.n, 0);
  const titulo = barberos.length === 2 ? `${barberos[0].nombre} vs ${barberos[1].nombre}` : "Por barbero";

  return (
    <Tarjeta titulo={titulo} sub="Turnos hechos y lo que cobró cada uno">
      {total === 0 ? (
        <p className="text-ink-mute">Todavía no hay turnos hechos.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {barberos.map((b) => (
              <div key={b.nombre}>
                <p className="label text-[11px]! text-ink-mute">{b.nombre}</p>
                <p className="display my-1.5 text-[34px]">{b.n}</p>
                <p className="label text-[11px]! text-ink-mute">turnos · {precio(b.total)}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex h-[18px] border-[1.5px] border-ink">
            {barberos.map((b, i) => <div key={b.nombre} className={FONDO_CSS[TEXTURAS[i % 3]]} style={{ width: `${(b.n / total) * 100}%` }} />)}
          </div>
        </>
      )}
    </Tarjeta>
  );
}
