import { HORARIO } from "../data/local";

export const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const DIAS_LARGO = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
export const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const MESES_LARGO = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// "YYYY-MM-DD" en hora local (no usar toISOString: devuelve UTC)
export function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const desdeIso = (f) => new Date(`${f}T00:00:00`);

export const precio = (n) => "$" + Number(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });

// Estado del local según la hora actual:
// { abierto: true, cierra: 20 } o { abierto: false, cuando: "mañana", abre: 10 }
export function estadoLocal(ahora = new Date()) {
  const d = ahora.getDay();
  const h = ahora.getHours() + ahora.getMinutes() / 60;
  const hoy = HORARIO[d];
  if (hoy && h >= hoy[0] && h < hoy[1]) return { abierto: true, cierra: hoy[1] };

  // Próxima apertura: hoy (si todavía no abrió) o el próximo día que abra
  let n = hoy && h < hoy[0] ? 0 : 1;
  while (!HORARIO[(d + n) % 7]) n++;
  const cuando = n === 0 ? "hoy" : n === 1 ? "mañana" : `el ${DIAS_LARGO[(d + n) % 7]}`;
  return { abierto: false, cuando, abre: HORARIO[(d + n) % 7][0] };
}
