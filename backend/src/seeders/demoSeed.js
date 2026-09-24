// Seed de DESARROLLO: crea a los dos barberos con su horario semanal para poder
// probar la reserva de punta a punta. No corre solo: se ejecuta a mano con
//   npm run seed:demo
// Es idempotente: si el barbero ya existe (mismo email) no lo duplica.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, Usuario, Rol, HorarioBarbero } = require("../models");

const PASSWORD_DEMO = process.env.DEMO_PASSWORD || "cambiar123";

const BARBEROS = [
    { nombre: "Nicolás", apellido: "Aguirre", email: "nico@203studio.test" },
    { nombre: "Valentín", apellido: "Mayer", email: "valen@203studio.test" },
];

// Martes a viernes 10 a 20, sábado 10 a 17 (0 = domingo ... 6 = sábado)
const HORARIO_SEMANAL = [
    { dia_semana: 2, hora_inicio: "10:00", hora_fin: "20:00" },
    { dia_semana: 3, hora_inicio: "10:00", hora_fin: "20:00" },
    { dia_semana: 4, hora_inicio: "10:00", hora_fin: "20:00" },
    { dia_semana: 5, hora_inicio: "10:00", hora_fin: "20:00" },
    { dia_semana: 6, hora_inicio: "10:00", hora_fin: "17:00" },
];

async function seedDemo() {
    await sequelize.authenticate();
    const rolBarbero = await Rol.findOne({ where: { nombre: "barbero" } });
    if (!rolBarbero) throw new Error("No existe el rol barbero: levantá el server una vez primero");

    for (const datos of BARBEROS) {
        const [usuario, creado] = await Usuario.findOrCreate({
            where: { email: datos.email },
            defaults: { ...datos, password: await bcrypt.hash(PASSWORD_DEMO, 10) },
        });
        await usuario.addRol(rolBarbero); // no duplica si ya lo tiene

        const tieneHorario = await HorarioBarbero.count({ where: { barbero_id: usuario.id } });
        if (!tieneHorario) {
            await HorarioBarbero.bulkCreate(HORARIO_SEMANAL.map((h) => ({ ...h, barbero_id: usuario.id })));
        }
        console.log(`${creado ? "✅ Creado" : "↺ Ya existía"}: ${datos.nombre} ${datos.apellido} (id ${usuario.id})`);
    }
    console.log(`Contraseña de las cuentas demo: ${PASSWORD_DEMO}`);
}

seedDemo()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌", err.message);
        process.exit(1);
    });
