const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BloqueoHorario = sequelize.define(
    "BloqueoHorario",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fecha_inicio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_fin: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        motivo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "bloqueos_horario",
        timestamps: false,
    }
);

module.exports = BloqueoHorario;