// Botón del formulario con estado de carga: mientras espera la respuesta queda
// deshabilitado, así un doble click no manda dos requests.
export default function BotonEnviar({ cargando, textoCarga, children }) {
  return (
    <button type="submit" disabled={cargando} className="btn btn-dark mt-2 w-full justify-between! px-5!">
      <span>{cargando ? textoCarga : children}</span>
      <span aria-hidden="true">→</span>
    </button>
  );
}
