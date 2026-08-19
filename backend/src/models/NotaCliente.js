const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NotaCliente = sequelize.define(
    "NotaCliente",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nota: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: "notas_cliente",
        timestamps: true,
    }
);

module.exports = NotaCliente;