const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Turno = sequelize.define(
    "Turno",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cliente_nombre: {
            type: DataTypes.STRING,
            allowNull: true, // se usa solo si el turno fue cargado manual por el barbero
        },
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        hora_inicio: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        hora_fin: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        estado: {
            type: DataTypes.ENUM(
                "confirmado",
                "completado",
                "cancelado",
                "ausente"
            ),
            defaultValue: "confirmado",
        },
        precio_final: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true, // se completa cuando el turno pasa a "completado"
        },
        notas: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        creado_por: {
            type: DataTypes.ENUM("cliente", "barbero"),
            allowNull: false,
            defaultValue: "cliente",
        },
    },
    {
        tableName: "turnos",
        timestamps: true, // createdAt nos sirve como "fecha_creacion"
    }
);

module.exports = Turno;