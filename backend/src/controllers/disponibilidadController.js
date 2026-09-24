const { Servicio } = require("../models");
const { buscarBarberosActivos } = require("./barberoController");
const {
    fechaLocal,
    sumarDias,
    cargarAgenda,
    slotsDelDia,
    slotsCombinados,
} = require("../utils/agenda");

const PASO_MINUTOS = 15;   // endpoint original: granularidad fina
const PASO_RESERVA = 30;   // reserva online: los turnos arrancan cada 30 min
const DIAS_VENTANA = 30;   // se puede reservar desde hoy hasta 29 días adelante

// Resuelve qué barberos considerar: uno puntual, o todos los activos ("sin preferencia")
async function resolverBarberos(barbero_id) {
    if (barbero_id) return [Number(barbero_id)];
    const barberos = await buscarBarberosActivos();
    return barberos.map((b) => b.id);
}

// GET /disponibilidad?barbero_id&servicio_id&fecha
// Endpoint original: devuelve solo los horarios libres como strings ["10:00", "10:15", ...]
async function calcularDisponibilidad(req, res) {
    try {
        const { barbero_id, servicio_id, fecha } = req.query;

        if (!barbero_id || !servicio_id || !fecha) {
            return res.status(400).json({
                error: "Faltan parámetros: barbero_id, servicio_id, fecha",
            });
        }

        const servicio = await Servicio.findByPk(servicio_id);
        if (!servicio) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }

        const id = Number(barbero_id);
        const agenda = await cargarAgenda([id], fecha, fecha);
        const slots = slotsDelDia(agenda, id, fecha, servicio.duracion_minutos, PASO_MINUTOS) || [];

        res.json(slots.filter((s) => s.libre).map((s) => s.hora));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al calcular disponibilidad" });
    }
}

// GET /disponibilidad/dia?servicio_id&fecha[&barbero_id]
// Para la pantalla de reserva: TODOS los horarios del día (libres y ocupados),
// y en cada uno qué barberos lo tienen libre. Sin barbero_id = "sin preferencia".
async function disponibilidadDia(req, res) {
    try {
        const { barbero_id, servicio_id, fecha } = req.query;

        if (!servicio_id || !fecha) {
            return res.status(400).json({ error: "Faltan parámetros: servicio_id, fecha" });
        }

        const servicio = await Servicio.findByPk(servicio_id);
        if (!servicio) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }

        const ids = await resolverBarberos(barbero_id);
        const agenda = await cargarAgenda(ids, fecha, fecha);
        const slots = slotsCombinados(agenda, ids, fecha, servicio.duracion_minutos, PASO_RESERVA);

        res.json({ fecha, cerrado: slots === null, slots: slots || [] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al calcular disponibilidad del día" });
    }
}

// GET /disponibilidad/mes?servicio_id[&barbero_id]
// Resumen de los próximos 30 días para pintar el calendario en UNA sola llamada:
// { "2026-09-24": { estado: "libre", libres: 8 }, "2026-09-28": { estado: "cerrado", libres: 0 }, ... }
async function disponibilidadMes(req, res) {
    try {
        const { barbero_id, servicio_id } = req.query;

        if (!servicio_id) {
            return res.status(400).json({ error: "Falta parámetro: servicio_id" });
        }

        const servicio = await Servicio.findByPk(servicio_id);
        if (!servicio) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }

        const desde = fechaLocal();
        const hasta = sumarDias(desde, DIAS_VENTANA - 1);
        const ids = await resolverBarberos(barbero_id);
        const agenda = await cargarAgenda(ids, desde, hasta);

        const resumen = {};
        for (let i = 0; i < DIAS_VENTANA; i++) {
            const fecha = sumarDias(desde, i);
            const slots = slotsCombinados(agenda, ids, fecha, servicio.duracion_minutos, PASO_RESERVA);
            const libres = slots ? slots.filter((s) => s.libre).length : 0;
            // Hoy sin horarios porque ya pasaron cuenta como "cerrado", no "lleno"
            const yaPaso = i === 0 && slots && libres === 0;
            resumen[fecha] = {
                estado: !slots || yaPaso ? "cerrado" : libres > 0 ? "libre" : "lleno",
                libres,
            };
        }

        res.json({ desde, hasta, dias: resumen });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al calcular disponibilidad del mes" });
    }
}

module.exports = { calcularDisponibilidad, disponibilidadDia, disponibilidadMes };
