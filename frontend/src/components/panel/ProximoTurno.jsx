import { useState } from "react";
import { api, mensajeDeError } from "../../api/client";
import { aMin, ahoraEnMin, nombreCliente } from "./panelUtils";

const METODOS = [
  { valor: "efectivo", nombre: "Efectivo" },
  { valor: "transferencia", nombre: "Transferencia" },
];

// Botones sobre la tarjeta negra
const btnClaro = "label w-full border-2 border-paper bg-paper px-3 py-4 text-ink";
const btnFantasma = "label w-full border-2 border-paper/40 px-3 py-4 text-paper hover:border-paper";

// La tarjeta negra del próximo turno: lo que el barbero mira el 90% del tiempo.
// Tiene dos "modos": ver el turno, o cobrarlo (al tocar "Terminado").
export default function ProximoTurno({ turno, esHoy, onCambio }) {
  const [cobrando, setCobrando] = useState(false);
  const [noVinoArmado, setNoVinoArmado] = useState(false);
  const [monto, setMonto] = useState(String(Math.round(Number(turno.Servicio?.precio || 0))));
  const [metodo, setMetodo] = useState(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // "en 15 min" / "ahora" / "hace 10 min · sin cerrar"
  let cuando = turno.hora_inicio.slice(0, 5);
  if (esHoy) {
    const falta = aMin(turno.hora_inicio) - ahoraEnMin();
    const termino = aMin(turno.hora_fin) - ahoraEnMin();
    cuando = falta > 0 ? `en ${falta} min · ${cuando}` : termino > 0 ? `ahora · ${cuando}` : `sin cerrar · ${cuando}`;
  }

  async function enviar(accion, datos) {
    setEnviando(true);
    setError("");
    try {
      await api.patch(`/turnos/${turno.id}/${accion}`, datos);
      onCambio(); // recarga la agenda: este turno se apaga y aparece el siguiente
    } catch (err) {
      setError(mensajeDeError(err));
      setEnviando(false);
    }
  }

  function confirmarCobro() {
    if (!metodo) { setError("Elegí cómo pagó"); return; }
    if (!Number(monto)) { setError("Poné cuánto cobraste"); return; }
    enviar("completar", { monto: Number(monto), metodo_pago: metodo });
  }

  function noVino() {
    // Dos toques, como en todo el sitio: un toque sin querer no marca un ausente
    if (!noVinoArmado) { setNoVinoArmado(true); return; }
    enviar("ausente");
  }

  if (cobrando) {
    return (
      <div className="bg-ink p-5 text-paper">
        <p className="label opacity-60">Terminado · {nombreCliente(turno)}</p>
        <label htmlFor="monto" className="label mt-4 block opacity-60">Cobrado</label>
        <div className="flex items-baseline gap-1 border-b-2 border-paper/40">
          <span className="display text-4xl">$</span>
          <input
            id="monto"
            inputMode="numeric"
            value={monto}
            onChange={(e) => { setMonto(e.target.value.replace(/\D/g, "")); setError(""); }}
            className="display w-full bg-transparent py-1 text-[44px] text-paper outline-none"
          />
        </div>
        <p className="label mb-2 mt-5 opacity-60">¿Cómo pagó?</p>
        <div className="grid grid-cols-2 gap-2">
          {METODOS.map((m) => (
            <button key={m.valor} onClick={() => { setMetodo(m.valor); setError(""); }}
              aria-pressed={metodo === m.valor} className={metodo === m.valor ? btnClaro : btnFantasma}>
              {m.nombre}
            </button>
          ))}
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-[#f2a39b]">{error}</p>}
        <div className="mt-4 grid grid-cols-[1fr_2fr] gap-2">
          <button onClick={() => { setCobrando(false); setError(""); }} className={btnFantasma}>Volver</button>
          <button onClick={confirmarCobro} disabled={enviando} className={btnClaro}>
            {enviando ? "Guardando…" : "Confirmar ✓"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ink p-5 text-paper">
      <div className="label flex justify-between">
        <span className="opacity-60">Próximo</span>
        <span>{cuando}</span>
      </div>
      <p className="display mt-3 text-[44px]">{nombreCliente(turno)}</p>
      <p className="mt-1.5 opacity-75">
        {turno.Servicio?.nombre} · {turno.Servicio?.duracion_minutos} min{!turno.cliente_id && " · cargado a mano"}
      </p>
      {turno.notas && <p className="mt-3 border-l-[3px] border-paper px-3 py-1.5 text-sm">“{turno.notas}”</p>}
      {error && <p role="alert" className="mt-3 text-sm text-[#f2a39b]">{error}</p>}
      <div className="mt-4 grid grid-cols-[1fr_1.4fr] gap-2">
        <button onClick={noVino} onBlur={() => setNoVinoArmado(false)} disabled={enviando}
          className={noVinoArmado ? btnClaro : btnFantasma}>
          {noVinoArmado ? "¿Seguro? Tocá de nuevo" : "No vino"}
        </button>
        <button onClick={() => { setCobrando(true); setNoVinoArmado(false); }} className={`${btnClaro} py-5`}>
          Terminado ✓
        </button>
      </div>
    </div>
  );
}
