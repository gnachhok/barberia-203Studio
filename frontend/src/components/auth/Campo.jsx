import { useState } from "react";

// Un campo del formulario: etiqueta + input subrayado + mensaje de error.
// Todo el estilo está acá, así Login y Registro solo dicen QUÉ campos tienen.
export default function Campo({ id, label, ayuda, error, type = "text", ...inputProps }) {
  const [verPassword, setVerPassword] = useState(false);
  const esPassword = type === "password";

  return (
    <div className="mb-5">
      <label htmlFor={id} className="label mb-1.5 flex justify-between text-ink-mute">
        <span>{label}</span>
        {ayuda && <span className="normal-case tracking-normal">{ayuda}</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={esPassword && verPassword ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full border-b-2 bg-transparent py-2 text-[17px] text-ink outline-none transition placeholder:text-[#b5b3ad] focus:border-ink ${
            error ? "border-error" : "border-ink/20"
          } ${esPassword ? "pr-10" : ""}`}
          {...inputProps}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVerPassword(!verPassword)}
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-ink-mute hover:text-ink"
          >
            {verPassword ? <OjoTachado /> : <Ojo />}
          </button>
        )}
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-[13px] text-error">{error}</p>}
    </div>
  );
}

const Ojo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const OjoTachado = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10 10 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7a10 10 0 005.4-1.6" />
  </svg>
);
