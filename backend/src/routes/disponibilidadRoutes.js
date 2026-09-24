const express = require("express");
const router = express.Router();
const {
    calcularDisponibilidad,
    disponibilidadDia,
    disponibilidadMes,
} = require("../controllers/disponibilidadController");

// Todas públicas: se puede mirar la agenda sin estar logueado
router.get("/", calcularDisponibilidad);
router.get("/dia", disponibilidadDia);
router.get("/mes", disponibilidadMes);

module.exports = router;
