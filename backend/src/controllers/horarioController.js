const { HorarioBarbero, Usuario } = require("../models");

// GET /barberos/:id/horarios — público (el cliente necesita saber cuándo trabaja para armar el calendario)
async function listar(req, res) {
    try {
        const horarios = await HorarioBarbero.findAll({
            where: { barbero_id: req.params.id },
            order: [["dia_semana", "ASC"]],
        });

        res.json(horarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al listar horarios" });
    }
}

// POST /barberos/:id/horarios — el propio barbero o admin
async function crear(req, res) {
    try {
        const { dia_semana, hora_inicio, hora_fin } = req.body;

        if (dia_semana === undefined || !hora_inicio || !hora_fin) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        if (hora_inicio >= hora_fin) {
            return res.status(400).json({ error: "La hora de inicio debe ser menor a la de fin" });
        }

        const barbero = await Usuario.findByPk(req.params.id);
        if (!barbero) {
            return res.status(404).json({ error: "Barbero no encontrado" });
        }

        const horario = await HorarioBarbero.create({
            barbero_id: req.params.id,
            dia_semana,
            hora_inicio,
            hora_fin,
        });

        res.status(201).json(horario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear horario" });
    }
}

// PUT /barberos/:id/horarios/:horarioId
async function actualizar(req, res) {
    try {
        const horario = await HorarioBarbero.findOne({
            where: { id: req.params.horarioId, barbero_id: req.params.id },
        });

        if (!horario) {
            return res.status(404).json({ error: "Horario no encontrado" });
        }

        const { dia_semana, hora_inicio, hora_fin } = req.body;

        if (hora_inicio && hora_fin && hora_inicio >= hora_fin) {
            return res.status(400).json({ error: "La hora de inicio debe ser menor a la de fin" });
        }

        await horario.update({ dia_semana, hora_inicio, hora_fin });
        res.json({ mensaje: "Horario actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar horario" });
    }
}

// DELETE /barberos/:id/horarios/:horarioId
async function eliminar(req, res) {
    try {
        const horario = await HorarioBarbero.findOne({
            where: { id: req.params.horarioId, barbero_id: req.params.id },
        });

        if (!horario) {
            return res.status(404).json({ error: "Horario no encontrado" });
        }

        await horario.destroy();
        res.json({ mensaje: "Horario eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar horario" });
    }
}

module.exports = { listar, crear, actualizar, eliminar };