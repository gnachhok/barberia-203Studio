const express = require("express");
const router = express.Router();

const {
    listar: listarServicios,
    asociar,
    desasociar,
} = require("../controllers/barberoServicioController");

const {
    listar: listarHorarios,
    crear: crearHorario,
    actualizar: actualizarHorario,
    eliminar: eliminarHorario,
} = require("../controllers/horarioController");

const {
    listar: listarBloqueos,
    crear: crearBloqueo,
    eliminar: eliminarBloqueo,
} = require("../controllers/bloqueoController");

const authMiddleware = require("../middlewares/authMiddleware");
const verificarRol = require("../middlewares/rolMiddleware");

// --- Servicios del barbero ---
router.get("/:id/servicios", listarServicios);
router.post("/:id/servicios", authMiddleware, verificarRol(["admin", "barbero"]), asociar);
router.delete("/:id/servicios/:servicioId", authMiddleware, verificarRol(["admin", "barbero"]), desasociar);

// --- Horarios del barbero ---
router.get("/:id/horarios", listarHorarios);
router.post("/:id/horarios", authMiddleware, verificarRol(["admin", "barbero"]), crearHorario);
router.put("/:id/horarios/:horarioId", authMiddleware, verificarRol(["admin", "barbero"]), actualizarHorario);
router.delete("/:id/horarios/:horarioId", authMiddleware, verificarRol(["admin", "barbero"]), eliminarHorario);

// --- Bloqueos del barbero ---
router.get("/:id/bloqueos", listarBloqueos);
router.post("/:id/bloqueos", authMiddleware, verificarRol(["admin", "barbero"]), crearBloqueo);
router.delete("/:id/bloqueos/:bloqueoId", authMiddleware, verificarRol(["admin", "barbero"]), eliminarBloqueo);

module.exports = router;