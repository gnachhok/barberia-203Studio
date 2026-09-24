const { Op } = require("sequelize");
const { HorarioBarbero, BloqueoHorario, Turno } = require("../models");
const { horaAMinutos, minutosAHora } = require("./horarios");

// Margen para no ofrecer un turno que arranca en 5 minutos
const MARGEN_MINUTOS_HOY = 30;

// Fecha "YYYY-MM-DD" en hora LOCAL del servidor.
// Ojo: toISOString() devuelve la fecha en UTC, y en Argentina (UTC-3)
// después de las 21 hs ya sería "mañana". Por eso armamos la fecha a mano.
function fechaLocal(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function sumarDias(fechaIso, dias) {
    const d = new Date(`${fechaIso}T00:00:00`);
    d.setDate(d.getDate() + dias);
    return fechaLocal(d);
}

// Trae de una sola vez todo lo necesario para calcular la agenda de varios
// barberos en un rango de fechas: 3 consultas en total, sin importar cuántos días sean.
async function cargarAgenda(barberoIds, desde, hasta) {
    const [horarios, bloqueos, turnos] = await Promise.all([
        HorarioBarbero.findAll({ where: { barbero_id: barberoIds } }),
        BloqueoHorario.findAll({ where: { barbero_id: barberoIds } }),
        Turno.findAll({
            where: {
                barbero_id: barberoIds,
                fecha: { [Op.between]: [desde, hasta] },
                estado: { [Op.notIn]: ["cancelado", "ausente"] },
            },
        }),
    ]);
    return { horarios, bloqueos, turnos };
}

// Arma la "foto" de un día de un barbero: horario, turnos ocupados y desde qué
// minuto se puede reservar. Devuelve null si ese día no trabaja (sin horario o bloqueado).
function diaDelBarbero(agenda, barberoId, fecha) {
    const diaSemana = new Date(`${fecha}T00:00:00`).getDay();

    // PASO 1: horario base de ese día de la semana
    const horario = agenda.horarios.find(
        (h) => h.barbero_id === barberoId && h.dia_semana === diaSemana
    );
    if (!horario) return null;

    // PASO 2: bloqueos (vacaciones, día libre) que cubran esa fecha
    const fechaConsulta = new Date(`${fecha}T00:00:00`);
    const bloqueado = agenda.bloqueos.some((b) => {
        if (b.barbero_id !== barberoId) return false;
        const inicio = new Date(new Date(b.fecha_inicio).toDateString());
        const fin = new Date(new Date(b.fecha_fin).toDateString());
        return fechaConsulta >= inicio && fechaConsulta <= fin;
    });
    if (bloqueado) return null;

    // PASO 3: turnos que ya tiene ese día
    const ocupados = agenda.turnos
        .filter((t) => t.barbero_id === barberoId && t.fecha === fecha)
        .map((t) => [horaAMinutos(t.hora_inicio), horaAMinutos(t.hora_fin)]);

    // PASO 4: si es hoy, no ofrecer horarios que ya pasaron
    const ahora = new Date();
    const minimo = fecha === fechaLocal(ahora)
        ? ahora.getHours() * 60 + ahora.getMinutes() + MARGEN_MINUTOS_HOY
        : 0;

    return {
        inicioMin: horaAMinutos(horario.hora_inicio),
        finMin: horaAMinutos(horario.hora_fin),
        ocupados,
        minimo,
    };
}

// ¿Entra un servicio de `duracion` minutos arrancando en el minuto `t`?
function entra(dia, t, duracion) {
    if (t < dia.inicioMin || t + duracion > dia.finMin || t < dia.minimo) return false;
    return !dia.ocupados.some(([ini, fin]) => t < fin && t + duracion > ini);
}

// Calcula los horarios de UN barbero en UNA fecha, usando la agenda ya cargada.
// Devuelve null si ese día no trabaja, o una lista de { hora, libre } con los
// inicios posibles cada `paso` minutos.
function slotsDelDia(agenda, barberoId, fecha, duracion, paso) {
    const dia = diaDelBarbero(agenda, barberoId, fecha);
    if (!dia) return null;

    const slots = [];
    for (let t = dia.inicioMin; t + duracion <= dia.finMin; t += paso) {
        slots.push({ hora: minutosAHora(t), libre: entra(dia, t, duracion) });
    }
    return slots;
}

// ¿Ese barbero puede atender en esa fecha y hora exacta? (para validar al crear el turno)
function estaLibre(agenda, barberoId, fecha, horaInicio, duracion) {
    const dia = diaDelBarbero(agenda, barberoId, fecha);
    return dia !== null && entra(dia, horaAMinutos(horaInicio), duracion);
}

// Combina varios barberos: un horario está libre si al menos uno lo tiene libre.
// Devuelve null si ningún barbero trabaja ese día.
function slotsCombinados(agenda, barberoIds, fecha, duracion, paso) {
    const porBarbero = barberoIds
        .map((id) => ({ id, slots: slotsDelDia(agenda, id, fecha, duracion, paso) }))
        .filter((b) => b.slots !== null);
    if (porBarbero.length === 0) return null;

    const mapa = new Map(); // hora -> [ids de barberos libres]
    for (const { id, slots } of porBarbero) {
        for (const s of slots) {
            if (!mapa.has(s.hora)) mapa.set(s.hora, []);
            if (s.libre) mapa.get(s.hora).push(id);
        }
    }
    return [...mapa.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([hora, barberos]) => ({ hora, libre: barberos.length > 0, barberos }));
}

module.exports = { fechaLocal, sumarDias, cargarAgenda, slotsDelDia, slotsCombinados, estaLibre };
