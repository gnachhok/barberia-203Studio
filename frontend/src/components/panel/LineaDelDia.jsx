import { aHora, aMin, ahoraEnMin, calcularHuecos, nombreCliente } from "./panelUtils";

const ETIQUETA = { completado: "Hecho ✓", ausente: "No vino" };

// La línea de tiempo del día: turnos + huecos libres, ordenados por hora.
// Los huecos se pueden tocar para anotar a alguien que llegó sin turno.
export default function LineaDelDia({ turnos, abre, cierra, esHoy, proximoId, onElegirHueco }) {
  const huecos = abre ? calcularHuecos(turnos, abre, cierra) : [];
  const items = [
    ...turnos.map((t) => ({ tipo: "turno", ini: aMin(t.hora_inicio), t })),
    ...huecos.map((h) => ({ tipo: "hueco", ini: h.ini, h })),
  ].sort((a, b) => a.ini - b.ini);

  // La línea de "ahora" (solo hoy) va antes del primer ítem que empieza después de ahora.
  // Se calcula ANTES de renderizar: el render tiene que ser puro (no modificar variables en el map).
  const ahora = ahoraEnMin();
  const indiceAhora = esHoy ? items.findIndex((it) => it.ini > ahora) : -1;
  const lineaAlFinal = esHoy && indiceAhora === -1 && items.length > 0; // ya pasó todo el día

  if (items.length === 0) {
    return <p className="border-t border-ink/10 px-4 py-8 text-center text-ink-mute">No trabajás este día.</p>;
  }

  return (
    <ol>
      {items.map((it, i) => {
        return (
          <li key={it.tipo + it.ini + (it.t?.id || "")}>
            {i === indiceAhora && <LineaAhora minutos={ahora} />}
            {it.tipo === "hueco" ? (
              <Fila hora={aHora(it.h.ini)}>
                <button
                  onClick={() => onElegirHueco(aHora(it.h.ini))}
                  className="my-1.5 flex w-full items-center justify-between border-[1.5px] border-dashed border-ink/30 bg-[repeating-linear-gradient(135deg,transparent_0_8px,rgb(10_10_10/.03)_8px_16px)] px-3 py-2.5 transition hover:border-ink"
                >
                  <span className="label text-ink-mute">Libre {aHora(it.h.ini)}–{aHora(it.h.fin)}</span>
                  <span className="label">+ Atender acá</span>
                </button>
              </Fila>
            ) : (
              <FilaTurno t={it.t} esProximo={it.t.id === proximoId} />
            )}
          </li>
        );
      })}
      {lineaAlFinal && <li><LineaAhora minutos={ahora} /></li>}
    </ol>
  );
}

function Fila({ hora, apagada, children }) {
  return (
    <div className={`grid min-h-[52px] grid-cols-[68px_1fr] border-t border-ink/10 ${apagada ? "text-[#a3a19b]" : ""}`}>
      <span className="label pl-3.5 pt-4 text-ink-mute">{hora}</span>
      <div className="flex items-center pr-4">{children}</div>
    </div>
  );
}

function FilaTurno({ t, esProximo }) {
  const cerrado = t.estado !== "confirmado"; // hecho o no vino: se apaga y queda tachado
  const etiqueta = ETIQUETA[t.estado] || (esProximo ? "Próximo" : null);
  return (
    <Fila hora={t.hora_inicio.slice(0, 5)} apagada={cerrado}>
      <div className="flex w-full items-center justify-between gap-3 py-2.5">
        <div>
          <p className={`font-medium ${cerrado ? "line-through" : ""}`}>
            {nombreCliente(t)}
            {!t.cliente_id && <span className="label ml-1.5 text-[9px]! text-ink-mute">· a mano</span>}
          </p>
          <p className="text-[13px] text-ink-mute">
            {t.Servicio?.nombre} · hasta {t.hora_fin.slice(0, 5)}
          </p>
        </div>
        {etiqueta && <span className="label shrink-0 border border-current px-1.5 py-1 text-[10px]!">{etiqueta}</span>}
      </div>
    </Fila>
  );
}

function LineaAhora({ minutos }) {
  return (
    <div className="relative ml-[68px] border-t-2 border-ink" aria-label={`Ahora, ${aHora(minutos)}`}>
      <span className="label absolute -left-[68px] -top-2.5 bg-ink px-1.5 py-0.5 text-[10px]! text-paper">{aHora(minutos)}</span>
    </div>
  );
}
