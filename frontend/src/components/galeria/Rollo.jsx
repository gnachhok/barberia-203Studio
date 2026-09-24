import { useEffect, useRef, useState } from "react";
import "./rollo.css";

const GAP = 40;          // espacio entre fotogramas
const MAX_TIRON = 3;     // un tirón fuerte avanza como máximo 3 fotos

// Rollo de película arrastrable con inercia.
//
// Por qué refs y no useState para la posición: la animación corre a 60 cuadros
// por segundo. Si cada cuadro hiciera setState, React re-renderizaría el
// componente 60 veces por segundo. En cambio guardamos la posición en refs
// (no disparan render) y movemos los elementos directamente con style.transform.
// El único estado de React es `actual` (qué foto está en el centro), que cambia
// pocas veces y es lo que muestra el pie de foto.
export default function Rollo({ fotos }) {
  const rolloRef = useRef(null);
  const cuadrosRef = useRef([]);
  const pos = useRef(0);        // índice "flotante" de la foto en el centro (2.4 = entre la 3ª y la 4ª)
  const objetivo = useRef(0);   // hacia dónde se está animando
  const arrastre = useRef(null);
  const [actual, setActual] = useState(0);
  const ultimo = fotos.length - 1;

  const irA = (i) => { objetivo.current = Math.max(0, Math.min(ultimo, i)); };

  // Loop de animación: acerca pos al objetivo (easing) y dibuja
  useEffect(() => {
    let raf;
    const dibujar = () => {
      const rollo = rolloRef.current;
      const cuadros = cuadrosRef.current;
      if (!rollo || !cuadros[0]) return;

      if (!arrastre.current) {
        pos.current += (objetivo.current - pos.current) * 0.14;
        if (Math.abs(objetivo.current - pos.current) < 0.001) pos.current = objetivo.current;
      }

      const w = cuadros[0].offsetWidth;
      const paso = w + GAP;
      const centro = rollo.clientWidth / 2;
      cuadros.forEach((el, i) => {
        if (!el) return;
        const d = i - pos.current;
        const dist = Math.min(Math.abs(d), 2);
        el.style.transform = `translate(${centro + d * paso - w / 2}px, -50%) scale(${1 - dist * 0.14})`;
        el.style.zIndex = String(10 - Math.round(dist * 3));
        el.style.opacity = String(1 - dist * 0.2);
        // la del centro a color, las de los costados pasan a B&N de a poco
        const img = el.querySelector("img");
        if (img) img.style.filter = `grayscale(${Math.min(Math.abs(d), 1)}) contrast(1.15)`;
      });
      // perforaciones, marcas y rayones se mueven junto con las fotos
      rollo.style.setProperty("--x", `${-pos.current * paso}px`);

      const nuevo = Math.round(Math.max(0, Math.min(ultimo, pos.current)));
      setActual((prev) => (prev === nuevo ? prev : nuevo)); // solo re-renderiza si cambió

      raf = requestAnimationFrame(dibujar);
    };
    raf = requestAnimationFrame(dibujar);
    return () => cancelAnimationFrame(raf);
  }, [ultimo]);

  // ---------- Arrastre con inercia ----------
  function alBajar(e) {
    rolloRef.current.setPointerCapture(e.pointerId);
    arrastre.current = { inicioX: e.clientX, inicioPos: pos.current, ultX: e.clientX, ultT: performance.now(), vel: 0, movido: false };
  }

  function alMover(e) {
    const a = arrastre.current;
    if (!a) return;
    const paso = cuadrosRef.current[0].offsetWidth + GAP;
    const ahora = performance.now();
    if (Math.abs(e.clientX - a.inicioX) > 5) a.movido = true;
    let p = a.inicioPos - (e.clientX - a.inicioX) / paso;
    // "elástico" si te pasás de los bordes
    if (p < 0) p *= 0.3;
    if (p > ultimo) p = ultimo + (p - ultimo) * 0.3;
    a.vel = (-(e.clientX - a.ultX) / paso) / Math.max(1, ahora - a.ultT); // fotos por ms
    a.ultX = e.clientX;
    a.ultT = ahora;
    pos.current = p;
  }

  function alSoltar(e) {
    const a = arrastre.current;
    arrastre.current = null;
    if (!a) return;
    if (!a.movido) {
      // fue un click: traer al centro la foto tocada
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-cuadro]");
      if (el) irA(Number(el.dataset.cuadro));
      return;
    }
    // la inercia proyecta hacia dónde "seguiría" el rollo y redondea a una foto
    const extra = Math.max(-MAX_TIRON, Math.min(MAX_TIRON, a.vel * 250));
    irA(Math.round(pos.current + extra));
  }

  function alTeclear(e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); irA(Math.round(objetivo.current) - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); irA(Math.round(objetivo.current) + 1); }
  }

  const dos = (n) => String(n).padStart(2, "0");

  return (
    <>
      <div
        ref={rolloRef}
        className="rollo"
        tabIndex={0}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Galería de cortes. Usá las flechas del teclado para moverte."
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onKeyDown={alTeclear}
      >
        <div className="rollo-perf arriba" /><div className="rollo-perf abajo" />
        <div className="rollo-marcas arriba" /><div className="rollo-marcas abajo" />
        <div className="rollo-rayas" /><div className="rollo-grano" />

        {fotos.map((f, i) => (
          <div key={i} data-cuadro={i} ref={(el) => (cuadrosRef.current[i] = el)} className="rollo-cuadro">
            <div className="aspect-[4/5] overflow-hidden bg-[#262626]">
              {f.src ? (
                <img src={f.src} alt={f.titulo} draggable="false" className="pointer-events-none block h-full w-full object-cover" />
              ) : (
                <div className="vacio">
                  <span className="display text-[44px]">{dos(i + 1)}</span>
                  <span className="label">Foto próximamente</span>
                </div>
              )}
            </div>
            <div className="label mt-2.5 flex justify-between text-[11px]! text-mute">
              <span>203-{dos(i + 1)}</span><span>▸ {dos(i + 1)}A</span>
            </div>
          </div>
        ))}
      </div>

      <div className="wrap flex items-center justify-between gap-4 pb-24 pt-6">
        <div aria-live="polite">
          <p className="display text-[32px]">{fotos[actual].titulo}</p>
          <p className="label mt-2 text-mute">{dos(actual + 1)} / {dos(fotos.length)}</p>
        </div>
        <div className="flex gap-3">
          <button className="rollo-flecha" onClick={() => irA(Math.round(objetivo.current) - 1)} aria-label="Foto anterior">←</button>
          <button className="rollo-flecha" onClick={() => irA(Math.round(objetivo.current) + 1)} aria-label="Foto siguiente">→</button>
        </div>
      </div>
    </>
  );
}
