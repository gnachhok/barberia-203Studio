import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Marquee from "../components/ui/Marquee";
import Hero from "../components/home/Hero";
import SeccionBarberos from "../components/home/SeccionBarberos";
import SeccionTrabajos from "../components/home/SeccionTrabajos";
import SeccionContacto from "../components/home/SeccionContacto";
import { ESTILOS } from "../data/local";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee items={ESTILOS} className="border-b border-line bg-paper text-ink" />
        <SeccionBarberos />
        <SeccionTrabajos />
        <SeccionContacto />
      </main>
      <Footer grande />
    </>
  );
}
