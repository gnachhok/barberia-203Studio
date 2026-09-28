import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Marquee from "../components/ui/Marquee";
import Avatar from "../components/ui/Avatar";
import Calendario from "../components/reserva/Calendario";
import Ticket from "../components/reserva/Ticket";
import "../components/reserva/reserva.css";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { api, mensajeDeError } from "../api/client";
import { buscarPerfil } from "../data/barberos";
import { LOCAL, HORARIO_TEXTO } from "../data/local";
import { DIAS_LARGO, desdeIso, precio } from "../utils/fechas";

// Lo elegido se guarda en sessionStorage: si hay que loguearse en el medio,
// al volver está todo como estaba. (sessionStorage y no localStorage: se borra
// al cerrar la pestaña, así una reserva a medio hacer no aparece días después.)
const GUARDADO = "203-reserva";
// barberoSlug: barbero pedido por link (?barbero=nico) que todavía no sabemos qué id tiene
// en el backend (se resuelve cuando llega GET /barberos).
const INICIAL = { paso: 1, servicioId: null, barberoId: null, barberoSlug: null, fecha: null, hora: null, notas: "" };

function leerGuardado() {
  try { return { ...INICIAL, ...JSON.parse(sessionStorage.getItem(GUARDADO)) }; }
  catch { return INICIAL; }
}

// Estado inicial: lo guardado, salvo que el link pida un barbero puntual.
// En ese caso el link GANA: si venís de "Reservar con Nico", es Nico aunque en una
// reserva anterior hubieras elegido a otro (y fecha/hora de esa reserva ya no sirven).
function estadoInicial(slugDelLink) {
  const guardado = leerGuardado();
  if (!slugDelLink) return guardado;
  return { ...guardado, barberoId: null, barberoSlug: slugDelLink, fecha: null, hora: null };
}

const PASOS = ["Servicio", "Barbero", "Día y hora", "Confirmar"];

