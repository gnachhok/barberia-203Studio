import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { api, mensajeDeError } from "../../api/client";
import { aMin } from "./panelUtils";

const campo = "w-full border-b-2 border-ink/25 bg-transparent py-1.5 text-[15px] text-ink outline-none focus:border-ink";

// Cargar un turno a mano (el que llama o entra sin reservar).
// Las horas que ofrece dependen del servicio: un corte + barba de 45 min no entra
// en un hueco de 30. Eso lo calcula el backend (GET /barberos/:id/dia).
export default function FormTurnoManual({ barberoId, fecha, servicios, horaSugerida, onGuardado, onCerrar }) {
  const [nombre, setNombre] = useState("");
  const [servicioId, setServicioId] = useState(servicios[0]?.id ?? "");
  const [horaElegida, setHoraElegida] = useState(null); // null = usar la sugerida
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const dia = useApi(servicioId ? `/barberos/${barberoId}/dia?fecha=${fecha}&servicio_id=${servicioId}` : null);
  const huecos = dia.data?.huecos || [];
  // Hora que se muestra: la que eligió, o el primer hueco desde el que tocó en la agenda
  const hora = (horaElegida && huecos.includes(horaElegida))
    ? horaElegida
    : huecos.find((h) => !horaSugerida || aMin(h) >= aMin(horaSugerida)) || huecos[0] || "";

  async function guardar(e) {
    e.preventDefault();
    if (!nombre.trim()) { setError("Poné el nombre del cliente"); return; }
    if (!hora) { setError("No hay horarios libres para ese servicio"); return; }
    setGuardando(true);
    setError("");
    try {
      await api.post("/turnos", { cliente_nombre: nombre.trim(), barbero_id: barberoId, servicio_id: servicioId, fecha, hora_inicio: hora });
      onGuardado();
    } catch (err) {
      // 409: alguien lo reservó online justo antes → recargamos las horas libres
      setError(err.response?.status === 409 ? "Ese horario se ocupó recién. Elegí otro." : mensajeDeError(err));
      if (err.response?.status === 409) dia.recargar();
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} noValidate className="entra border-t-2 border-ink bg-[#e9e7e1] px-4 py-5">
      <p className="display mb-3 text-[26px]">Cargar turno</p>

      <label htmlFor="m-nombre" className="label text-ink-mute">Nombre del cliente</label>
      <input id="m-nombre" autoFocus value={nombre} placeholder="Ej: Juan"
        onChange={(e) => { setNombre(e.target.value); setError(""); }} className={`${campo} mb-4`} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="m-servicio" className="label text-ink-mute">Servicio</label>
          <select id="m-servicio" value={servicioId} onChange={(e) => { setServicioId(Number(e.target.value)); setHoraElegida(null); }} className={campo}>
            {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre} ({s.duracion_minutos}′)</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="m-hora" className="label text-ink-mute">Hora</label>
          <select id="m-hora" value={hora} onChange={(e) => setHoraElegida(e.target.value)} disabled={dia.cargando || !huecos.length} className={campo}>
            {dia.cargando && <option>Cargando…</option>}
            {!dia.cargando && !huecos.length && <option value="">Sin lugar</option>}
            {huecos.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>

      {error && <p role="alert" className="mt-3 text-[13px] text-error">{error}</p>}
      <div className="mt-4 grid grid-cols-[1fr_2fr] gap-2">
        <button type="button" onClick={onCerrar} className="label border-2 border-ink px-3 py-3.5">Cancelar</button>
        <button type="submit" disabled={guardando} className="label border-2 border-ink bg-ink px-3 py-3.5 text-paper">
          {guardando ? "Guardando…" : "Guardar turno"}
        </button>
      </div>
    </form>
  );
}
