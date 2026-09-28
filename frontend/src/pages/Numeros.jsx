import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { esAdmin } from "../utils/roles";
import PanelEncabezado from "../components/panel/PanelEncabezado";
import { DefsTexturas } from "../components/numeros/Texturas";
import { mesIso, nombreMes, sumarMeses } from "../components/numeros/numerosUtils";
import Kpis from "../components/numeros/Kpis";
import Torta from "../components/numeros/Torta";
import Servicios from "../components/numeros/Servicios";
import DiaPorDia from "../components/numeros/DiaPorDia";
import HorasPico from "../components/numeros/HorasPico";
import Clientes from "../components/numeros/Clientes";
import Comparativa from "../components/numeros/Comparativa";
import Balance from "../components/numeros/Balance";

// Números del mes. Todo sale de un solo pedido (GET /reportes/resumen).
// El admin elige "Los dos" o un barbero; un barbero sin admin ve solo lo suyo
// (y el backend se lo garantiza aunque toque la URL).
export default function Numeros() {
  const { usuario } = useAuth();
  const admin = esAdmin(usuario);
  const mesActual = mesIso(new Date());

  const [mes, setMes] = useState(mesActual);
  const [quien, setQuien] = useState(null); // null = todo el local
  const barberos = useApi(admin ? "/barberos" : null);
  const resumen = useApi(`/reportes/resumen?mes=${mes}${admin && quien ? `&barbero_id=${quien}` : ""}`);
  const d = resumen.data;

  const opciones = barberos.data
    ? [{ id: null, nombre: barberos.data.length === 2 ? "Los dos" : "Todos" }, ...barberos.data.map((b) => ({ id: b.id, nombre: b.nombre }))]
    : [];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <DefsTexturas />
      <div className="mx-auto max-w-[980px] pb-12">
        <PanelEncabezado />

        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          {opciones.length > 0 && (
            <div className="label inline-flex border-2 border-ink text-[11px]!" role="group" aria-label="De quién">
              {opciones.map((o) => (
                <button key={o.id ?? "todos"} onClick={() => setQuien(o.id)} aria-pressed={quien === o.id}
                  className={`px-3 py-2 ${quien === o.id ? "bg-ink text-paper" : ""}`}>
                  {o.nombre}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button onClick={() => setMes(sumarMeses(mes, -1))} aria-label="Mes anterior" className="label border-2 border-ink px-3 py-1.5">←</button>
            <span className="display min-w-[190px] text-center text-[26px]">{nombreMes(mes)}</span>
            {/* No hay números del futuro */}
            <button onClick={() => setMes(sumarMeses(mes, 1))} disabled={mes >= mesActual} aria-label="Mes siguiente"
              className="label border-2 border-ink px-3 py-1.5 disabled:opacity-25">→</button>
          </div>
        </div>

        {resumen.cargando && <p className="label px-4 py-10 text-center text-ink-mute">Sacando cuentas…</p>}
        {resumen.error && (
          <p role="alert" className="mx-4 flex flex-wrap items-center gap-3 border border-ink/20 px-4 py-3 text-ink-mute">
            {resumen.error}
            <button onClick={resumen.recargar} className="label border-b text-ink">Reintentar</button>
          </p>
        )}

        {d && (
          <div className="grid gap-4 px-4 md:grid-cols-2">
            <Kpis actual={d.actual} anterior={d.anterior} />
            <Torta estados={d.actual.estados} />
            <Servicios servicios={d.porServicio} metodos={d.actual.metodos} />
            <DiaPorDia mes={mes} porDia={d.porDia} barberoId={d.barbero_id} />
            <HorasPico porHora={d.porHora} />
            <Clientes frecuentes={d.frecuentes} sinVenir={d.sinVenir} diasSinVenir={d.diasSinVenir} />
            {/* Estos dos llegan solo en la vista del local entero (el backend no los manda si no) */}
            {d.porBarbero && <Comparativa porBarbero={d.porBarbero} />}
            {d.gastos && <Balance ingresos={d.actual.ingresos} gastos={d.gastos} mes={mes} onCambio={resumen.recargar} />}
          </div>
        )}
      </div>
    </div>
  );
}
