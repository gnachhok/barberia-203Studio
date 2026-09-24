import { Link } from "react-router-dom";
import { estadoLocal } from "../../utils/fechas";

export default function Hero() {
  // Se calcula en cada render con la hora actual: nunca dice "abierto" estando cerrado
  const estado = estadoLocal();

  return (
    <section className="border-b border-line">
      <div className="wrap grid items-end gap-10 py-14 md:grid-cols-[1.15fr_.85fr]">
        <div>
          <p className="label mb-6 text-mute">
            {estado.abierto ? (
              <><span className="text-paper">● Abierto ahora</span> · hasta las {estado.cierra} h</>
            ) : (
              <>○ Cerrado · abrimos {estado.cuando} a las {estado.abre} h</>
            )}
          </p>
          <h1 className="display text-[clamp(72px,12vw,184px)]">
            Salís<br />distinto<span className="punto-claro">.</span>
          </h1>
          <p className="mb-9 mt-7 max-w-[440px] text-[19px] leading-normal text-[#cfcdc8]">
            Fades, cortes y barba. Dos barberos, un estudio y tu turno reservado en menos de un minuto.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/reservar" className="btn btn-solid">Agendar turno →</Link>
            <Link to="/#nosotros" className="btn btn-line">Conocenos</Link>
          </div>
        </div>

        <div className="photo-box grain relative aspect-[4/5] overflow-hidden border-2 border-paper">
          <img className="photo h-full w-full object-cover" src="/corte1.jpg" alt="Corte mid fade con textura hecho en 203 Studio" />
          <div className="sticker right-[-6px] top-[18px]">Nº 203</div>
          <div className="label absolute inset-x-0 bottom-0 flex justify-between bg-ink px-3.5 py-2.5">
            <span>Mid fade + textura</span>
            <span className="text-mute">203 Studio</span>
          </div>
        </div>
      </div>
    </section>
  );
}
