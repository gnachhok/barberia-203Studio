const { Rol } = require("../models");

async function seedRoles() {
    const roles = ["cliente", "barbero", "admin"];

    for (const nombre of roles) {
        await Rol.findOrCreate({
            where: { nombre },
        });
    }

    console.log("✅ Roles verificados/creados:", roles.join(", "));
}

module.exports = seedRoles;