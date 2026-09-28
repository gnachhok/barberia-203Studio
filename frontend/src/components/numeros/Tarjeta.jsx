// Caja de cada bloque de Números. `punteada` = solo lo ve el admin.
export default function Tarjeta({ titulo, sub, punteada, className = "", children }) {
  return (
    <section className={`border-[1.5px] border-ink p-[18px] ${punteada ? "border-dashed" : ""} ${className}`}>
      <h2 className="display text-[26px]">{titulo}</h2>
      {sub && <p className="mb-4 mt-1 text-ink-mute">{sub}</p>}
      {children}
    </section>
  );
}
