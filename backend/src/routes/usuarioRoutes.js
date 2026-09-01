const express = require("express");
const router = express.Router();

const {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
} = require("../controllers/usuarioController");

const authMiddleware = require("../middlewares/authMiddleware");
const verificarRol = require("../middlewares/rolMiddleware");

// Todas estas rutas son solo para admin
router.get("/", authMiddleware, verificarRol(["admin"]), listar);
router.get("/:id", authMiddleware, verificarRol(["admin"]), obtenerPorId);
router.post("/", authMiddleware, verificarRol(["admin"]), crear);
router.put("/:id", authMiddleware, verificarRol(["admin"]), actualizar);
router.delete("/:id", authMiddleware, verificarRol(["admin"]), eliminar);

module.exports = router;