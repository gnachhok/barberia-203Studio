const { HorarioBarbero, BloqueoHorario, Turno, Servicio } = require("../models");
const { Op } = require("sequelize");
const { horaAMinutos, minutosAHora } = require("../utils/horarios");

const PASO_MINUTOS = 15;
const MARGEN_MINUTOS_HOY = 30;

async function calcularDisponibilidad(req, res) {
    try {
        const { barbero_id, servicio_id, fecha } = req.query;

        if (!barbero_id || !servicio_id || !fecha) {
            return res.status(400).json({
                error: "Faltan parámetros: barbero_id, servicio_id, fecha",
            });
        }

        // Necesitamos la duración del servicio para saber cuánto "ocupa" cada slot
        const servicio = await Servicio.findByPk(servicio_id);
        if (!servicio) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }
        const duracion = servicio.duracion_minutos;

        // PASO 1: horario base de ese día de la semana
        const diaSemana = new Date(`${fecha}T00:00:00`).getDay();

        const horario = await HorarioBarbero.findOne({
            where: { barbero_id, dia_semana: diaSemana },
        });

        if (!horario) {
            return res.json([]); // el barbero no trabaja ese día, no hay nada que calcular
        }

        // PASO 2: bloqueos (vacaciones, día libre) que cubran esa fecha
        const bloqueos = await BloqueoHorario.findAll({ where: { barbero_id } });

        const fechaConsulta = new Date(`${fecha}T00:00:00`);
        const hayBloqueoTotal = bloqueos.some((b) => {
            const inicio = new Date(new Date(b.fecha_inicio).toDateString());
            const fin = new Date(new Date(b.fecha_fin).toDateString());
            return fechaConsulta >= inicio && fechaConsulta <= fin;
        });

        if (hayBloqueoTotal) {
            return res.json([]);
        }

        // PASO 3: generar slots candidatos cada 15 min dentro del horario
        const inicioMin = horaAMinutos(horario.hora_inicio);
        const finMin = horaAMinutos(horario.hora_fin);

        const candidatos = [];
        for (let t = inicioMin; t + duracion <= finMin; t += PASO_MINUTOS) {
            candidatos.push(t);
        }

        // PASO 4: descartar los que chocan con turnos ya existentes
        const turnosExistentes = await Turno.findAll({
            where: {
                barbero_id,
                fecha,
                estado: { [Op.notIn]: ["cancelado", "ausente"] },
            },
        });

        const libres = candidatos.filter((slotInicio) => {
            const slotFin = slotInicio + duracion;
            return !turnosExistentes.some((turno) => {
                const turnoInicio = horaAMinutos(turno.hora_inicio);
                const turnoFin = horaAMinutos(turno.hora_fin);
                return slotInicio < turnoFin && slotFin > turnoInicio;
            });
        });

        // PASO 5: si la fecha consultada es hoy, sacar los horarios ya pasados
        const ahora = new Date();
        const esHoy = fecha === ahora.toISOString().slice(0, 10);

        const resultado = esHoy
            ? libres.filter(
                (slot) =>
                    slot >= ahora.getHours() * 60 + ahora.getMinutes() + MARGEN_MINUTOS_HOY
            )
            : libres;

        res.json(resultado.map(minutosAHora));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al calcular disponibilidad" });
    }
}

module.exports = { calcularDisponibilidad };