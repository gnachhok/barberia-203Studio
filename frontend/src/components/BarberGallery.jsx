export default function BarberGallery({ name, images }) {
    return (
        <section className="mb-24">
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-12 border-l-4 border-primary pl-6 uppercase">
                {name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {images.map((src, i) => (
                    <div
                        key={i}
                        className="bg-surface-container-low border border-white/5 rounded-xl overflow-hidden aspect-[3/4] relative group cursor-pointer"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale"
                            style={{ backgroundImage: `url('${src}')` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                ))}
            </div>
        </section>
    );
}