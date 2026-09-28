import { Routes, Route } from "react-router-dom";
import ScrollManager from "./components/layout/ScrollManager";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Galeria from "./pages/Galeria";
import Barbero from "./pages/Barbero";
import Reservar from "./pages/Reservar";
import MisReservas from "./pages/MisReservas";
import Perfil from "./pages/Perfil";
import NoEncontrada from "./pages/NoEncontrada";
import RutaPrivada from "./components/layout/RutaPrivada";

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/barberos/:slug" element={<Barbero />} />
        <Route path="/reservar" element={<Reservar />} />
        {/* Solo con sesión: sin usuario te manda al login y después vuelve acá */}
        <Route path="/mis-reservas" element={<RutaPrivada volverA="mis-reservas"><MisReservas /></RutaPrivada>} />
        <Route path="/perfil" element={<RutaPrivada volverA="perfil"><Perfil /></RutaPrivada>} />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </>
  );
}
