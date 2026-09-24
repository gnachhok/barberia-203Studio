import { Routes, Route } from "react-router-dom";
import ScrollManager from "./components/layout/ScrollManager";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Galeria from "./pages/Galeria";
import Barbero from "./pages/Barbero";
import Reservar from "./pages/Reservar";
import NoEncontrada from "./pages/NoEncontrada";

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
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </>
  );
}
