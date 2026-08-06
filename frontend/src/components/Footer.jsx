export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest py-12 px-6 md:px-16 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto border-t border-outline-variant/20 mt-auto">
      <div className="font-display text-xl text-primary mb-6 md:mb-0">
        203 STUDIO
      </div>
      <div className="font-body text-sm text-on-surface-variant mb-6 md:mb-0">
        © 203 STUDIO. Todos los derechos reservados.
      </div>
      <div className="flex gap-6">
      <a
      href="https://www.instagram.com/203.sstudio/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-200"
      >
        Instagram
      </a>
      <a
        href="https://maps.app.goo.gl/Ty7k55zDgTmu6gEp8"
        target="_blank"
        rel="noopener noreferrer"
        className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-200"
      >
        Ubicación
      </a>
      </div>
    </footer>
  );
}
