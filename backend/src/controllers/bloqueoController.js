const { BloqueoHorario, Usuario } = require("../models");

// GET /barberos/:id/bloqueos — público (afecta la disponibilidad que ve el cliente)
async function listar(req, res) {
    try {
        const bloqueos = await BloqueoHorario.findAll({
            where: { barbero_id: req.params.id },
            order: [["fecha_inicio", "ASC"]],
        });

        res.json(bloqueos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al listar bloqueos" });
    }
}

// POST /barberos/:id/bloqueos
async function crear(req, res) {
    try {
        const { fecha_inicio, fecha_fin, motivo } = req.body;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: "Faltan fechas obligatorias" });
        }

        if (new Date(fecha_inicio) > new Date(fecha_fin)) {
            return res.status(400).json({ error: "La fecha de inicio debe ser anterior a la de fin" });
        }

        const barbero = await Usuario.findByPk(req.params.id);
        if (!barbero) {
            return res.status(404).json({ error: "Barbero no encontrado" });
        }

        const bloqueo = await BloqueoHorario.create({
            barbero_id: req.params.id,
            fecha_inicio,
            fecha_fin,
            motivo,
        });

        res.status(201).json(bloqueo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear bloqueo" });
    }
}

// DELETE /barberos/:id/bloqueos/:bloqueoId
async function eliminar(req, res) {
    try {
        const bloqueo = await BloqueoHorario.findOne({
            where: { id: req.params.bloqueoId, barbero_id: req.params.id },
        });

        if (!bloqueo) {
            return res.status(404).json({ error: "Bloqueo no encontrado" });
        }

        await bloqueo.destroy();
        res.json({ mensaje: "Bloqueo eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar bloqueo" });
    }
}

module.exports = { listar, crear, eliminar };