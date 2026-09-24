const { Usuario, Rol } = require("../models");

// Barberos activos, solo con datos públicos (nunca email, teléfono ni password).
// La usan GET /barberos y la disponibilidad "sin preferencia".
async function buscarBarberosActivos() {
    return Usuario.findAll({
        where: { activo: true },
        attributes: ["id", "nombre", "apellido"],
        include: {
            model: Rol,
            where: { nombre: "barbero" },
            attributes: [],
            through: { attributes: [] },
        },
        order: [["id", "ASC"]],
    });
}

// GET /barberos — público
async function listarPublico(req, res) {
    try {
        const barberos = await buscarBarberosActivos();
        res.json(barberos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al listar barberos" });
    }
}

module.exports = { buscarBarberosActivos, listarPublico };
