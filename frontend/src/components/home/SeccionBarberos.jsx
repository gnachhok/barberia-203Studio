import { Link } from "react-router-dom";
import { BARBEROS, iniciales } from "../../data/barberos";

export default function SeccionBarberos() {
  return (
    <section id="nosotros" className="wrap scroll-mt-20 py-24">
      <div className="tag">
        <span className="label text-mute">01</span>
        <h2 className="display text-[56px]">Quiénes cortan</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {BARBEROS.map((b) => <TarjetaBarbero key={b.slug} barbero={b} />)}
      </div>
    </section>
  );
}

// Toda la tarjeta es un link (área grande, fácil de tocar en el celular)
function TarjetaBarbero({ barbero }) {
  return (
    <Link
      to={`/barberos/${barbero.slug}`}
      className="photo-box group block border border-line transition duration-300 hover:-translate-y-1 hover:border-paper"
    >
      <div className="grain relative aspect-square overflow-hidden">
        {barbero.foto ? (
          <img className="photo h-full w-full object-cover" src={barbero.foto} alt={`${barbero.nombre} ${barbero.apellido}`} />
        ) : (
          <div className="vacio">
            <span className="display text-[120px] text-[#333]">{iniciales(barbero)}</span>
            <span className="label">Foto próximamente</span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-4 p-[22px]">
        <div>
          <h3 className="display text-[40px]">{barbero.nombre} {barbero.apellido}</h3>
          <p className="label mt-2 text-mute">{barbero.edad} años · @{barbero.instagram}</p>
        </div>
        <span className="label shrink-0 border border-paper px-3 py-2 transition group-hover:bg-paper group-hover:text-ink">
          Ver perfil →
        </span>
      </div>
    </Link>
  );
}
