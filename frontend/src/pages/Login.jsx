import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import Campo from "../components/auth/Campo";
import BotonEnviar from "../components/auth/BotonEnviar";
import { useAuth } from "../context/AuthContext";
import { useDestinoPostLogin } from "../hooks/useDestinoPostLogin";
import { mensajeDeError } from "../api/client";

const emailValido = (v) => /^\S+@\S+\.\S+$/.test(v);

export default function Login() {
  const { login } = useAuth();
  const irAlDestino = useDestinoPostLogin();
  const [params] = useSearchParams();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [cargando, setCargando] = useState(false);

  // Al escribir en un campo se borra su error
  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: "" });
  };

  // Validación en el frontend = comodidad (feedback inmediato).
  // La seguridad real está en el backend, que valida de nuevo.
  function validar() {
    const e = {};
    if (!form.email.trim()) e.email = "Ingresá tu email";
    else if (!emailValido(form.email.trim())) e.email = "Ese email no parece válido";
    if (!form.password) e.password = "Ingresá tu contraseña";
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function enviar(e) {
    e.preventDefault();
    setErrorGeneral("");
    if (!validar()) return;

    setCargando(true);
    try {
      await login(form.email.trim(), form.password);
      irAlDestino();
    } catch (err) {
      setErrorGeneral(
        err.response?.status === 401
          ? "Email o contraseña incorrectos. Revisalos e intentá de nuevo."
          : mensajeDeError(err)
      );
      setCargando(false);
    }
  }

  const sufijo = params.get("next") ? `?next=${params.get("next")}` : "";

  return (
    <AuthLayout>
      <form onSubmit={enviar} noValidate className="entra">
        <h1 className="display text-[52px] leading-[.9]">Volviste<span className="punto-oscuro">.</span></h1>
        <p className="mb-7 mt-2.5 text-ink-mute">Ingresá y reservá tu próximo corte.</p>

        {errorGeneral && <p role="alert" className="mb-5 border-2 border-error px-3.5 py-3 text-sm text-error">{errorGeneral}</p>}

        <Campo id="email" name="email" type="email" label="Email" autoComplete="email" placeholder="tu@email.com"
          value={form.email} onChange={cambiar} error={errores.email} />
        <Campo id="password" name="password" type="password" label="Contraseña" autoComplete="current-password"
          value={form.password} onChange={cambiar} error={errores.password} />

        <BotonEnviar cargando={cargando} textoCarga="Ingresando…">Ingresar</BotonEnviar>

        <p className="mt-[18px] text-center text-sm text-ink-mute">
          ¿Primera vez? <Link to={`/registro${sufijo}`} replace className="border-b text-ink">Sacá tu número</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
