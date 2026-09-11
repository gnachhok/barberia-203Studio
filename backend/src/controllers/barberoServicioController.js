const { Usuario, Servicio } = require("../models");

// GET /barberos/:id/servicios — público, para que el cliente vea qué ofrece cada barbero
async function listar(req, res) {
    try {
        const barbero = await Usuario.findByPk(req.params.id, {
            include: {
                model: Servicio,
                as: "servicios",
                through: { attributes: ["precio_personalizado"] },
            },
        });

        if (!barbero) {
            return res.status(404).json({ error: "Barbero no encontrado" });
        }

        res.json(barbero.servicios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al listar servicios del barbero" });
    }
}

// POST /barberos/:id/servicios — asocia un servicio existente a un barbero
async function asociar(req, res) {
    try {
        const { servicio_id, precio_personalizado } = req.body;

        if (!servicio_id) {
            return res.status(400).json({ error: "Falta servicio_id" });
        }

        const barbero = await Usuario.findByPk(req.params.id);
        if (!barbero) {
            return res.status(404).json({ error: "Barbero no encontrado" });
        }

        const servicio = await Servicio.findByPk(servicio_id);
        if (!servicio) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }

        await barbero.addServicio(servicio, {
            through: { precio_personalizado: precio_personalizado || null },
        });

        res.status(201).json({ mensaje: "Servicio asociado al barbero correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al asociar servicio" });
    }
}

// DELETE /barberos/:id/servicios/:servicioId — desasocia
async function desasociar(req, res) {
    try {
        const barbero = await Usuario.findByPk(req.params.id);
        if (!barbero) {
            return res.status(404).json({ error: "Barbero no encontrado" });
        }

        const servicio = await Servicio.findByPk(req.params.servicioId);
        if (!servicio) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }

        await barbero.removeServicio(servicio);

        res.json({ mensaje: "Servicio desasociado del barbero correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al desasociar servicio" });
    }
}

module.exports = { listar, asociar, desasociar };