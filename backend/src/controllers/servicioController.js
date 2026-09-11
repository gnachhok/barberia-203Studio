const { Servicio } = require("../models");

// GET /servicios — público, cualquiera puede ver el catálogo
async function listar(req, res) {
    try {
        const { incluirInactivos } = req.query;

        const where = incluirInactivos === "true" ? {} : { activo: true };

        const servicios = await Servicio.findAll({ where });
        res.json(servicios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al listar servicios" });
    }
}

// GET /servicios/:id — público
async function obtenerPorId(req, res) {
    try {
        const servicio = await Servicio.findByPk(req.params.id);

        if (!servicio) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }

        res.json(servicio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener servicio" });
    }
}

// POST /servicios — solo admin
async function crear(req, res) {
    try {
        const { nombre, descripcion, precio, duracion_minutos } = req.body;

        if (!nombre || !precio || !duracion_minutos) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const servicio = await Servicio.create({
            nombre,
            descripcion,
            precio,
            duracion_minutos,
        });

        res.status(201).json(servicio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear servicio" });
    }
}

// PUT /servicios/:id — solo admin
async function actualizar(req, res) {
    try {
        const servicio = await Servicio.findByPk(req.params.id);

        if (!servicio) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }

        const { nombre, descripcion, precio, duracion_minutos } = req.body;
        await servicio.update({ nombre, descripcion, precio, duracion_minutos });

        res.json({ mensaje: "Servicio actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar servicio" });
    }
}

// DELETE /servicios/:id — solo admin, soft delete
async function eliminar(req, res) {
    try {
        const servicio = await Servicio.findByPk(req.params.id);

        if (!servicio) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }

        await servicio.update({ activo: false });
        res.json({ mensaje: "Servicio desactivado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al desactivar servicio" });
    }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };