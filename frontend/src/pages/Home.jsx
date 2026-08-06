import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import WorksGrid from "../components/WorksGrid";
import VisitSection from "../components/VisitSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />

      <div className="w-full max-w-7xl mx-auto px-6 md:px-16">
        <div className="faded-divider" />
      </div>

      <WorksGrid />
      <VisitSection />
      <Footer />
    </>
  );
}
