const { Pago, Gasto, Turno, Usuario, Servicio } = require("../models");
const { Op, fn, col, literal } = require("sequelize");
const { fechaLocal } = require("../utils/agenda");

// GET /reportes/ingresos?desde=&hasta=&barbero_id=&agrupar_por=servicio|dia|barbero
async function ingresos(req, res) {
    try {
        const { desde, hasta, barbero_id, agrupar_por } = req.query;

        const wherePago = { anulado: false };
        if (desde && hasta) {
            wherePago.fecha = { [Op.between]: [desde, hasta] };
        }

        const whereTurno = {};
        if (barbero_id) whereTurno.barbero_id = barbero_id;

        let groupField;
        let include = [{ model: Turno, where: whereTurno, attributes: [] }];

        if (agrupar_por === "servicio") {
            groupField = "Turno.servicio_id";
            include[0].include = [{ model: Servicio, attributes: ["nombre"] }];
        } else if (agrupar_por === "barbero") {
            groupField = "Turno.barbero_id";
            include[0].include = [{ model: Usuario, as: "barbero", attributes: ["nombre", "apellido"] }];
        } else {
            groupField = "fecha"; // agrupado por día, default
        }

        const resultado = await Pago.findAll({
            where: wherePago,
            include,
            attributes: [
                [fn("SUM", col("monto")), "total"],
                [fn("COUNT", col("Pago.id")), "cantidad"],
            ],
            group: [groupField],
            raw: true,
        });

        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar reporte de ingresos" });
    }
}

