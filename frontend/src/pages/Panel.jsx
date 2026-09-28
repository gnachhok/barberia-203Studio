import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { esAdmin, tieneRol } from "../utils/roles";
import { DIAS_LARGO, iso, desdeIso, sumarDias, precio } from "../utils/fechas";
import ProximoTurno from "../components/panel/ProximoTurno";
import LineaDelDia from "../components/panel/LineaDelDia";
import FormTurnoManual from "../components/panel/FormTurnoManual";

// Agenda del día del barbero. Pensada para el celular, entre cliente y cliente:
// funcional antes que estética. Fondo claro = "la planilla del mostrador".
export default function Panel() {
  const { usuario, logout } = useAuth();
  const admin = esAdmin(usuario);

  const [fecha, setFecha] = useState(() => iso(new Date()));
  // El admin puede mirar la agenda de cualquier barbero; el barbero, solo la suya
  const barberos = useApi(admin ? "/barberos" : null);
  const [barberoElegido, setBarberoElegido] = useState(null);
  // Si además es barbero (los dueños tienen los dos roles), arranca en SU agenda;
  // un admin que no corta (ej. el desarrollador) arranca en el primer barbero.
  const agendaInicial = tieneRol(usuario, "barbero") ? usuario.id : barberos.data?.[0]?.id ?? null;
  const barberoId = admin ? (barberoElegido ?? agendaInicial) : usuario.id;

  // null = formulario cerrado · "" = abierto sin hora sugerida · "14:00" = abierto desde un hueco
  const [formHora, setFormHora] = useState(null);

  // El backend ya filtra: un barbero recibe solo sus turnos; el admin pide los de uno con barbero_id
  const turnos = useApi(barberoId ? `/turnos?fecha=${fecha}${admin ? `&barbero_id=${barberoId}` : ""}` : null);
  const dia = useApi(barberoId ? `/barberos/${barberoId}/dia?fecha=${fecha}` : null);
  const servicios = useApi("/servicios");

  const hoy = iso(new Date());
  const esHoy = fecha === hoy;
  const moverDia = (delta) => {
    setFecha(sumarDias(fecha, delta));
    setFormHora(null);
  };

  // Los cancelados no ocupan lugar: no se muestran en la agenda
  const delDia = (turnos.data || []).filter((t) => t.estado !== "cancelado");
  const hechos = delDia.filter((t) => t.estado === "completado");
  const cobrado = hechos.reduce((suma, t) => suma + Number(t.precio_final || 0), 0);
  // Próximo = el primer turno todavía abierto (si uno quedó sin cerrar, aparece primero)
  const proximo = delDia.find((t) => t.estado === "confirmado");

  const recargar = () => { turnos.recargar(); dia.recargar(); };
  const d = desdeIso(fecha);
  const etiquetaDia = esHoy ? "Hoy" : fecha === sumarDias(hoy, 1) ? "Mañana" : fecha === sumarDias(hoy, -1) ? "Ayer" : "";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[560px] pb-10">
        {/* Encabezado simple: acá no hace falta el navbar del sitio */}
        <header className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
          <span className="display text-xl">203 · Panel</span>
          <div className="label flex gap-4 text-ink-mute">
            <Link to="/" className="hover:text-ink">Ver sitio</Link>
            <button onClick={logout} className="hover:text-ink">Salir</button>
          </div>
        </header>

        {admin && barberos.data && (
          <nav className="flex border-b border-ink/10" aria-label="Barbero">
            {barberos.data.map((b) => (
              <button key={b.id} onClick={() => { setBarberoElegido(b.id); setFormHora(null); }}
                aria-pressed={b.id === barberoId}
                className={`label flex-1 border-b-[3px] py-3.5 ${b.id === barberoId ? "border-ink" : "border-transparent text-ink-mute"}`}>
                {b.nombre}
              </button>
            ))}
          </nav>
        )}

        <div className="px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <button onClick={() => moverDia(-1)} aria-label="Día anterior" className="label border-2 border-ink px-3.5 py-2.5">←</button>
            <div className="text-center">
              <p className="label text-ink-mute">{etiquetaDia || " "}</p>
              <p className="display text-[32px]">{DIAS_LARGO[d.getDay()]} {d.getDate()}</p>
            </div>
            <button onClick={() => moverDia(1)} aria-label="Día siguiente" className="label border-2 border-ink px-3.5 py-2.5">→</button>
          </div>
          {!esHoy && <button onClick={() => setFecha(hoy)} className="label mx-auto mt-2 block border-b">Volver a hoy</button>}
          {turnos.data && (
            <p className="label mt-3 text-center text-ink-mute">
              {delDia.length} turnos · {hechos.length} hechos · {precio(cobrado)}
            </p>
          )}
        </div>

        {(turnos.cargando || dia.cargando) && <p className="label px-4 py-6 text-center text-ink-mute">Cargando agenda…</p>}
        {(turnos.error || dia.error) && (
          <p role="alert" className="mx-4 flex flex-wrap items-center gap-3 border border-ink/20 px-4 py-3 text-ink-mute">
            {turnos.error || dia.error}
            <button onClick={recargar} className="label border-b text-ink">Reintentar</button>
          </p>
        )}

        {turnos.data && dia.data && (
          <>
            <div className="mx-4 mb-4">
              {proximo ? (
                // key: al cambiar de turno, la tarjeta arranca de cero (sin el cobro a medio hacer del anterior)
                <ProximoTurno key={proximo.id} turno={proximo} esHoy={esHoy} onCambio={recargar} />
              ) : (
                <p className="display bg-ink p-5 text-[26px] text-paper">
                  {dia.data.cerrado ? "Día libre" : "No quedan turnos"}
                </p>
              )}
            </div>

            <LineaDelDia
              turnos={delDia}
              abre={dia.data.abre}
              cierra={dia.data.cierra}
              esHoy={esHoy}
              proximoId={proximo?.id}
              propia={barberoId === usuario.id}
              onElegirHueco={(h) => setFormHora(h)}
            />

            {formHora !== null && servicios.data && (
              <FormTurnoManual
                key={`${fecha}-${barberoId}-${formHora}`}
                barberoId={barberoId}
                fecha={fecha}
                servicios={servicios.data}
                horaSugerida={formHora}
                onGuardado={() => { setFormHora(null); recargar(); }}
                onCerrar={() => setFormHora(null)}
              />
            )}

            {formHora === null && !dia.data.cerrado && (
              <div className="border-t border-ink/10 px-4 pt-4">
                <button onClick={() => setFormHora("")} className="label w-full border-2 border-ink bg-ink py-4 text-paper">
                  + Cargar turno (sin reserva)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
