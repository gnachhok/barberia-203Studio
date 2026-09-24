const { Servicio } = require("../models");

// Servicios base del local. findOrCreate busca por nombre: si ya existe NO lo pisa,
// así los cambios de precio que se hagan desde la app no se pierden al reiniciar.
const SERVICIOS = [
    { nombre: "Corte", descripcion: "Corte a máquina o tijera", precio: 18000, duracion_minutos: 30 },
    { nombre: "Corte + barba", descripcion: "El combo completo", precio: 22000, duracion_minutos: 45 },
    { nombre: "Barba", descripcion: "Perfilado y arreglo", precio: 13000, duracion_minutos: 15 },
];

async function seedServicios() {
    for (const { nombre, ...resto } of SERVICIOS) {
        await Servicio.findOrCreate({ where: { nombre }, defaults: resto });
    }
    console.log("✅ Servicios verificados/creados:", SERVICIOS.map((s) => s.nombre).join(", "));
}

module.exports = seedServicios;
