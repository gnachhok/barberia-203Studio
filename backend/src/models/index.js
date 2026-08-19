const sequelize = require("../config/database");

const Usuario = require("./Usuario");
const Rol = require("./Rol");
const Servicio = require("./Servicio");
const BarberoServicio = require("./BarberoServicio");
const HorarioBarbero = require("./HorarioBarbero");
const BloqueoHorario = require("./BloqueoHorario");
const Turno = require("./Turno");
const Pago = require("./Pago");
const Gasto = require("./Gasto");
const NotaCliente = require("./NotaCliente");

// --- Usuario <-> Rol (N-N) ---
Usuario.belongsToMany(Rol, { through: "usuario_rol", timestamps: false });
Rol.belongsToMany(Usuario, { through: "usuario_rol", timestamps: false });

// --- Usuario (barbero) <-> Servicio (N-N, con precio_personalizado) ---
Usuario.belongsToMany(Servicio, {
    through: BarberoServicio,
    as: "servicios",
    foreignKey: "barbero_id",
});
Servicio.belongsToMany(Usuario, {
    through: BarberoServicio,
    as: "barberos",
    foreignKey: "servicio_id",
});

// --- Usuario (barbero) -> HorarioBarbero (1-N) ---
Usuario.hasMany(HorarioBarbero, { as: "horarios", foreignKey: "barbero_id" });
HorarioBarbero.belongsTo(Usuario, { as: "barbero", foreignKey: "barbero_id" });

// --- Usuario (barbero) -> BloqueoHorario (1-N) ---
Usuario.hasMany(BloqueoHorario, { as: "bloqueos", foreignKey: "barbero_id" });
BloqueoHorario.belongsTo(Usuario, { as: "barbero", foreignKey: "barbero_id" });

// --- Turno: cliente, barbero, servicio ---
Usuario.hasMany(Turno, { as: "turnosComoCliente", foreignKey: "cliente_id" });
Turno.belongsTo(Usuario, { as: "cliente", foreignKey: "cliente_id" }); // nullable (turno manual)

Usuario.hasMany(Turno, { as: "turnosComoBarbero", foreignKey: "barbero_id" });
Turno.belongsTo(Usuario, { as: "barbero", foreignKey: "barbero_id" });

Servicio.hasMany(Turno, { foreignKey: "servicio_id" });
Turno.belongsTo(Servicio, { foreignKey: "servicio_id" });

// --- Turno -> Pago (1-N, aunque en la práctica va a ser casi siempre 1-1) ---
Turno.hasMany(Pago, { foreignKey: "turno_id" });
Pago.belongsTo(Turno, { foreignKey: "turno_id" });

// --- Gasto (barbero_id nullable = gasto general del local) ---
Usuario.hasMany(Gasto, { foreignKey: "barbero_id" });
Gasto.belongsTo(Usuario, { as: "barbero", foreignKey: "barbero_id" });

// --- NotaCliente: cliente + barbero que la escribió ---
Usuario.hasMany(NotaCliente, {
    as: "notasComoCliente",
    foreignKey: "cliente_id",
});
NotaCliente.belongsTo(Usuario, { as: "cliente", foreignKey: "cliente_id" });

Usuario.hasMany(NotaCliente, {
    as: "notasEscritas",
    foreignKey: "barbero_id",
});
NotaCliente.belongsTo(Usuario, { as: "barbero", foreignKey: "barbero_id" });

module.exports = {
    sequelize,
    Usuario,
    Rol,
    Servicio,
    BarberoServicio,
    HorarioBarbero,
    BloqueoHorario,
    Turno,
    Pago,
    Gasto,
    NotaCliente,
};