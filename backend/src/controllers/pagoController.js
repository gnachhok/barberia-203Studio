const { Pago, Turno, Usuario, Servicio } = require("../models");
const { Op } = require("sequelize");

// GET /pagos — filtros por barbero, rango de fechas
async function listar(req, res) {
    try {
        const { barbero_id, desde, hasta } = req.query;

        const whereTurno = {};
        if (barbero_id) whereTurno.barbero_id = barbero_id;

        const wherePago = {};
        if (desde && hasta) {
            wherePago.fecha = { [Op.between]: [desde, hasta] };
        }

        const pagos = await Pago.findAll({
            where: wherePago,
            include: {
                model: Turno,
                where: whereTurno,
                include: [
                    { model: Usuario, as: "barbero", attributes: ["id", "nombre", "apellido"] },
                    { model: Servicio, attributes: ["id", "nombre"] },
                ],
            },
            order: [["fecha", "DESC"]],
        });

        res.json(pagos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al listar pagos" });
    }
}

// GET /pagos/:id
async function obtenerPorId(req, res) {
    try {
        const pago = await Pago.findByPk(req.params.id, {
            include: { model: Turno },
        });

        if (!pago) {
            return res.status(404).json({ error: "Pago no encontrado" });
        }

        res.json(pago);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener pago" });
    }
}

// PATCH /pagos/:id/anular
async function anular(req, res) {
    try {
        const pago = await Pago.findByPk(req.params.id);
        if (!pago) {
            return res.status(404).json({ error: "Pago no encontrado" });
        }

        if (pago.anulado) {
            return res.status(400).json({ error: "Este pago ya estaba anulado" });
        }

        const { motivo } = req.body;

        await pago.update({ anulado: true, motivo_anulacion: motivo || null });

        res.json({ mensaje: "Pago anulado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al anular pago" });
    }
}

module.exports = { listar, obtenerPorId, anular };