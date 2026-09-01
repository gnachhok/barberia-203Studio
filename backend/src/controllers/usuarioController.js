const bcrypt = require("bcryptjs");
const { Usuario, Rol } = require("../models");

// GET /usuarios (admin) — lista todos los usuarios, opcionalmente filtrados por rol
async function listar(req, res) {
    try {
        const { rol } = req.query;

        const opciones = {
            include: { model: Rol, ...(rol ? { where: { nombre: rol } } : {}) },
            attributes: { exclude: ["password"] },
        };

        const usuarios = await Usuario.findAll(opciones);
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al listar usuarios" });
    }
}

// GET /usuarios/:id (admin)
async function obtenerPorId(req, res) {
    try {
        const usuario = await Usuario.findByPk(req.params.id, {
            include: { model: Rol },
            attributes: { exclude: ["password"] },
        });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener usuario" });
    }
}

// POST /usuarios (admin) — alta de un barbero nuevo
async function crear(req, res) {
    try {
        const { nombre, apellido, email, password, telefono, roles } = req.body;

        if (!nombre || !apellido || !email || !password || !roles?.length) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
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

        const rolesEncontrados = await Rol.findAll({ where: { nombre: roles } });
        await usuario.addRols(rolesEncontrados);

        res.status(201).json({ mensaje: "Usuario creado correctamente", id: usuario.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear usuario" });
    }
}

// PUT /usuarios/:id (admin)
async function actualizar(req, res) {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const { nombre, apellido, telefono } = req.body;
        await usuario.update({ nombre, apellido, telefono });

        res.json({ mensaje: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
}

async function eliminar(req, res) {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        await usuario.update({ activo: false });
        res.json({ mensaje: "Usuario desactivado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al desactivar usuario" });
    }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };