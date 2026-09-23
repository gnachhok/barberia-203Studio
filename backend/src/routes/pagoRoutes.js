const express = require("express");
const router = express.Router();

const { listar, obtenerPorId, anular } = require("../controllers/pagoController");

const authMiddleware = require("../middlewares/authMiddleware");
const verificarRol = require("../middlewares/rolMiddleware");

router.get("/", authMiddleware, verificarRol(["admin"]), listar);
router.get("/:id", authMiddleware, verificarRol(["admin"]), obtenerPorId);
router.patch("/:id/anular", authMiddleware, verificarRol(["admin"]), anular);

module.exports = router;