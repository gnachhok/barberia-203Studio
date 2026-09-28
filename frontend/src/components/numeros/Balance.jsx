import { useState } from "react";
import { api, mensajeDeError } from "../../api/client";
import { iso, precio } from "../../utils/fechas";
import Tarjeta from "./Tarjeta";

const CATEGORIAS = ["Alquiler", "Productos", "Servicios (luz, internet)", "Otros"];
const campo = "w-full border-b-2 border-ink/25 bg-transparent py-1.5 text-[15px] text-ink outline-none focus:border-ink";

// Lo que entró menos lo que salió en el mes. Solo admin (borde punteado).
export default function Balance({ ingresos, gastos, mes, onCambio }) {
  const [cargando, setCargando] = useState(false);
  const totalGastos = gastos.reduce((s, g) => s + g.total, 0);
  const queda = ingresos - totalGastos;

  return (
    <Tarjeta titulo="Balance del local" sub="Lo que entró menos lo que salió" punteada>
      <ul>
        <Fila nombre="Ingresos" valor={precio(ingresos)} />
        {gastos.map((g) => <Fila key={g.categoria} nombre={`Gastos · ${g.categoria}`} valor={`− ${precio(g.total)}`} />)}
        {gastos.length === 0 && <Fila nombre="Gastos" valor="Sin cargar" apagado />}
        <li className="flex items-center justify-between border-t-2 border-ink pt-2.5">
          <b className="font-semibold">Queda</b>
          <span className="display text-[28px]">{queda < 0 ? `− ${precio(-queda)}` : precio(queda)}</span>
        </li>
      </ul>

      {cargando ? (
        // key: cada vez que se abre, el formulario arranca vacío
        <FormGasto key={mes} mes={mes} onGuardado={() => { setCargando(false); onCambio(); }} onCerrar={() => setCargando(false)} />
      ) : (
        <button onClick={() => setCargando(true)} className="label mt-3 border-b text-[11px]!">+ Cargar gasto</button>
      )}
    </Tarjeta>
  );
}

function Fila({ nombre, valor, apagado }) {
  return (
    <li className="flex justify-between gap-3 border-t border-ink/10 py-2.5 first:border-t-0">
      <span className={apagado ? "text-ink-mute" : ""}>{nombre}</span>
      <span className={`label text-[11px]! ${apagado ? "text-ink-mute" : ""}`}>{valor}</span>
    </li>
  );
}

function FormGasto({ mes, onGuardado, onCerrar }) {
  const hoy = iso(new Date());
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  // Si estás mirando un mes pasado, el gasto se propone el primer día de ese mes
  const [fecha, setFecha] = useState(hoy.startsWith(mes) ? hoy : `${mes}-01`);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar(e) {
    e.preventDefault();
    if (!descripcion.trim()) { setError("Poné qué fue (ej: alquiler de octubre)"); return; }
    if (!(Number(monto) > 0)) { setError("Poné un monto mayor a 0"); return; }
    setGuardando(true);
    setError("");
    try {
      await api.post("/gastos", { descripcion: descripcion.trim(), monto: Number(monto), categoria, fecha });
      onGuardado();
    } catch (err) {
      setError(mensajeDeError(err));
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} noValidate className="entra mt-4 border-t-2 border-ink pt-4">
      <label htmlFor="g-desc" className="label text-[11px]! text-ink-mute">Qué fue</label>
      <input id="g-desc" autoFocus value={descripcion} placeholder="Ej: Alquiler de octubre"
        onChange={(e) => { setDescripcion(e.target.value); setError(""); }} className={`${campo} mb-4`} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="g-monto" className="label text-[11px]! text-ink-mute">Monto</label>
          <input id="g-monto" type="number" inputMode="numeric" min="0" value={monto} placeholder="0"
            onChange={(e) => { setMonto(e.target.value); setError(""); }} className={campo} />
        </div>
        <div>
          <label htmlFor="g-fecha" className="label text-[11px]! text-ink-mute">Fecha</label>
          <input id="g-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={campo} />
        </div>
      </div>

      <label htmlFor="g-cat" className="label mt-4 block text-[11px]! text-ink-mute">Categoría</label>
      <select id="g-cat" value={categoria} onChange={(e) => setCategoria(e.target.value)} className={campo}>
        {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
      </select>

      {error && <p role="alert" className="mt-3 text-[14px] text-error">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button disabled={guardando} className="label flex-1 border-2 border-ink bg-ink py-3 text-paper disabled:opacity-60">
          {guardando ? "Guardando…" : "Guardar gasto"}
        </button>
        <button type="button" onClick={onCerrar} className="label border-2 border-ink px-4">Cancelar</button>
      </div>
    </form>
  );
}
