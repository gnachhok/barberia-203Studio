const { Turno, Servicio, Usuario, Pago } = require("../models");
const { Op } = require("sequelize");
const { horaAMinutos, minutosAHora } = require("../utils/horarios");
const { cargarAgenda, estaLibre } = require("../utils/agenda");
const { buscarBarberosActivos } = require("./barberoController");

// Función interna reutilizable: chequea si un horario se superpone con turnos existentes
async function haySuperposicion(barbero_id, fecha, hora_inicio, hora_fin, excluirTurnoId = null) {
    const where = {
        barbero_id,
        fecha,
        estado: { [Op.notIn]: ["cancelado", "ausente"] },
    };
    if (excluirTurnoId) {
        where.id = { [Op.ne]: excluirTurnoId };
    }

    const turnos = await Turno.findAll({ where });

    const inicioMin = horaAMinutos(hora_inicio);
    const finMin = horaAMinutos(hora_fin);

    return turnos.some((t) => {
        const tInicio = horaAMinutos(t.hora_inicio);
        const tFin = horaAMinutos(t.hora_fin);
        return inicioMin < tFin && finMin > tInicio;
    });
}

// POST /turnos
async function crear(req, res) {
    try {
        const { servicio_id, fecha, hora_inicio, notas } = req.body;
        let { cliente_id, cliente_nombre, barbero_id } = req.body;

        const esStaff = req.usuario.roles.some((r) => ["barbero", "admin"].includes(r));

        // Un cliente SIEMPRE reserva a su nombre: el id sale del token, nunca del body.
        // (Si no, cualquiera podría mandar otro cliente_id y reservar a nombre de otro.)
        if (!esStaff) {
            cliente_id = req.usuario.id;
            cliente_nombre = null;
        }

        if (!cliente_id && !cliente_nombre) {
            return res.status(400).json({ error: "Se requiere cliente_id o cliente_nombre" });
        }
        if (!servicio_id || !fecha || !hora_inicio) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }
        if (esStaff && !barbero_id) {
            return res.status(400).json({ error: "Falta barbero_id" });
        }

        const servicio = await Servicio.findByPk(servicio_id);
        if (!servicio) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }

        const inicioMin = horaAMinutos(hora_inicio);
        const hora_fin = minutosAHora(inicioMin + servicio.duracion_minutos);

        if (esStaff) {
            // El barbero carga turnos a mano (incluso fuera de horario): solo chequeamos que no se pise
            const ocupado = await haySuperposicion(barbero_id, fecha, hora_inicio, hora_fin);
            if (ocupado) {
                return res.status(409).json({ error: "Ese horario ya no está disponible" });
            }
        } else {
            // Revalidación real contra la agenda completa (horario, bloqueos, turnos y hora pasada):
            // no confiamos en lo que mostró /disponibilidad antes.
            const candidatos = barbero_id
                ? [Number(barbero_id)]
                : (await buscarBarberosActivos()).map((b) => b.id); // "sin preferencia"
            const agenda = await cargarAgenda(candidatos, fecha, fecha);
            const libres = candidatos.filter((id) =>
                estaLibre(agenda, id, fecha, hora_inicio, servicio.duracion_minutos)
            );
            if (libres.length === 0) {
                return res.status(409).json({ error: "Ese horario ya no está disponible" });
            }
            // Sin preferencia: le asignamos el turno al que tenga menos turnos ese día (reparte el trabajo)
            const turnosDelDia = (id) => agenda.turnos.filter((t) => t.barbero_id === id).length;
            barbero_id = libres.sort((a, b) => turnosDelDia(a) - turnosDelDia(b))[0];
        }

        const turno = await Turno.create({
            cliente_id: cliente_id || null,
            cliente_nombre: cliente_id ? null : cliente_nombre,
            barbero_id,
            servicio_id,
            fecha,
            hora_inicio,
            hora_fin,
            notas: notas || null,
            estado: "confirmado",
            creado_por: esStaff ? "barbero" : "cliente",
        });

        res.status(201).json(turno);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear turno" });
    }
}