export default function Reservar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Un solo objeto de estado con todo lo elegido: la pantalla se dibuja a partir de él
  const [estado, setEstado] = useState(() => estadoInicial(params.get("barbero")));
  const [confirmado, setConfirmado] = useState(null); // turno creado
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  // Servicio "armado" con el primer toque (falta el segundo para confirmar).
  // Es estado de la pantalla, no de la reserva: no se guarda en sessionStorage.
  const [marcado, setMarcado] = useState(null);

  useEffect(() => {
    if (!confirmado) sessionStorage.setItem(GUARDADO, JSON.stringify(estado));
  }, [estado, confirmado]);

  // ---------- Datos del backend ----------
  const servicios = useApi("/servicios");
  const barberosApi = useApi("/barberos");

  // Barberos del backend + su perfil (apodo, foto) si lo tienen
  const barberos = useMemo(() => (barberosApi.data || []).map((b) => {
    const perfil = buscarPerfil(b);
    return {
      id: b.id,
      slug: perfil?.slug,
      apodo: perfil?.apodo || b.nombre,
      completo: `${b.nombre} ${b.apellido}`,
      iniciales: (b.nombre[0] + b.apellido[0]).toUpperCase(),
      foto: perfil?.foto || null,
    };
  }), [barberosApi.data]);

  // Barbero pedido por link: su id se deduce en cada render cuando ya llegaron los barberos
  // (derivarlo evita un useEffect que copie datos al estado).
  const idDelLink = barberos.find((b) => b.slug === estado.barberoSlug)?.id ?? null;
  const barberoId = estado.barberoId ?? idDelLink;
  const hayBarbero = barberoId !== null || estado.barberoSlug !== null; // elegido o en camino

  const servicio = servicios.data?.find((s) => s.id === estado.servicioId) || null;
  const barbero = barberos.find((b) => b.id === barberoId) || null;
  const sinPreferencia = barberoId === "sin";
  const filtroBarbero = barberoId && !sinPreferencia ? `&barbero_id=${barberoId}` : "";

  // El resumen del mes y los horarios del día dependen de lo elegido antes
  const mes = useApi(estado.servicioId && barberoId ? `/disponibilidad/mes?servicio_id=${estado.servicioId}${filtroBarbero}` : null);
  const dia = useApi(estado.servicioId && barberoId && estado.fecha
    ? `/disponibilidad/dia?servicio_id=${estado.servicioId}&fecha=${estado.fecha}${filtroBarbero}` : null);

  // Hasta qué paso se puede llegar con lo elegido
  const maxPaso = !estado.servicioId ? 1 : !barberoId ? 2 : !estado.hora ? 3 : 4;
  const paso = Math.min(estado.paso, maxPaso);

  // ---------- Acciones ----------
  const actualizar = (cambios) => { setError(""); setEstado((e) => ({ ...e, ...cambios })); };

  function elegirServicio(id) {
    // Otro servicio = otra duración = otros horarios → se vuelve a elegir día y hora
    const cambia = id !== estado.servicioId;
    // Si el barbero ya está elegido (o viene por link y está cargando) vamos directo a día y hora.
    // Aunque los barberos no hayan llegado, guardamos paso 3: `paso` se limita con maxPaso,
    // así que se muestra el 2 un instante y pasa solo al 3 cuando se resuelve el id.
    actualizar({ servicioId: id, ...(cambia && { fecha: null, hora: null }), paso: hayBarbero ? 3 : 2 });
  }

  function elegirBarbero(id) {
    // Con otro barbero el horario elegido puede no estar libre → se vuelve a elegir
    const cambia = id !== barberoId;
    actualizar({ barberoId: id, barberoSlug: null, ...(cambia && { fecha: null, hora: null }), paso: 3 });
  }

  function mostrarAviso(texto) {
    setAviso(texto);
    setTimeout(() => setAviso(""), 2500);
  }

  async function confirmar() {
    if (!usuario) {
      navigate("/login?next=reservar"); // lo elegido ya está guardado en sessionStorage
      return;
    }
    setEnviando(true);
    setError("");
    try {
      const { data } = await api.post("/turnos", {
        servicio_id: estado.servicioId,
        fecha: estado.fecha,
        hora_inicio: estado.hora,
        notas: estado.notas.trim() || undefined,
        // Sin preferencia no mandamos barbero: lo asigna el backend entre los libres
        ...(sinPreferencia ? {} : { barbero_id: barberoId }),
      });
      sessionStorage.removeItem(GUARDADO);
      setConfirmado(data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        logout(); // el token venció
        navigate("/login?next=reservar");
      } else if (status === 409) {
        // Alguien lo reservó entre que lo viste y confirmaste
        setError("Ese horario se ocupó recién. Elegí otro.");
        setEstado((e) => ({ ...e, hora: null, paso: 3 }));
        dia.recargar();
        mes.recargar();
      } else {
        setError(mensajeDeError(err));
      }
    } finally {
      setEnviando(false);
    }
  }

  // Cinta con precios reales (del backend) + horarios y dirección
  const cinta = [
    ...(servicios.data || []).map((s) => `${s.nombre} ${precio(s.precio)}`),
    ...HORARIO_TEXTO.map((h) => h.replace(" · ", " ")),
    LOCAL.direccion,
  ];

  const barberoAsignado = confirmado && barberos.find((b) => b.id === confirmado.barbero_id);

  return (
    <>
      <Navbar mostrarReservar={false} />

      {/* Banda clara: título + pasos. Corta el negro y le da aire a la pantalla */}
      <section className="bg-paper text-ink">
        <div className="wrap pt-9">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Link to="/" className="label relative z-10 inline-block py-1.5 text-ink-mute hover:text-ink">← Inicio</Link>
              <h1 className="display mt-2.5 text-[clamp(64px,9vw,136px)]">Reservá<span className="punto-oscuro">.</span></h1>
            </div>
            <p className="label pb-3.5 text-ink-mute">4 pasos · menos de 1 minuto</p>
          </div>
          {!confirmado && (
            <nav className="mt-8 flex gap-2.5" aria-label="Pasos de la reserva">
              {PASOS.map((nombre, i) => {
                const n = i + 1;
                return (
                  <button
                    key={nombre}
                    onClick={() => actualizar({ paso: n })}
                    disabled={n > maxPaso}
                    aria-current={n === paso ? "step" : undefined}
                    className={`paso-tab ${n === paso ? "activo" : n < maxPaso || n < paso ? "hecho" : ""}`}
                  >
                    <span className="num">0{n}</span>
                    <span className="label hidden md:inline">{nombre}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </section>

      <Marquee items={cinta} tamano="text-[22px]" duracion="30s" className="border-b border-line py-3!" />

      <main className="wrap zona-reserva grid items-start gap-14 pb-24 pt-14 lg:grid-cols-[1fr_360px]">
        <div className="relative z-10">
          {error && <p role="alert" className="mb-6 border-2 border-paper px-4 py-3">{error}</p>}

          {confirmado ? (
            <Listo fecha={estado.fecha} barbero={barberoAsignado} />
          ) : paso === 1 ? (
            <section className="entra">
              <h2 className="display mb-6 text-[40px]">¿Qué te hacés?</h2>
              <Estado consulta={servicios} />
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                {servicios.data?.map((s, i) => {
                  const esMarcado = marcado === s.id;
                  const esElegido = estado.servicioId === s.id && !marcado;
                  return (
                    <button
                      key={s.id}
                      // 1er toque: marca · 2do toque sobre la misma: confirma y avanza.
                      // Si ya era el elegido (volviste al paso 1), avanza directo.
                      onClick={() => {
                        if (esMarcado || esElegido) { setMarcado(null); elegirServicio(s.id); }
                        else setMarcado(s.id);
                      }}
                      aria-pressed={esMarcado || esElegido}
                      className={`op ${esElegido ? "sel" : ""} ${esMarcado ? "marcado" : ""}`}
                    >
                      <span className="op-idx" aria-hidden="true">0{i + 1}</span>
                      <span className="label suave">{s.duracion_minutos} min</span>
                      <span className="display text-[30px]">{s.nombre}</span>
                      {s.descripcion && <span className="suave text-sm">{s.descripcion}</span>}
                      <span className="display mt-auto text-[26px]">{precio(s.precio)}</span>
                      {esMarcado && (
                        <span className="op-confirmar" aria-live="polite">
                          <span className="display text-[28px]">✓</span>
                          <span className="label">Tocá de nuevo para confirmar</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="label mb-3.5 mt-10 text-mute">Color</p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                {/* La sección de colorimetría se diseña después: por ahora queda la tarjeta */}
                <button onClick={() => mostrarAviso("La sección de colorimetría está en camino")} className="op border-dashed!">
                  <span className="label suave">Tintura · global · mechas · diseños</span>
                  <span className="display text-[30px]">Colorimetría</span>
                  <span className="label mt-auto">Ver estilos y precios →</span>
                </button>
              </div>
            </section>
          ) : paso === 2 ? (
            <section className="entra">
              <h2 className="display mb-6 text-[40px]">¿Con quién?</h2>
              <Estado consulta={barberosApi} />
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                {barberos.map((b) => (
                  <button key={b.id} onClick={() => elegirBarbero(b.id)} className={`op ${barberoId === b.id ? "sel" : ""}`}>
                    <Avatar foto={b.foto} iniciales={b.iniciales} />
                    <span className="display mt-1.5 text-[34px]">{b.apodo}</span>
                    <span className="suave mt-auto text-sm">{b.completo}</span>
                  </button>
                ))}
                {barberos.length > 1 && (
                  <button onClick={() => elegirBarbero("sin")} className={`op border-dashed! ${sinPreferencia ? "sel" : ""}`}>
                    <span className="avatar border-dashed! text-[22px]">?</span>
                    <span className="display mt-1.5 text-[34px]">Me da igual</span>
                    <span className="suave mt-auto text-sm">El primero que esté libre</span>
                  </button>
                )}
              </div>
            </section>
          ) : paso === 3 ? (
            <section className="entra">
              <h2 className="display mb-2 text-[40px]">¿Cuándo?</h2>
              <div className="label my-4 mb-7 flex gap-5 text-mute">
                <span className="inline-flex items-center gap-2"><i className="inline-block h-3.5 w-3.5 bg-paper" />Libre</span>
                <span className="inline-flex items-center gap-2"><i className="inline-block h-3.5 w-3.5 border border-line bg-ink" />Completo</span>
                <span className="inline-flex items-center gap-2"><i className="inline-block h-3.5 w-3.5 border border-dashed border-[#3a3a3a]" />Cerrado</span>
              </div>
              <Estado consulta={mes} />
              {mes.data && (
                <Calendario
                  key={`${estado.servicioId}-${barberoId}`}
                  dias={mes.data.dias}
                  desde={mes.data.desde}
                  hasta={mes.data.hasta}
                  fecha={estado.fecha}
                  onElegir={(f) => actualizar({ fecha: f, hora: null })}
                />
              )}

              {estado.fecha && (
                <div className="mt-10">
                  <p className="label mb-3.5 text-mute">
                    Horarios · {DIAS_LARGO[desdeIso(estado.fecha).getDay()]} {desdeIso(estado.fecha).getDate()}
                  </p>
                  <Estado consulta={dia} />
                  {dia.data && (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(86px,1fr))] gap-1.5">
                      {dia.data.slots.map((s) => s.libre ? (
                        <button
                          key={s.hora}
                          onClick={() => actualizar({ hora: s.hora, paso: 4 })}
                          className={`hora libre ${estado.hora === s.hora ? "sel-ring" : ""}`}
                        >
                          {s.hora}
                        </button>
                      ) : (
                        <div key={s.hora} className="hora ocupada" aria-label={`${s.hora}, ocupado`}>{s.hora}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          ) : (
            <section className="entra">
              <h2 className="display mb-3 text-[40px]">Último paso</h2>
              <p className="mb-7 text-mute">Revisá tu ticket. Si querés, dejale una nota al barbero.</p>
              <label htmlFor="notas" className="label mb-2 block text-mute">Nota (opcional)</label>
              <textarea
                id="notas"
                value={estado.notas}
                onChange={(e) => actualizar({ notas: e.target.value })}
                placeholder="Quiero un low fade, llevo foto de referencia"
                maxLength={300}
                className="min-h-24 w-full resize-y border border-line bg-transparent p-3.5 text-base outline-none focus:border-paper"
              />
              <button onClick={confirmar} disabled={enviando} className="btn btn-solid mt-6 w-full justify-between!">
                <span>{enviando ? "Confirmando…" : usuario ? "Confirmar turno" : "Ingresar y confirmar"}</span>
                <span aria-hidden="true">→</span>
              </button>
              {!usuario && <p className="mt-3 text-center text-[13px] text-mute">Te pedimos ingresar y volvés acá con todo cargado.</p>}
            </section>
          )}
        </div>

        <aside className="relative z-10 lg:sticky lg:top-[104px]">
          <Ticket
            servicio={servicio}
            barbero={confirmado ? barberoAsignado || barbero : barbero}
            sinPreferencia={sinPreferencia}
            fecha={estado.fecha}
            hora={estado.hora}
            numero={confirmado?.id}
          />
          {/* Aviso sutil de login: informa, no bloquea */}
          {!usuario && !confirmado && (
            <p className="mt-4 flex items-start gap-2.5 text-[13px] leading-normal text-mute">
              <span className="mt-1 text-[10px]">○</span>
              <span>Para confirmar vas a tener que <Link to="/login?next=reservar" className="border-b border-line text-paper">ingresar</Link>. Lo que elijas se guarda.</span>
            </p>
          )}
        </aside>
      </main>

      {aviso && (
        <div role="status" className="label fixed bottom-6 left-1/2 z-50 -translate-x-1/2 bg-paper px-[18px] py-3 text-ink">{aviso}</div>
      )}
    </>
  );
}

// Muestra "Cargando…" o el error (con reintentar) de una consulta de useApi
function Estado({ consulta }) {
  if (consulta.cargando) return <p className="label mb-4 text-mute">Cargando…</p>;
  if (consulta.error) {
    return (
      <p role="alert" className="mb-4 flex flex-wrap items-center gap-4 border border-line px-4 py-3 text-mute">
        {consulta.error}
        <button onClick={consulta.recargar} className="label border-b text-paper">Reintentar</button>
      </p>
    );
  }
  return null;
}

function Listo({ fecha, barbero }) {
  const d = desdeIso(fecha);
  return (
    <section className="entra">
      <p className="label text-mute">● Turno confirmado</p>
      <h2 className="display mb-5 mt-3.5 text-[clamp(56px,7vw,96px)]">
        Nos vemos<br />el {DIAS_LARGO[d.getDay()]} {d.getDate()}<span className="punto-claro">.</span>
      </h2>
      <p className="max-w-[460px] leading-relaxed text-mute">
        {barbero ? `Te atiende ${barbero.apodo}. ` : ""}Guardamos tu turno. Si no podés venir, avisá con tiempo así otro lo puede aprovechar.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="btn btn-solid">Volver al inicio →</Link>
      </div>
    </section>
  );
}