// GET /reportes/gastos?desde=&hasta=&categoria=
async function gastos(req, res) {
    try {
        const { desde, hasta, categoria } = req.query;

        const where = {};
        if (desde && hasta) where.fecha = { [Op.between]: [desde, hasta] };
        if (categoria) where.categoria = categoria;

        const total = await Gasto.sum("monto", { where });
        const detalle = await Gasto.findAll({ where, order: [["fecha", "DESC"]] });

        res.json({ total: total || 0, detalle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar reporte de gastos" });
    }
}

// GET /reportes/balance?desde=&hasta=
async function balance(req, res) {
    try {
        const { desde, hasta } = req.query;

        const wherePago = { anulado: false };
        const whereGasto = {};
        if (desde && hasta) {
            wherePago.fecha = { [Op.between]: [desde, hasta] };
            whereGasto.fecha = { [Op.between]: [desde, hasta] };
        }

        const totalIngresos = (await Pago.sum("monto", { where: wherePago })) || 0;
        const totalGastos = (await Gasto.sum("monto", { where: whereGasto })) || 0;

        res.json({
            ingresos: totalIngresos,
            gastos: totalGastos,
            balance: totalIngresos - totalGastos,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar balance" });
    }
}

// ---------- Resumen del mes (pantalla "Números" del panel) ----------
// Todo lo que muestra la pantalla sale de un solo pedido. Cada bloque es una consulta
// agrupada (COUNT / SUM ... GROUP BY): la base hace las cuentas y viajan pocas filas,
// en vez de traer cientos de turnos para contarlos en el navegador.

const DIAS_SIN_VENIR = 45;

// "2026-09" → { desde: "2026-09-01", hasta: "2026-09-30" }
function rangoDelMes(mes) {
    const [y, m] = mes.split("-").map(Number);
    const ultimo = new Date(y, m, 0).getDate(); // día 0 del mes siguiente = último de este
    return { desde: `${mes}-01`, hasta: `${mes}-${String(ultimo).padStart(2, "0")}` };
}

function mesAnterior(mes) {
    const [y, m] = mes.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Cantidad de turnos por estado + lo cobrado (pagos no anulados) en un rango.
// Se usa para el mes elegido y para el anterior (las flechitas ▲▼).
async function totalesDelRango({ desde, hasta }, whereBarbero) {
    const whereTurno = { fecha: { [Op.between]: [desde, hasta] }, ...whereBarbero };

    const porEstado = await Turno.findAll({
        where: whereTurno,
        attributes: ["estado", [fn("COUNT", col("id")), "n"]],
        group: ["estado"],
        raw: true,
    });
    const porMetodo = await Pago.findAll({
        where: { anulado: false },
        include: [{ model: Turno, where: whereTurno, attributes: [] }],
        attributes: ["metodo_pago", [fn("SUM", col("Pago.monto")), "total"]],
        group: ["metodo_pago"],
        raw: true,
    });

    const estados = { confirmado: 0, completado: 0, cancelado: 0, ausente: 0 };
    for (const f of porEstado) estados[f.estado] = Number(f.n);
    const metodos = {};
    for (const f of porMetodo) metodos[f.metodo_pago] = Number(f.total);
    const ingresos = Object.values(metodos).reduce((a, b) => a + b, 0);

    return { estados, metodos, ingresos };
}

// GET /reportes/resumen?mes=2026-09&barbero_id=
// Admin: de todos o de un barbero. Barbero sin admin: siempre los suyos, sin balance ni comparación.
async function resumen(req, res) {
    try {
        const { mes, barbero_id } = req.query;
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes || "")) {
            return res.status(400).json({ error: "Mandá el mes como YYYY-MM" });
        }

        const esAdmin = req.usuario.roles.includes("admin");
        // Un barbero que no es admin no puede pedir los números de otro: se ignora lo que mande
        const barberoId = esAdmin ? (barbero_id ? Number(barbero_id) : null) : req.usuario.id;
        const whereBarbero = barberoId ? { barbero_id: barberoId } : {};
        const vistaDelLocal = esAdmin && !barberoId; // "Los dos": suma comparación y balance

        const rango = rangoDelMes(mes);
        const whereHechos = { fecha: { [Op.between]: [rango.desde, rango.hasta] }, estado: "completado", ...whereBarbero };

        const actual = await totalesDelRango(rango, whereBarbero);
        const anterior = await totalesDelRango(rangoDelMes(mesAnterior(mes)), whereBarbero);

        // Día por día (turnos hechos)
        const porDia = await Turno.findAll({
            where: whereHechos,
            attributes: ["fecha", [fn("COUNT", col("id")), "n"]],
            group: ["fecha"],
            raw: true,
        });

        // Servicios: se agrupa por Servicio.id (la clave primaria) para que MySQL
        // acepte pedir también el nombre (ONLY_FULL_GROUP_BY)
        const porServicio = await Turno.findAll({
            where: whereHechos,
            include: [{ model: Servicio, attributes: ["nombre"] }],
            attributes: [[fn("COUNT", col("Turno.id")), "n"], [fn("SUM", col("precio_final")), "total"]],
            group: ["Servicio.id"],
            order: [[fn("COUNT", col("Turno.id")), "DESC"]],
            raw: true,
        });

        // Horas pico: día de la semana × hora de inicio. DAYOFWEEK de MySQL: 1 = domingo.
        const porHora = await Turno.findAll({
            where: whereHechos,
            attributes: [
                [fn("DAYOFWEEK", col("fecha")), "dia"],
                [fn("HOUR", col("hora_inicio")), "hora"],
                [fn("COUNT", col("id")), "n"],
            ],
            group: ["dia", "hora"],
            raw: true,
        });

        // Clientes que más vinieron en el mes (solo los que tienen cuenta: los "a mano" no se pueden identificar)
        const frecuentes = await Turno.findAll({
            where: { ...whereHechos, cliente_id: { [Op.ne]: null } },
            include: [{ model: Usuario, as: "cliente", attributes: ["nombre", "apellido"] }],
            attributes: [[fn("COUNT", col("Turno.id")), "veces"]],
            group: ["cliente.id"],
            order: [[fn("COUNT", col("Turno.id")), "DESC"]],
            limit: 5,
            raw: true,
        });

        // Clientes que hace más de 45 días que no vienen, contando desde HOY (no depende del mes elegido).
        // MAX(fecha) = su última visita; HAVING filtra después de agrupar (WHERE no puede usar el MAX).
        const hoy = fechaLocal(new Date());
        const limite = fechaLocal(new Date(Date.now() - DIAS_SIN_VENIR * 86400000));
        const ultimas = await Turno.findAll({
            where: { estado: "completado", cliente_id: { [Op.ne]: null }, ...whereBarbero },
            include: [{ model: Usuario, as: "cliente", attributes: ["id", "nombre", "apellido", "telefono"] }],
            attributes: [[fn("MAX", col("fecha")), "ultima"]],
            group: ["cliente.id"],
            having: literal(`MAX(fecha) < '${limite}'`),
            order: [[fn("MAX", col("fecha")), "DESC"]],
            limit: 20,
            raw: true,
        });
        // Si ya sacaron un turno para adelante, no están "perdidos": se sacan de la lista
        const conTurnoFuturo = await Turno.findAll({
            where: { estado: "confirmado", fecha: { [Op.gte]: hoy }, cliente_id: { [Op.ne]: null } },
            attributes: ["cliente_id"],
            group: ["cliente_id"],
            raw: true,
        });
        const vuelven = new Set(conTurnoFuturo.map((t) => t.cliente_id));
        const sinVenir = ultimas.filter((c) => !vuelven.has(c["cliente.id"])).slice(0, 5);

        const respuesta = {
            mes,
            barbero_id: barberoId,
            actual,
            anterior,
            porDia: porDia.map((f) => ({ fecha: f.fecha, n: Number(f.n) })),
            porServicio: porServicio.map((f) => ({ nombre: f["Servicio.nombre"], n: Number(f.n), total: Number(f.total) })),
            porHora: porHora.map((f) => ({ dia: Number(f.dia) - 1, hora: Number(f.hora), n: Number(f.n) })), // 0 = domingo, como getDay()
            frecuentes: frecuentes.map((f) => ({ nombre: f["cliente.nombre"], apellido: f["cliente.apellido"], veces: Number(f.veces) })),
            sinVenir: sinVenir.map((f) => ({
                nombre: f["cliente.nombre"], apellido: f["cliente.apellido"], telefono: f["cliente.telefono"], ultima: f.ultima,
            })),
            diasSinVenir: DIAS_SIN_VENIR,
        };

        if (vistaDelLocal) {
            // Nicolás vs Valentín
            const porBarbero = await Turno.findAll({
                where: whereHechos,
                include: [{ model: Usuario, as: "barbero", attributes: ["nombre", "apellido"] }],
                attributes: [[fn("COUNT", col("Turno.id")), "n"], [fn("SUM", col("precio_final")), "total"]],
                group: ["barbero.id"],
                raw: true,
            });
            respuesta.porBarbero = porBarbero.map((f) => ({ nombre: f["barbero.nombre"], n: Number(f.n), total: Number(f.total) }));

            // Balance: gastos del mes por categoría
            const gastos = await Gasto.findAll({
                where: { fecha: { [Op.between]: [rango.desde, rango.hasta] } },
                attributes: ["categoria", [fn("SUM", col("monto")), "total"]],
                group: ["categoria"],
                raw: true,
            });
            respuesta.gastos = gastos.map((g) => ({ categoria: g.categoria || "Otros", total: Number(g.total) }));
        }

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar el resumen" });
    }
}

module.exports = { ingresos, gastos, balance, resumen };