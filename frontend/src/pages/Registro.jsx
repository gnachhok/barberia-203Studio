import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import Campo from "../components/auth/Campo";
import BotonEnviar from "../components/auth/BotonEnviar";
import { useAuth } from "../context/AuthContext";
import { useDestinoPostLogin } from "../hooks/useDestinoPostLogin";
import { mensajeDeError } from "../api/client";

const emailValido = (v) => /^\S+@\S+\.\S+$/.test(v);
const VACIO = { nombre: "", apellido: "", email: "", telefono: "", password: "" };

export default function Registro() {
  const { registro } = useAuth();
  const irAlDestino = useDestinoPostLogin();
  const [params] = useSearchParams();

  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null); // string o "email-existe"
  const [cargando, setCargando] = useState(false);

  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: "" });
  };

  function validar() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "¿Cómo te llamás?";
    if (!form.apellido.trim()) e.apellido = "Falta tu apellido";
    if (!form.email.trim()) e.email = "Ingresá tu email";
    else if (!emailValido(form.email.trim())) e.email = "Ese email no parece válido";
    if (form.password.length < 8) e.password = "Tiene que tener al menos 8 caracteres";
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function enviar(e) {
    e.preventDefault();
    setErrorGeneral(null);
    if (!validar()) return;

    setCargando(true);
    try {
      await registro({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || null,
        password: form.password,
      });
      irAlDestino();
    } catch (err) {
      // 409 = el email ya existe → en vez de "Error", le damos una salida
      setErrorGeneral(err.response?.status === 409 ? "email-existe" : mensajeDeError(err));
      setCargando(false);
    }
  }

  const sufijo = params.get("next") ? `?next=${params.get("next")}` : "";

  return (
    <AuthLayout>
      <form onSubmit={enviar} noValidate className="entra">
        <h1 className="display text-[52px] leading-[.9]">Sacá tu número<span className="punto-oscuro">.</span></h1>
        <p className="mb-7 mt-2.5 text-ink-mute">Creá tu cuenta y reservá en un minuto.</p>

        {errorGeneral && (
          <p role="alert" className="mb-5 border-2 border-error px-3.5 py-3 text-sm text-error">
            {errorGeneral === "email-existe" ? (
              <>Ese email ya tiene cuenta. <Link to={`/login${sufijo}`} replace className="font-medium underline">¿Querés ingresar?</Link></>
            ) : errorGeneral}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Campo id="nombre" name="nombre" label="Nombre" autoComplete="given-name"
            value={form.nombre} onChange={cambiar} error={errores.nombre} />
          <Campo id="apellido" name="apellido" label="Apellido" autoComplete="family-name"
            value={form.apellido} onChange={cambiar} error={errores.apellido} />
        </div>
        <Campo id="email" name="email" type="email" label="Email" autoComplete="email" placeholder="tu@email.com"
          value={form.email} onChange={cambiar} error={errores.email} />
        <Campo id="telefono" name="telefono" type="tel" label="Teléfono" ayuda="(opcional)" autoComplete="tel" placeholder="341 555 0000"
          value={form.telefono} onChange={cambiar} />
        <Campo id="password" name="password" type="password" label="Contraseña" ayuda="mín. 8 caracteres" autoComplete="new-password"
          value={form.password} onChange={cambiar} error={errores.password} />

        <BotonEnviar cargando={cargando} textoCarga="Creando cuenta…">Crear cuenta</BotonEnviar>

        <p className="mt-[18px] text-center text-sm text-ink-mute">
          ¿Ya tenés cuenta? <Link to={`/login${sufijo}`} replace className="border-b text-ink">Ingresá</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
