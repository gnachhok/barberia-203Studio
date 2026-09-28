const { Usuario, Rol, Servicio } = require("../models");
const { cargarAgenda, slotsDelDia } = require("../utils/agenda");
const { horaAMinutos, minutosAHora } = require("../utils/horarios");

// Barberos activos, solo con datos públicos (nunca email, teléfono ni password).
// La usan GET /barberos y la disponibilidad "sin preferencia".
async function buscarBarberosActivos() {
    return Usuario.findAll({
        where: { activo: true },
        attributes: ["id", "nombre", "apellido"],
        include: {
            model: Rol,
            where: { nombre: "barbero" },
            attributes: [],
            through: { attributes: [] },
        },
        order: [["id", "ASC"]],
    });
}

// GET /barberos — público
async function listarPublico(req, res) {
    try {
        const barberos = await buscarBarberosActivos();
        res.json(barberos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al listar barberos" });
    }
}

// GET /barberos/:id/dia?fecha=YYYY-MM-DD[&servicio_id=]  — panel del barbero
// Devuelve el horario de ese barbero ese día (para dibujar los huecos de la agenda) y,
// si se pasa servicio_id, los horarios donde entra ese servicio (para cargar un turno a mano).
// A diferencia de la disponibilidad pública: va de a 15 min y deja anotar en el bloque
// que ya empezó (el cliente está en la puerta).
const PASO_LOCAL = 15;
const MARGEN_LOCAL = -14; // permite el bloque de 15 min en curso

async function agendaDelDia(req, res) {
    try {
        const barberoId = Number(req.params.id);
        const { fecha, servicio_id } = req.query;
        if (!fecha) {
            return res.status(400).json({ error: "Falta parámetro: fecha" });
        }

        const agenda = await cargarAgenda([barberoId], fecha, fecha);
        // Con duración 1 el cálculo solo nos dice si trabaja ese día y en qué horario
        const base = slotsDelDia(agenda, barberoId, fecha, 1, PASO_LOCAL, MARGEN_LOCAL);
        if (!base) {
            return res.json({ fecha, cerrado: true, abre: null, cierra: null, huecos: [] });
        }

        const diaSemana = new Date(`${fecha}T00:00:00`).getDay();
        const horario = agenda.horarios.find((h) => h.dia_semana === diaSemana);
        const respuesta = {
            fecha,
            cerrado: false,
            abre: minutosAHora(horaAMinutos(horario.hora_inicio)),
            cierra: minutosAHora(horaAMinutos(horario.hora_fin)),
            huecos: [],
        };

        if (servicio_id) {
            const servicio = await Servicio.findByPk(servicio_id);
            if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });
            const slots = slotsDelDia(agenda, barberoId, fecha, servicio.duracion_minutos, PASO_LOCAL, MARGEN_LOCAL);
            respuesta.huecos = slots.filter((s) => s.libre).map((s) => s.hora);
        }

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al calcular la agenda del día" });
    }
}

module.exports = { buscarBarberosActivos, listarPublico, agendaDelDia };
