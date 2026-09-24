import { LOCAL, HORARIO_TEXTO } from "../../data/local";
import InstagramIcon from "../ui/InstagramIcon";

// Sección invertida (fondo claro): corta el negro y le da ritmo a la página
export default function SeccionContacto() {
  return (
    <section id="contacto" className="scroll-mt-20 bg-paper text-ink">
      <div className="wrap grid gap-12 py-24 md:grid-cols-2">
        <div>
          <div className="tag border-ink/20">
            <span className="label text-ink-mute">03</span>
            <h2 className="display text-[56px]">Vení al estudio</h2>
          </div>

          <dl className="grid gap-7">
            <div>
              <dt className="label text-ink-mute">Dirección</dt>
              <dd className="display mt-1.5 text-[32px]">{LOCAL.direccion}</dd>
            </div>
            <div>
              <dt className="label text-ink-mute">Horarios</dt>
              <dd className="mt-1.5 text-lg leading-relaxed">
                {HORARIO_TEXTO.map((linea) => <span key={linea} className="block">{linea}</span>)}
              </dd>
            </div>
            <div>
              <dt className="label text-ink-mute">Seguinos</dt>
              <dd className="mt-2.5">
                <a
                  href={LOCAL.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram de 203 Studio"
                  className="inline-flex h-[52px] w-[52px] items-center justify-center border-2 border-ink transition hover:bg-ink hover:text-paper"
                >
                  <InstagramIcon size={26} />
                </a>
              </dd>
            </div>
          </dl>

          <a href={LOCAL.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-dark mt-9">
            Cómo llegar →
          </a>
        </div>

        <div className="min-h-[360px] border-2 border-ink">
          <iframe
            title="Mapa de 203 Studio"
            src={LOCAL.mapsEmbed}
            loading="lazy"
            className="h-full min-h-[360px] w-full border-0 grayscale contrast-110"
          />
        </div>
      </div>
    </section>
  );
}
