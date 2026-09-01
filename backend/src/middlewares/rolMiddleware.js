function verificarRol(rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ error: "No autenticado" });
        }

        const tieneRol = req.usuario.roles.some((rol) =>
            rolesPermitidos.includes(rol)
        );

        if (!tieneRol) {
            return res.status(403).json({ error: "No tenés permisos para esta acción" });
        }

        next();
    };
}

module.exports = verificarRol;