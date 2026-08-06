import { Link } from "react-router-dom";

export default function AuthHeader() {
    return (
        <header className="absolute top-0 w-full p-6 flex justify-between items-center z-20 px-8 md:px-16">
            <Link
                to="/"
                className="font-display text-2xl font-bold text-white tracking-widest"
            >
                203 STUDIO.
            </Link>
            <nav className="hidden md:flex gap-8 text-sm uppercase tracking-wider text-gray-400">
                <Link to="/" className="hover:text-white transition-colors">
                    Home
                </Link>
                <Link to="/galeria" className="hover:text-white transition-colors">
                    Galería
                </Link>
                <Link to="/servicios" className="hover:text-white transition-colors">
                    Servicios
                </Link>
            </nav>
        </header>
    );
}