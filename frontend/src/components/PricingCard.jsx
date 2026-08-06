export default function PricingCard({
  label,
  badge,
  title,
  price,
  features,
  ctaText,
  highlighted = false,
}) {
  return (
    <div
      className={`glass-card rounded-xl p-8 flex flex-col h-full relative overflow-hidden ${
        highlighted ? "shadow-[0_0_30px_rgba(255,255,255,0.08)]" : ""
      }`}
    >
      {highlighted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 blur-[50px] rounded-full z-0" />
      )}

      <div className="relative z-10 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <div className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
            {label}
          </div>
          {badge && (
            <span className="bg-primary text-on-primary font-label text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold">
              {badge}
            </span>
          )}
        </div>

        <h2 className="font-display text-2xl md:text-3xl text-primary mb-2">
          {title}
        </h2>

        <div className="font-display text-4xl md:text-5xl text-primary mb-8 border-b border-outline-variant/30 pb-6">
          {price}
          <span className="font-body text-base text-on-surface-variant align-baseline">
            /ars
          </span>
        </div>

        <ul className="space-y-4 mb-8">
          {features.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-3 border-b border-outline-variant/10 pb-3"
            >
              <span className="text-primary text-sm mt-1">✓</span>
              <span className="font-body text-on-surface-variant">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 mt-auto">
        <button
          className={`w-full font-body font-bold py-4 rounded-full transition-colors ${
            highlighted
              ? "bg-primary text-on-primary hover:opacity-90 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              : "bg-transparent border border-outline-variant text-primary hover:bg-white/10"
          }`}
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
}
