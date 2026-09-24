const bcrypt = require("bcryptjs");
const { Usuario, Rol } = require("../models");
const { generarToken } = require("../utils/jwt");

// POST /auth/registro
async function registro(req, res) {
    try {
        const { nombre, apellido, email, password, telefono } = req.body;

        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        // El frontend ya lo valida, pero eso es solo comodidad: cualquiera puede
        // llamar a la API directo (Bruno, curl) y saltearse el formulario.
        if (password.length < 8) {
            return res.status(400).json({ error: "La contraseña tiene que tener al menos 8 caracteres" });
        }

        const existente = await Usuario.findOne({ where: { email } });
        if (existente) {
            return res.status(409).json({ error: "Ya existe un usuario con ese email" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const usuario = await Usuario.create({
            nombre,
            apellido,
            email,
            password: passwordHash,
            telefono,
        });

        // Por defecto, todo el que se registra online es "cliente"
        const rolCliente = await Rol.findOne({ where: { nombre: "cliente" } });
        await usuario.addRol(rolCliente);

        const token = generarToken({ id: usuario.id, email: usuario.email, roles: ["cliente"] });

        res.status(201).json({
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                roles: ["cliente"],
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
}

// POST /auth/login
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña requeridos" });
        }

        const usuario = await Usuario.findOne({
            where: { email },
            include: { model: Rol },
        });

        if (!usuario) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const roles = usuario.Rols.map((r) => r.nombre);

        const token = generarToken({ id: usuario.id, email: usuario.email, roles });

        res.json({
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                roles,
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
}

module.exports = { registro, login };