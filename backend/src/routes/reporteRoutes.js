const express = require("express");
const router = express.Router();

const { ingresos, gastos, balance } = require("../controllers/reporteController");

const authMiddleware = require("../middlewares/authMiddleware");
const verificarRol = require("../middlewares/rolMiddleware");

router.get("/ingresos", authMiddleware, verificarRol(["admin"]), ingresos);
router.get("/gastos", authMiddleware, verificarRol(["admin"]), gastos);
router.get("/balance", authMiddleware, verificarRol(["admin"]), balance);

module.exports = router;