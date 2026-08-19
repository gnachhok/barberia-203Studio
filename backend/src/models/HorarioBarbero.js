const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HorarioBarbero = sequelize.define(
    "HorarioBarbero",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        dia_semana: {
            type: DataTypes.INTEGER, // 0 = domingo, 1 = lunes, ..., 6 = sábado
            allowNull: false,
            validate: { min: 0, max: 6 },
        },
        hora_inicio: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        hora_fin: {
            type: DataTypes.TIME,
            allowNull: false,
        },
    },
    {
        tableName: "horarios_barbero",
        timestamps: false,
    }
);

module.exports = HorarioBarbero;