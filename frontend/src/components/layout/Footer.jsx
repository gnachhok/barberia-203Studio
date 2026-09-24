import { LOCAL } from "../../data/local";

// grande=true: el de la Home, con el "203" gigante en contorno
export default function Footer({ grande = false }) {
  return (
    <footer className="overflow-hidden border-t border-line">
      <div className="wrap label flex justify-between py-6 text-mute">
        <span>© {new Date().getFullYear()} {LOCAL.nombre}</span>
        <span>{grande ? "Desde 2021" : LOCAL.direccion}</span>
      </div>
      {grande && (
        <div
          aria-hidden="true"
          className="display -mb-[2vw] text-center text-[31vw] leading-[.75] text-transparent [-webkit-text-stroke:1px_var(--color-line)]"
        >
          203
        </div>
      )}
    </footer>
  );
}
