const { Gasto } = require("../models");
const { Op } = require("sequelize");

// GET /gastos — filtros por barbero, categoría, rango de fechas
async function listar(req, res) {
    try {
        const { barbero_id, categoria, desde, hasta } = req.query;

        const where = {};
        if (barbero_id) where.barbero_id = barbero_id;
        if (categoria) where.categoria = categoria;
        if (desde && hasta) {
            where.fecha = { [Op.between]: [desde, hasta] };
        }

        const gastos = await Gasto.findAll({ where, order: [["fecha", "DESC"]] });
        res.json(gastos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al listar gastos" });
    }
}

// POST /gastos
async function crear(req, res) {
    try {
        const { descripcion, monto, categoria, fecha, barbero_id } = req.body;

        if (!descripcion || !monto) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const gasto = await Gasto.create({
            descripcion,
            monto,
            categoria,
            fecha: fecha || new Date(),
            barbero_id: barbero_id || null, // null = gasto general del local
        });

        res.status(201).json(gasto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear gasto" });
    }
}

// PUT /gastos/:id
async function actualizar(req, res) {
    try {
        const gasto = await Gasto.findByPk(req.params.id);
        if (!gasto) {
            return res.status(404).json({ error: "Gasto no encontrado" });
        }

        const { descripcion, monto, categoria, fecha } = req.body;
        await gasto.update({ descripcion, monto, categoria, fecha });

        res.json({ mensaje: "Gasto actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar gasto" });
    }
}

// DELETE /gastos/:id
async function eliminar(req, res) {
    try {
        const gasto = await Gasto.findByPk(req.params.id);
        if (!gasto) {
            return res.status(404).json({ error: "Gasto no encontrado" });
        }

        await gasto.destroy();
        res.json({ mensaje: "Gasto eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar gasto" });
    }
}

module.exports = { listar, crear, actualizar, eliminar };