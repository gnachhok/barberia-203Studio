const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./models");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ mensaje: "API de 203 studio funcionando" });
});

const PORT = process.env.PORT || 3000;

sequelize
    .authenticate()
    .then(() => {
        console.log("✅ Conexión a MySQL establecida correctamente");
        return sequelize.sync(); // crea las tablas según los modelos, si no existen
    })
    .then(() => {
        console.log("✅ Modelos sincronizados con la base de datos");
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Error al iniciar el servidor:", err);
    });