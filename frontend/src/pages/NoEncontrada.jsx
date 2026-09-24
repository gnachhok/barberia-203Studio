import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function NoEncontrada() {
  return (
    <>
      <Navbar />
      <main className="wrap flex min-h-[70vh] flex-col items-start justify-center gap-6 py-24">
        <p className="label text-mute">Error 404</p>
        <h1 className="display text-[clamp(72px,12vw,184px)]">Acá no<br />hay nada<span className="punto-claro">.</span></h1>
        <Link to="/" className="btn btn-solid">Volver al inicio →</Link>
      </main>
    </>
  );
}
