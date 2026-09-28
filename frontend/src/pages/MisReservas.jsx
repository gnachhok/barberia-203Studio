import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useApi } from "../hooks/useApi";
import { api, mensajeDeError } from "../api/client";
import { DIAS_LARGO, MESES, desdeIso, precio } from "../utils/fechas";

// Momento en que empieza un turno, para saber si ya pasó
const inicio = (t) => new Date(`${t.fecha}T${t.hora_inicio}`);

// Política del local (la misma regla está en el backend, que es el que decide de verdad)
const HORAS_MINIMAS_CANCELACION = 8;
const sePuedeCancelar = (t) => (inicio(t) - new Date()) / 36e5 >= HORAS_MINIMAS_CANCELACION;
const hhmm = (h) => h.slice(0, 5); // "15:00:00" → "15:00"

// Cómo se muestra cada estado en el historial (en palabras simples, nada técnico)
function textoEstado(t) {
  if (t.estado === "completado") return "Hecho ✓";
  if (t.estado === "cancelado") return "Cancelado";
  if (t.estado === "ausente") return "No asististe";
  return "Pasado";
}

function fechaCorta(fecha) {
  const d = desdeIso(fecha);
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export default function MisReservas() {
  const turnos = useApi("/turnos"); // el backend ya devuelve solo los del cliente logueado
  const ahora = new Date();

  // Próximas: confirmadas que todavía no empezaron (la más cercana primero).
  // Historial: todo lo demás (lo más reciente primero).
  const lista = turnos.data || [];
  const proximas = lista
    .filter((t) => t.estado === "confirmado" && inicio(t) > ahora)
    .sort((a, b) => inicio(a) - inicio(b));
  const historial = lista
    .filter((t) => !proximas.includes(t))
    .sort((a, b) => inicio(b) - inicio(a));

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-paper text-ink">
          <div className="wrap pb-12 pt-10">
            <Link to="/" className="label relative z-10 inline-block py-1.5 text-ink-mute hover:text-ink">← Inicio</Link>
            <h1 className="display mt-2.5 text-[clamp(56px,8vw,120px)]">Mis reservas<span className="punto-oscuro">.</span></h1>
          </div>
        </section>

        <div className="wrap py-14">
          {turnos.cargando && <p className="label text-mute">Cargando tus turnos…</p>}
          {turnos.error && (
            <p role="alert" className="flex flex-wrap items-center gap-4 border border-line px-4 py-3 text-mute">
              {turnos.error}
              <button onClick={turnos.recargar} className="label border-b text-paper">Reintentar</button>
            </p>
          )}

          {turnos.data && (
            <>
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="label text-mute">Próximos turnos</h2>
                {proximas.length > 0 && (
                  <p className="text-[13px] text-mute">Podés cancelar hasta {HORAS_MINIMAS_CANCELACION} horas antes.</p>
                )}
              </div>
              {proximas.length === 0 ? (
                // Estado vacío: una invitación con UNA acción clara, no un "no hay nada"
                <div className="flex flex-wrap items-center justify-between gap-6 border border-dashed border-line p-8">
                  <p className="display text-4xl">No tenés turnos reservados</p>
                  <Link to="/reservar" className="btn btn-solid">Reservar ahora →</Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {proximas.map((t) => <TicketTurno key={t.id} turno={t} onCancelado={turnos.recargar} />)}
                </div>
              )}

              {historial.length > 0 && (
                <section className="mt-20">
                  <h2 className="label mb-5 text-mute">Historial</h2>
                  <ul className="border-t border-line">
                    {historial.map((t) => (
                      <li key={t.id} className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-line py-4 text-mute md:grid-cols-[180px_1fr_1fr_auto]">
                        <span className="label">{fechaCorta(t.fecha)} · {hhmm(t.hora_inicio)}</span>
                        <span className="label row-start-1 text-right md:order-last md:row-auto">{textoEstado(t)}</span>
                        <span className="text-paper">{t.Servicio?.nombre}</span>
                        <span className="hidden md:inline">con {t.barbero?.nombre}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// Un turno próximo como ticket de papel, con cancelar en dos toques
function TicketTurno({ turno, onCancelado }) {
  const [confirmando, setConfirmando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [error, setError] = useState("");
  const d = desdeIso(turno.fecha);

  async function cancelar() {
    // Primer toque: pide confirmación. Así un toque sin querer no cancela nada.
    if (!confirmando) { setConfirmando(true); return; }
    setCancelando(true);
    setError("");
    try {
      await api.patch(`/turnos/${turno.id}/cancelar`);
      onCancelado(); // recarga la lista: el turno pasa al historial como "Cancelado"
    } catch (err) {
      setError(mensajeDeError(err));
      setCancelando(false);
      setConfirmando(false);
    }
  }

  return (
    <article className="ficha" style={{ "--troquel": "74px" }}>
      <div className="label flex justify-between px-[22px] pt-4 text-ink-mute">
        <span>203 Studio</span>
        <span>Turno Nº {String(turno.id).padStart(4, "0")}</span>
      </div>
      {/* Lo que la persona viene a buscar: CUÁNDO tiene que ir. Grande y arriba. */}
      <p className="display px-[22px] pt-3 text-[44px] leading-[.9]">
        {DIAS_LARGO[d.getDay()]} {d.getDate()}
        <span className="block text-[28px] text-ink-mute">{MESES[d.getMonth()]} · {hhmm(turno.hora_inicio)} h</span>
      </p>
      <dl className="label px-[22px] pb-4 pt-4">
        <div className="flex justify-between border-b border-ink/10 py-2.5"><dt className="text-ink-mute">Servicio</dt><dd>{turno.Servicio?.nombre}</dd></div>
        <div className="flex justify-between py-2.5"><dt className="text-ink-mute">Barbero</dt><dd>{turno.barbero?.nombre}</dd></div>
      </dl>

      <div className="troquel" />
      <div className="px-[22px] pb-5 pt-1">
        {error && <p role="alert" className="mb-2 text-[13px] text-error">{error}</p>}
        <div className="flex items-center justify-between gap-4">
          <span className="display text-[28px]">{turno.Servicio ? precio(turno.Servicio.precio) : ""}</span>
          {/* Con menos de 8 hs no mostramos un botón que va a fallar: explicamos por qué */}
          {!sePuedeCancelar(turno) ? (
            <span className="label max-w-[150px] text-right text-[10px]! text-ink-mute">
              Falta poco: para cancelar escribinos por Instagram
            </span>
          ) : (
          <button
            onClick={cancelar}
            // si toca en otro lado entre los dos toques, el botón se "desarma"
            onBlur={() => { if (!cancelando) setConfirmando(false); }}
            disabled={cancelando}
            className={`label border-2 border-ink px-3 py-2.5 transition ${confirmando ? "bg-ink text-paper" : "hover:bg-ink hover:text-paper"}`}
          >
            {cancelando ? "Cancelando…" : confirmando ? "¿Seguro? Tocá de nuevo" : "Cancelar turno"}
          </button>
          )}
        </div>
      </div>
    </article>
  );
}
