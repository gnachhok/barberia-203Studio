const express = require("express");
const router = express.Router();

const {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    obtenerMiPerfil,
    actualizarMiPerfil,
} = require("../controllers/usuarioController");

const authMiddleware = require("../middlewares/authMiddleware");
const verificarRol = require("../middlewares/rolMiddleware");

// Perfil propio: cualquier usuario logueado.
// IMPORTANTE: van ANTES de "/:id". Express usa la primera ruta que coincide,
// y "/:id" también coincide con "/me" (tomaría "me" como id y pediría ser admin).
router.get("/me", authMiddleware, obtenerMiPerfil);
router.put("/me", authMiddleware, actualizarMiPerfil);

// Solo admin
router.get("/", authMiddleware, verificarRol(["admin"]), listar);
router.get("/:id", authMiddleware, verificarRol(["admin"]), obtenerPorId);
router.post("/", authMiddleware, verificarRol(["admin"]), crear);
router.put("/:id", authMiddleware, verificarRol(["admin"]), actualizar);
router.delete("/:id", authMiddleware, verificarRol(["admin"]), eliminar);

module.exports = router;
