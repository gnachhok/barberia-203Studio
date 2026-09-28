// Utilidades de la agenda del barbero

// "13:30:00" o "13:30" → 810 (minutos desde las 00:00): así comparar y restar horas es simple
export const aMin = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
export const aHora = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const ahoraEnMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

// Nombre a mostrar: cliente con cuenta ("Juan P.") o cargado a mano (cliente_nombre)
export function nombreCliente(t) {
  if (t.cliente) return `${t.cliente.nombre} ${t.cliente.apellido?.[0] || ""}.`.trim();
  return t.cliente_nombre || "Sin nombre";
}

// Huecos libres del día: los espacios de 15 min o más entre turnos, dentro del horario
export function calcularHuecos(turnos, abre, cierra) {
  const huecos = [];
  let cursor = aMin(abre);
  for (const t of turnos) {
    const ini = aMin(t.hora_inicio);
    if (ini - cursor >= 15) huecos.push({ ini: cursor, fin: ini });
    cursor = Math.max(cursor, aMin(t.hora_fin));
  }
  if (aMin(cierra) - cursor >= 15) huecos.push({ ini: cursor, fin: aMin(cierra) });
  return huecos;
}
