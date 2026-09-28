const express = require("express");
const router = express.Router();

const { ingresos, gastos, balance, resumen } = require("../controllers/reporteController");

const authMiddleware = require("../middlewares/authMiddleware");
const verificarRol = require("../middlewares/rolMiddleware");

router.get("/ingresos", authMiddleware, verificarRol(["admin"]), ingresos);
router.get("/gastos", authMiddleware, verificarRol(["admin"]), gastos);
router.get("/balance", authMiddleware, verificarRol(["admin"]), balance);
// El barbero también entra: el controller le limita los datos a los suyos
router.get("/resumen", authMiddleware, verificarRol(["admin", "barbero"]), resumen);

module.exports = router;