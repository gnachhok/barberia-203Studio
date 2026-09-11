const express = require("express");
const router = express.Router();

const {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
} = require("../controllers/servicioController");

const authMiddleware = require("../middlewares/authMiddleware");
const verificarRol = require("../middlewares/rolMiddleware");

// Públicas
router.get("/", listar);
router.get("/:id", obtenerPorId);

// Solo admin
router.post("/", authMiddleware, verificarRol(["admin"]), crear);
router.put("/:id", authMiddleware, verificarRol(["admin"]), actualizar);
router.delete("/:id", authMiddleware, verificarRol(["admin"]), eliminar);

module.exports = router;