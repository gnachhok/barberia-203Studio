// Perfil público de cada barbero (lo que se muestra en su página).
// Los datos "de sistema" (id, horarios, turnos) vienen del backend; esto es la
// presentación. Se cruzan por nombre + apellido (ver buscarPerfil).

export const BARBEROS = [
  {
    slug: "nico",
    nombre: "Nicolás",
    apellido: "Aguirre",
    apodo: "Nico",
    edad: 21,
    instagram: "nicoo_aguiirre",
    foto: null, // ej: "/barberos/nico.jpg" cuando esté la foto
    frase: "Frase de presentación genérica: cómo arrancó con la máquina, qué le gusta hacer y por qué te vas a ir conforme.",
    datos: [
      ["Edad", "21 años"],
      ["En 203 desde", "2026"],
      ["Especialidad", "A completar"],
      ["No puede faltar", "A completar"],
    ],
    preguntas: [
      ["¿El corte que más te gusta hacer?", "A completar con Nico"],
      ["¿Qué suena en el local?", "A completar con Nico"],
      ["¿Club?", "A completar con Nico"],
    ],
  },
  {
    slug: "valen",
    nombre: "Valentín",
    apellido: "Mayer",
    apodo: "Valen",
    edad: 21,
    instagram: "valen.mayer4",
    foto: null,
    frase: "Frase de presentación genérica: cómo arrancó con la máquina, qué le gusta hacer y por qué te vas a ir conforme.",
    datos: [
      ["Edad", "21 años"],
      ["En 203 desde", "2021 · Fundador"],
      ["Especialidad", "A completar"],
      ["No puede faltar", "A completar"],
    ],
    preguntas: [
      ["¿El corte que más te gusta hacer?", "A completar con Valen"],
      ["¿Qué suena en el local?", "A completar con Valen"],
      ["¿Club?", "A completar con Valen"],
    ],
  },
];

export const iniciales = (b) => (b.nombre[0] + b.apellido[0]).toUpperCase();

// "Nicolás Aguirre" y "nicolas aguirre" tienen que dar lo mismo
const normalizar = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Busca el perfil que corresponde a un barbero que vino del backend
export function buscarPerfil(barberoApi) {
  const clave = normalizar(`${barberoApi.nombre} ${barberoApi.apellido}`);
  return BARBEROS.find((b) => normalizar(`${b.nombre} ${b.apellido}`) === clave) || null;
}