// GET /turnos — cliente ve los suyos, barbero ve los suyos, admin ve todos
async function listar(req, res) {
    try {
        const { fecha, estado, barbero_id } = req.query;
        const where = {};

        if (fecha) where.fecha = fecha;
        if (estado) where.estado = estado;

        const roles = req.usuario.roles;
        if (roles.includes("admin")) {
            if (barbero_id) where.barbero_id = barbero_id;
        } else if (roles.includes("barbero")) {
            where.barbero_id = req.usuario.id;
        } else {
            where.cliente_id = req.usuario.id;
        }

        const turnos = await Turno.findAll({
            where,
            include: [
                { model: Usuario, as: "cliente", attributes: ["id", "nombre", "apellido"] },
                { model: Usuario, as: "barbero", attributes: ["id", "nombre", "apellido"] },
                { model: Servicio, attributes: ["id", "nombre", "precio", "duracion_minutos"] },
            ],
            order: [["fecha", "ASC"], ["hora_inicio", "ASC"]],
        });

        res.json(turnos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al listar turnos" });
    }
}

// PUT /turnos/:id — reprogramar
async function reprogramar(req, res) {
    try {
        const turno = await Turno.findByPk(req.params.id);
        if (!turno) return res.status(404).json({ error: "Turno no encontrado" });

        if (turno.estado !== "confirmado") {
            return res.status(400).json({ error: "Solo se pueden reprogramar turnos confirmados" });
        }

        const { fecha, hora_inicio } = req.body;
        const servicio = await Servicio.findByPk(turno.servicio_id);
        const inicioMin = horaAMinutos(hora_inicio);
        const hora_fin = minutosAHora(inicioMin + servicio.duracion_minutos);

        const ocupado = await haySuperposicion(
            turno.barbero_id,
            fecha,
            hora_inicio,
            hora_fin,
            turno.id
        );
        if (ocupado) {
            return res.status(409).json({ error: "Ese horario ya no está disponible" });
        }

        await turno.update({ fecha, hora_inicio, hora_fin });
        res.json({ mensaje: "Turno reprogramado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al reprogramar turno" });
    }
}

// PATCH /turnos/:id/cancelar
async function cancelar(req, res) {
    try {
        const turno = await Turno.findByPk(req.params.id);
        if (!turno) return res.status(404).json({ error: "Turno no encontrado" });

        if (turno.estado !== "confirmado") {
            return res.status(400).json({ error: "Solo se pueden cancelar turnos confirmados" });
        }

        await turno.update({ estado: "cancelado" });
        res.json({ mensaje: "Turno cancelado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cancelar turno" });
    }
}

// PATCH /turnos/:id/completar — dispara la creación del Pago
async function completar(req, res) {
    try {
        const turno = await Turno.findByPk(req.params.id);
        if (!turno) return res.status(404).json({ error: "Turno no encontrado" });

        if (turno.estado !== "confirmado") {
            return res.status(400).json({ error: "Solo se pueden completar turnos confirmados" });
        }

        const { monto, metodo_pago } = req.body;
        if (!monto || !metodo_pago) {
            return res.status(400).json({ error: "Faltan monto y metodo_pago" });
        }

        await turno.update({ estado: "completado", precio_final: monto });

        await Pago.create({
            turno_id: turno.id,
            monto,
            metodo_pago,
        });

        res.json({ mensaje: "Turno completado y pago registrado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al completar turno" });
    }
}

// PATCH /turnos/:id/ausente
async function ausente(req, res) {
    try {
        const turno = await Turno.findByPk(req.params.id);
        if (!turno) return res.status(404).json({ error: "Turno no encontrado" });

        if (turno.estado !== "confirmado") {
            return res.status(400).json({ error: "Solo se pueden marcar ausentes turnos confirmados" });
        }

        await turno.update({ estado: "ausente" });
        res.json({ mensaje: "Turno marcado como ausente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al marcar ausente" });
    }
}

module.exports = { crear, listar, reprogramar, cancelar, completar, ausente };