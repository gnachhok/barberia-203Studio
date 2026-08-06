import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BarberGallery from "../components/BarberGallery";


const barberos = [
    {
        name: "Valentín",
        images: ["/valentin-1.jpg", "/valentin-2.jpg", "/valentin-3.jpg", "/valentin-4.jpg"],
    },
    {
        name: "Nicolás",
        images: ["/nicolas-1.jpg", "/nicolas-2.jpg", "/nicolas-3.jpg", "/nicolas-4.jpg"],
    },
];

export default function Galeria() {
    return (
        <>
            <Navbar />
            <main className="flex-grow pt-32 pb-24 px-6 md:px-16 max-w-7xl mx-auto w-full">
                {barberos.map((b) => (
                    <BarberGallery key={b.name} name={b.name} images={b.images} />
                ))}
            </main>
            <Footer />
        </>
    );
}