import { useState } from "react";
import { MESES_LARGO, DIAS_LARGO, iso, desdeIso } from "../../utils/fechas";

const CABECERA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Calendario de un mes a la vez, con flechas para pasar de mes.
// `dias` es el resumen del backend: { "2026-09-24": { estado: "libre" | "lleno" | "cerrado" } }
// Blanco = hay lugar · Negro tachado = completo · Apagado = cerrado o fuera de los 30 días.
export default function Calendario({ dias, desde, hasta, fecha, onElegir }) {
  const inicio = desdeIso(desde);
  const fin = desdeIso(hasta);
  const hoy = desde;

  // Mes que se está mirando: el de la fecha elegida, o el primero de la ventana
  const [mesVista, setMesVista] = useState(() => {
    const d = fecha ? desdeIso(fecha) : inicio;
    return [d.getFullYear(), d.getMonth()];
  });
  const [anio, mes] = mesVista;

  const mover = (delta) => {
    const d = new Date(anio, mes + delta, 1);
    setMesVista([d.getFullYear(), d.getMonth()]);
  };
  // Solo se puede navegar dentro de la ventana reservable
  const esPrimerMes = anio === inicio.getFullYear() && mes === inicio.getMonth();
  const esUltimoMes = anio === fin.getFullYear() && mes === fin.getMonth();

  const primero = new Date(anio, mes, 1);
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  // Celdas vacías hasta el día de la semana en que arranca el mes (la semana empieza en lunes)
  const huecos = (primero.getDay() + 6) % 7;

  return (
    <div>
      <div className="mb-[18px] flex items-center justify-between">
        <button className="mes-btn" onClick={() => mover(-1)} disabled={esPrimerMes} aria-label="Mes anterior">←</button>
        <p className="display text-4xl" aria-live="polite">{MESES_LARGO[mes]} {anio}</p>
        <button className="mes-btn" onClick={() => mover(1)} disabled={esUltimoMes} aria-label="Mes siguiente">→</button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {CABECERA.map((d) => <div key={d} className="label pb-2 text-center text-mute">{d}</div>)}
        {Array.from({ length: huecos }, (_, i) => <div key={`h${i}`} />)}

        {Array.from({ length: diasDelMes }, (_, i) => {
          const n = i + 1;
          const f = iso(new Date(anio, mes, n));
          const info = dias[f];
          const etiqueta = f === hoy ? "hoy" : "";

          if (!info) return <div key={f} className="dia fuera-rango">{n}</div>;
          if (info.estado === "cerrado") return <div key={f} className="dia cerrado">{n}<small>{etiqueta}</small></div>;
          if (info.estado === "lleno") return <div key={f} className="dia lleno" aria-label={`${n}, completo`}>{n}<small>lleno</small></div>;

          const d = desdeIso(f);
          return (
            <button
              key={f}
              onClick={() => onElegir(f)}
              className={`dia libre ${fecha === f ? "sel-ring" : ""}`}
              aria-pressed={fecha === f}
              aria-label={`${DIAS_LARGO[d.getDay()]} ${n}`}
            >
              {n}<small>{etiqueta}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
