const { NotaCliente, Usuario } = require("../models");

// GET /clientes/:id/notas — solo barbero/admin
async function listar(req, res) {
    try {
        const notas = await NotaCliente.findAll({
            where: { cliente_id: req.params.id },
            include: { model: Usuario, as: "barbero", attributes: ["id", "nombre", "apellido"] },
            order: [["createdAt", "DESC"]],
        });

        res.json(notas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al listar notas" });
    }
}

// POST /clientes/:id/notas
async function crear(req, res) {
    try {
        const { nota } = req.body;

        if (!nota) {
            return res.status(400).json({ error: "Falta el contenido de la nota" });
        }

        const cliente = await Usuario.findByPk(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        const notaCreada = await NotaCliente.create({
            cliente_id: req.params.id,
            barbero_id: req.usuario.id, // el barbero logueado que escribe la nota
            nota,
        });

        res.status(201).json(notaCreada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear nota" });
    }
}

// PUT /notas/:id — solo el barbero que la escribió
async function actualizar(req, res) {
    try {
        const notaExistente = await NotaCliente.findByPk(req.params.id);
        if (!notaExistente) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }

        if (notaExistente.barbero_id !== req.usuario.id) {
            return res.status(403).json({ error: "Solo podés editar tus propias notas" });
        }

        const { nota } = req.body;
        await notaExistente.update({ nota });

        res.json({ mensaje: "Nota actualizada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar nota" });
    }
}

// DELETE /notas/:id — el barbero que la escribió, o admin
async function eliminar(req, res) {
    try {
        const nota = await NotaCliente.findByPk(req.params.id);
        if (!nota) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }

        const esAdmin = req.usuario.roles.includes("admin");
        const esAutor = nota.barbero_id === req.usuario.id;

        if (!esAdmin && !esAutor) {
            return res.status(403).json({ error: "No podés eliminar esta nota" });
        }

        await nota.destroy();
        res.json({ mensaje: "Nota eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar nota" });
    }
}

module.exports = { listar, crear, actualizar, eliminar };