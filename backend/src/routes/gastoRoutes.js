const express = require("express");
const router = express.Router();

const { listar, crear, actualizar, eliminar } = require("../controllers/gastoController");

const authMiddleware = require("../middlewares/authMiddleware");
const verificarRol = require("../middlewares/rolMiddleware");

// Todo protegido — solo admin ve/gestiona gastos
router.get("/", authMiddleware, verificarRol(["admin"]), listar);
router.post("/", authMiddleware, verificarRol(["admin"]), crear);
router.put("/:id", authMiddleware, verificarRol(["admin"]), actualizar);
router.delete("/:id", authMiddleware, verificarRol(["admin"]), eliminar);

module.exports = router;