// Datos fijos del local. Si cambian, se cambian acá y se actualiza todo el sitio.

export const LOCAL = {
  nombre: "203 Studio",
  direccion: "Av. Ovidio Lagos 2670",
  ciudad: "Rosario",
  instagram: "https://www.instagram.com/203.sstudio/",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Ovidio+Lagos+2670,+Rosario",
  mapsEmbed: "https://maps.google.com/maps?q=Av.%20Ovidio%20Lagos%202670,%20Rosario&z=16&output=embed",
};

// Horario del local. Índice = día de la semana (0 = domingo). null = cerrado.
// Lo usa el cartel de "Abierto ahora". Los turnos reales salen de los horarios
// de cada barbero en el backend (HorarioBarbero).
export const HORARIO = [null, null, [10, 20], [10, 20], [10, 20], [10, 20], [10, 17]];

export const HORARIO_TEXTO = ["Martes a viernes · 10 a 20 h", "Sábados · 10 a 17 h"];

export const ESTILOS = ["Fade", "Barba", "Diseños", "Perfilado", "Corte + barba", "Low taper", "Buzz cut"];
