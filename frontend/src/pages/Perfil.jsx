import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Campo from "../components/auth/Campo";
import BotonEnviar from "../components/auth/BotonEnviar";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { api, mensajeDeError } from "../api/client";

export default function Perfil() {
  const perfil = useApi("/usuarios/me");

  return (
    <>
      <Navbar />
      <main className="flex justify-center px-4 pb-20 pt-10">
        <div className="w-full max-w-[520px]">
          <Link to="/" className="label relative z-10 inline-block py-1.5 text-mute hover:text-paper">← Inicio</Link>
          <h1 className="display mb-8 mt-3 text-[clamp(56px,8vw,96px)]">Mi perfil<span className="punto-claro">.</span></h1>

          {perfil.cargando && <p className="label text-mute">Cargando…</p>}
          {perfil.error && <p role="alert" className="border border-line px-4 py-3 text-mute">{perfil.error}</p>}
          {/* El formulario se monta recién cuando llegan los datos: así su estado
              inicial ya los tiene (sin un useEffect que copie datos al estado) */}
          {perfil.data && <FormPerfil datos={perfil.data} />}
        </div>
      </main>
    </>
  );
}

function FormPerfil({ datos }) {
  const { actualizarUsuario } = useAuth();
  const [form, setForm] = useState({
    nombre: datos.nombre,
    apellido: datos.apellido,
    telefono: datos.telefono || "",
    password_actual: "",
    password_nueva: "",
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok" | "error", texto }
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: "" });
    setMensaje(null);
  };

  function validar() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Falta tu nombre";
    if (!form.apellido.trim()) e.apellido = "Falta tu apellido";
    if (form.password_nueva) {
      if (form.password_nueva.length < 8) e.password_nueva = "Tiene que tener al menos 8 caracteres";
      if (!form.password_actual) e.password_actual = "Para cambiarla, poné tu contraseña actual";
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function guardar(e) {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    try {
      const { data } = await api.put("/usuarios/me", {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        // la contraseña solo viaja si se quiere cambiar
        ...(form.password_nueva && { password_actual: form.password_actual, password_nueva: form.password_nueva }),
      });
      actualizarUsuario({ nombre: data.usuario.nombre, apellido: data.usuario.apellido }); // el navbar ve el nombre nuevo
      setForm((f) => ({ ...f, password_actual: "", password_nueva: "" }));
      setMensaje({ tipo: "ok", texto: "Listo, guardamos tus datos." });
    } catch (err) {
      setMensaje({ tipo: "error", texto: mensajeDeError(err) });
    } finally {
      setGuardando(false);
    }
  }

  return (
    // --troquel negativo: la ficha sin muescas (acá no hay talón)
    <form onSubmit={guardar} noValidate className="ficha entra px-6 pb-6 pt-7" style={{ "--troquel": "-100px" }}>
      {mensaje && (
        <p
          role={mensaje.tipo === "error" ? "alert" : "status"}
          className={`mb-6 border-2 px-3.5 py-3 text-sm ${mensaje.tipo === "ok" ? "border-ink" : "border-error text-error"}`}
        >
          {mensaje.tipo === "ok" ? "✓ " : ""}{mensaje.texto}
        </p>
      )}

      <p className="label mb-5 text-ink-mute">Tus datos</p>
      <div className="grid grid-cols-2 gap-4">
        <Campo id="nombre" name="nombre" label="Nombre" autoComplete="given-name" value={form.nombre} onChange={cambiar} error={errores.nombre} />
        <Campo id="apellido" name="apellido" label="Apellido" autoComplete="family-name" value={form.apellido} onChange={cambiar} error={errores.apellido} />
      </div>
      <Campo id="telefono" name="telefono" type="tel" label="Teléfono" ayuda="(opcional)" autoComplete="tel" placeholder="341 555 0000" value={form.telefono} onChange={cambiar} />

      {/* El email no se edita: es con lo que entrás. Se muestra para que sepas cuál es. */}
      <div className="mb-5">
        <p className="label mb-1.5 text-ink-mute">Email</p>
        <p className="border-b-2 border-ink/10 py-2 text-[17px] text-ink-mute">{datos.email}</p>
      </div>

      <p className="label mb-5 mt-9 text-ink-mute">
        Cambiar contraseña <span className="normal-case tracking-normal">(solo si querés)</span>
      </p>
      <Campo id="password_actual" name="password_actual" type="password" label="Contraseña actual" autoComplete="current-password" value={form.password_actual} onChange={cambiar} error={errores.password_actual} />
      <Campo id="password_nueva" name="password_nueva" type="password" label="Contraseña nueva" ayuda="mín. 8 caracteres" autoComplete="new-password" value={form.password_nueva} onChange={cambiar} error={errores.password_nueva} />

      <BotonEnviar cargando={guardando} textoCarga="Guardando…">Guardar cambios</BotonEnviar>
    </form>
  );
}
