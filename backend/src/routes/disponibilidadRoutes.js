const express = require("express");
const router = express.Router();
const { calcularDisponibilidad } = require("../controllers/disponibilidadController");

router.get("/", calcularDisponibilidad);

module.exports = router;