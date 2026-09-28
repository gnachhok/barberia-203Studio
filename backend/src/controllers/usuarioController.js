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

// PUT /usuarios/:id/roles (admin) — reemplaza los roles: { roles: ["barbero", "admin"] }
// Ojo: los roles viajan en el token, así que el usuario los ve recién al volver a iniciar sesión.
async function actualizarRoles(req, res) {
    try {
        const { roles } = req.body;
        if (!Array.isArray(roles) || roles.length === 0) {
            return res.status(400).json({ error: "Mandá al menos un rol" });
        }

        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Un admin no puede sacarse el admin a sí mismo: si es el único, nadie podría devolvérselo
        if (usuario.id === req.usuario.id && !roles.includes("admin")) {
            return res.status(400).json({ error: "No podés quitarte el rol de admin a vos mismo" });
        }

        const rolesEncontrados = await Rol.findAll({ where: { nombre: roles } });
        if (rolesEncontrados.length !== new Set(roles).size) {
            return res.status(400).json({ error: "Algún rol no existe" });
        }

        // setRols (lo genera Sequelize por el belongsToMany) borra los de antes y deja solo estos
        await usuario.setRols(rolesEncontrados);
        res.json({ mensaje: "Roles actualizados", roles: rolesEncontrados.map((r) => r.nombre) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar los roles" });
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

// ---------- Perfil propio (cualquier usuario logueado) ----------
// No hay :id en la URL: el id sale SIEMPRE del token, así nadie puede editar a otro.

// GET /usuarios/me
async function obtenerMiPerfil(req, res) {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id, {
            attributes: ["id", "nombre", "apellido", "email", "telefono"],
        });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener el perfil" });
    }
}

// PUT /usuarios/me — nombre, apellido, teléfono y (opcional) contraseña.
// El email no se cambia desde acá: es con lo que se inicia sesión y tiene que ser único.
async function actualizarMiPerfil(req, res) {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const { nombre, apellido, telefono, password_actual, password_nueva } = req.body;
        if (!nombre?.trim() || !apellido?.trim()) {
            return res.status(400).json({ error: "Nombre y apellido son obligatorios" });
        }

        const cambios = { nombre: nombre.trim(), apellido: apellido.trim(), telefono: telefono?.trim() || null };

        // Para cambiar la contraseña hay que confirmar la actual: si alguien agarra
        // el celular con la sesión abierta, no puede cambiarla y dejarte afuera.
        if (password_nueva) {
            const actualOk = password_actual && (await bcrypt.compare(password_actual, usuario.password));
            if (!actualOk) {
                return res.status(400).json({ error: "La contraseña actual no es correcta" });
            }
            if (password_nueva.length < 8) {
                return res.status(400).json({ error: "La contraseña nueva tiene que tener al menos 8 caracteres" });
            }
            cambios.password = await bcrypt.hash(password_nueva, 10);
        }

        await usuario.update(cambios);
        res.json({
            usuario: { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, telefono: usuario.telefono },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el perfil" });
    }
}

module.exports = { listar, obtenerPorId, crear, actualizar, actualizarRoles, eliminar, obtenerMiPerfil, actualizarMiPerfil };