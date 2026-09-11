const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const seedRoles = require("./seeders/rolesSeed")
const usuarioRoutes = require("./routes/usuarioRoutes");
const servicioRoutes = require("./routes/servicioRoutes");
const barberoRoutes = require("./routes/barberoRoutes");
const disponibilidadRoutes = require("./routes/disponibilidadRoutes");
const turnoRoutes = require("./routes/turnoRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/servicios", servicioRoutes);
app.use("/barberos", barberoRoutes);
app.use("/disponibilidad", disponibilidadRoutes);
app.use("/turnos", turnoRoutes);

app.get("/", (req, res) => {
    res.json({ mensaje: "API de 203 studio funcionando" });
});

const PORT = process.env.PORT || 3000;
;

sequelize
    .authenticate()
    .then(() => {
        console.log("✅ Conexión a MySQL establecida correctamente");
        return sequelize.sync();
    })
    .then(() => {
        console.log("✅ Modelos sincronizados con la base de datos");
        return seedRoles();
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    })