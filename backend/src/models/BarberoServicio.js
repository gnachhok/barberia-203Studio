const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BarberoServicio = sequelize.define(
    "BarberoServicio",
    {
        precio_personalizado: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true, // si es null, se usa el precio de lista del servicio
        },
    },
    {
        tableName: "barbero_servicio",
        timestamps: false,
    }
);

module.exports = BarberoServicio;