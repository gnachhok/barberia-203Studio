const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Pago = sequelize.define(
    "Pago",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        monto: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        metodo_pago: {
            type: DataTypes.ENUM("efectivo", "transferencia", "tarjeta"),
            allowNull: false,
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        anulado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        motivo_anulacion: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "pagos",
        timestamps: false,
    }
);

module.exports = Pago;