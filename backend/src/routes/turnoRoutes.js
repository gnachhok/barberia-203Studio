const express = require("express");
const router = express.Router();
const { cargarTurnoPropio } = require("../middlewares/duenioMiddleware");

const {
    crear,
    listar,
    reprogramar,
    cancelar,
    completar,
    ausente,
} = require("../controllers/turnoController");

const authMiddleware = require("../middlewares/authMiddleware");
const verificarRol = require("../middlewares/rolMiddleware");

// Todas requieren estar logueado como mínimo
router.get("/", authMiddleware, listar);
router.post("/", authMiddleware, crear);
router.put("/:id", authMiddleware, cargarTurnoPropio, reprogramar);
router.patch("/:id/cancelar", authMiddleware, cargarTurnoPropio, cancelar);
router.patch("/:id/completar", authMiddleware, verificarRol(["admin", "barbero"]), cargarTurnoPropio, completar);
router.patch("/:id/ausente", authMiddleware, verificarRol(["admin", "barbero"]), cargarTurnoPropio, ausente);

module.exports = router;