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

const { listarPublico, agendaDelDia } = require("../controllers/barberoController");

const authMiddleware = require("../middlewares/authMiddleware");
const verificarRol = require("../middlewares/rolMiddleware");
const { soloSuAgenda } = require("../middlewares/duenioMiddleware");

// --- Listado público (id, nombre, apellido) ---
router.get("/", listarPublico);

// --- Agenda del día para el panel (horario + huecos para cargar a mano) ---
router.get("/:id/dia", authMiddleware, verificarRol(["admin", "barbero"]), soloSuAgenda, agendaDelDia);

// --- Servicios del barbero ---
router.get("/:id/servicios", listarServicios);
router.post("/:id/servicios", authMiddleware, verificarRol(["admin", "barbero"]), soloSuAgenda, asociar);
router.delete("/:id/servicios/:servicioId", authMiddleware, verificarRol(["admin", "barbero"]), soloSuAgenda, desasociar);

// --- Horarios del barbero ---
router.get("/:id/horarios", listarHorarios);
router.post("/:id/horarios", authMiddleware, verificarRol(["admin", "barbero"]), soloSuAgenda, crearHorario);
router.put("/:id/horarios/:horarioId", authMiddleware, verificarRol(["admin", "barbero"]), soloSuAgenda, actualizarHorario);
router.delete("/:id/horarios/:horarioId", authMiddleware, verificarRol(["admin", "barbero"]), soloSuAgenda, eliminarHorario);

// --- Bloqueos del barbero ---
router.get("/:id/bloqueos", listarBloqueos);
router.post("/:id/bloqueos", authMiddleware, verificarRol(["admin", "barbero"]), soloSuAgenda, crearBloqueo);
router.delete("/:id/bloqueos/:bloqueoId", authMiddleware, verificarRol(["admin", "barbero"]), soloSuAgenda, eliminarBloqueo);

module.exports = router;