const express = require("express");
const router = express.Router();
const { registro, login } = require("../controllers/authController");

router.post("/registro", registro);
router.post("/login", login);


const authMiddleware = require("../middlewares/authMiddleware");
const verificarRol = require("../middlewares/rolMiddleware");

module.exports = router;