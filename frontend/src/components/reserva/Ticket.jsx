import Avatar from "../ui/Avatar";
import { DIAS, MESES, desdeIso, precio } from "../../utils/fechas";

// El ticket del costado: se va completando a medida que se elige cada paso.
export default function Ticket({ servicio, barbero, sinPreferencia, fecha, hora, numero }) {
  let dia = null;
  if (fecha) {
    const d = desdeIso(fecha);
    dia = `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
  }

  return (
    // --troquel: distancia desde abajo hasta la línea troquelada (talón de 84px)
    <div className="ficha" style={{ "--troquel": "84px" }}>
      <div className="label flex justify-between px-[22px] pt-4 text-ink-mute">
        <span>203 Studio</span>
        <span>Turno Nº {numero ? String(numero).padStart(4, "0") : "----"}</span>
      </div>
      <p className="display px-[22px] pb-1 pt-2.5 text-[34px]">Tu turno</p>

      <dl className="label px-[22px] pb-3.5 pt-1">
        <Fila nombre="Servicio" valor={servicio?.nombre} />
        <Fila
          nombre="Barbero"
          valor={barbero ? barbero.apodo : sinPreferencia ? "Sin preferencia" : null}
          extra={barbero && <Avatar chico foto={barbero.foto} iniciales={barbero.iniciales} />}
        />
        <Fila nombre="Día" valor={dia} />
        <Fila nombre="Hora" valor={hora} />
      </dl>

      <div className="troquel" />
      <div className="flex items-baseline justify-between px-[22px] pb-[22px] pt-3">
        <span className="label text-ink-mute">Total</span>
        <span className="display text-[34px]">{servicio ? precio(servicio.precio) : "$ —"}</span>
      </div>
    </div>
  );
}

function Fila({ nombre, valor, extra }) {
  return (
    <div className="t-fila">
      <dt>{nombre}</dt>
      <dd>{extra}<span className={valor ? "" : "vacio-t"}>{valor || "—"}</span></dd>
    </div>
  );
}
