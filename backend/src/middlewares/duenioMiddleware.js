const { Turno } = require("../models");

const esAdmin = (usuario) => usuario.roles.includes("admin");


function soloSuAgenda(req, res, next) {
    if (esAdmin(req.usuario) || Number(req.params.id) === req.usuario.id) return next();
    return res.status(403).json({ error: "Solo podés modificar tu propia agenda" });
}


async function cargarTurnoPropio(req, res, next) {
    try {
        const turno = await Turno.findByPk(req.params.id);
        if (!turno) return res.status(404).json({ error: "Turno no encontrado" });

        const { id, roles } = req.usuario;
        const puede = esAdmin(req.usuario)
            || (roles.includes("barbero") && turno.barbero_id === id)
            || turno.cliente_id === id;
        if (!puede) return res.status(404).json({ error: "Turno no encontrado" });

        req.turno = turno;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al buscar el turno" });
    }
}

module.exports = { soloSuAgenda, cargarTurnoPropio };