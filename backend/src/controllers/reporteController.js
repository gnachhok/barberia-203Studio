const { Pago, Gasto, Turno, Usuario, Servicio } = require("../models");
const { Op, fn, col } = require("sequelize");

// GET /reportes/ingresos?desde=&hasta=&barbero_id=&agrupar_por=servicio|dia|barbero
async function ingresos(req, res) {
    try {
        const { desde, hasta, barbero_id, agrupar_por } = req.query;

        const wherePago = { anulado: false };
        if (desde && hasta) {
            wherePago.fecha = { [Op.between]: [desde, hasta] };
        }

        const whereTurno = {};
        if (barbero_id) whereTurno.barbero_id = barbero_id;

        let groupField;
        let include = [{ model: Turno, where: whereTurno, attributes: [] }];

        if (agrupar_por === "servicio") {
            groupField = "Turno.servicio_id";
            include[0].include = [{ model: Servicio, attributes: ["nombre"] }];
        } else if (agrupar_por === "barbero") {
            groupField = "Turno.barbero_id";
            include[0].include = [{ model: Usuario, as: "barbero", attributes: ["nombre", "apellido"] }];
        } else {
            groupField = "fecha"; // agrupado por día, default
        }

        const resultado = await Pago.findAll({
            where: wherePago,
            include,
            attributes: [
                [fn("SUM", col("monto")), "total"],
                [fn("COUNT", col("Pago.id")), "cantidad"],
            ],
            group: [groupField],
            raw: true,
        });

        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar reporte de ingresos" });
    }
}

// GET /reportes/gastos?desde=&hasta=&categoria=
async function gastos(req, res) {
    try {
        const { desde, hasta, categoria } = req.query;

        const where = {};
        if (desde && hasta) where.fecha = { [Op.between]: [desde, hasta] };
        if (categoria) where.categoria = categoria;

        const total = await Gasto.sum("monto", { where });
        const detalle = await Gasto.findAll({ where, order: [["fecha", "DESC"]] });

        res.json({ total: total || 0, detalle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar reporte de gastos" });
    }
}

// GET /reportes/balance?desde=&hasta=
async function balance(req, res) {
    try {
        const { desde, hasta } = req.query;

        const wherePago = { anulado: false };
        const whereGasto = {};
        if (desde && hasta) {
            wherePago.fecha = { [Op.between]: [desde, hasta] };
            whereGasto.fecha = { [Op.between]: [desde, hasta] };
        }

        const totalIngresos = (await Pago.sum("monto", { where: wherePago })) || 0;
        const totalGastos = (await Gasto.sum("monto", { where: whereGasto })) || 0;

        res.json({
            ingresos: totalIngresos,
            gastos: totalGastos,
            balance: totalIngresos - totalGastos,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar balance" });
    }
}

module.exports = { ingresos, gastos, balance };