import { HORARIO } from "../../data/local";
import { MESES_LARGO } from "../../utils/fechas";

// "2026-09" del mes de una fecha
export const mesIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

// "2026-09" + 1 → "2026-10"
export function sumarMeses(mes, n) {
  const [y, m] = mes.split("-").map(Number);
  return mesIso(new Date(y, m - 1 + n, 1));
}

export function nombreMes(mes) {
  const [y, m] = mes.split("-").map(Number);
  return `${MESES_LARGO[m - 1]} ${y}`;
}

// Los días del mes en los que abre el local: [{ fecha: "2026-09-01", dia: 1, dow: 2 }, ...]
export function diasAbiertos(mes) {
  const [y, m] = mes.split("-").map(Number);
  const cantidad = new Date(y, m, 0).getDate();
  const dias = [];
  for (let dia = 1; dia <= cantidad; dia++) {
    const dow = new Date(y, m - 1, dia).getDay();
    if (HORARIO[dow]) dias.push({ fecha: `${mes}-${String(dia).padStart(2, "0")}`, dia, dow });
  }
  return dias;
}

// Números sacados del resumen que manda el backend
export function kpis({ estados, ingresos }) {
  const hechos = estados.completado;
  const debianVenir = estados.completado + estados.ausente;
  return {
    ingresos,
    hechos,
    ticket: hechos ? ingresos / hechos : 0,
    // De los que tenían que venir, cuántos no vinieron (los cancelados avisaron: no cuentan)
    ausentismo: debianVenir ? (estados.ausente / debianVenir) * 100 : 0,
  };
}

// Texturas por nombre: `grande` para cuadrados/leyendas, `chica` para la torta
export const TEXTURAS = {
  liso: { grande: "var(--color-ink)", chica: "var(--color-ink)" },
  raya: { grande: "url(#raya)", chica: "url(#raya-s)" },
  punto: { grande: "url(#punto)", chica: "url(#punto-s)" },
  vacio: { grande: "var(--color-paper)", chica: "var(--color-paper)" },
};

// Lo mismo pero para divs (barras de HTML): rayado con CSS
export const FONDO_CSS = {
  liso: "bg-ink",
  raya: "bg-[repeating-linear-gradient(135deg,transparent_0_4px,var(--color-ink)_4px_5.5px)]",
  punto: "bg-[radial-gradient(var(--color-ink)_1.3px,transparent_1.6px)] bg-size-[6px_6px]",
  vacio: "bg-paper",
};
