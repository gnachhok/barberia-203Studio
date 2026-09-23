const express = require("express");
const router = express.Router();

const { listar, crear, actualizar, eliminar } = require("../controllers/notaController");

const authMiddleware = require("../middlewares/authMiddleware");
const verificarRol = require("../middlewares/rolMiddleware");

router.get("/clientes/:id/notas", authMiddleware, verificarRol(["admin", "barbero"]), listar);
router.post("/clientes/:id/notas", authMiddleware, verificarRol(["admin", "barbero"]), crear);
router.put("/notas/:id", authMiddleware, verificarRol(["admin", "barbero"]), actualizar);
router.delete("/notas/:id", authMiddleware, verificarRol(["admin", "barbero"]), eliminar);

module.exports = router;