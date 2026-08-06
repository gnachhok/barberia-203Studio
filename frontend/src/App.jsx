import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Servicios from "./pages/Servicios";
import Galeria from "./pages/Galeria";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/servicios" element={<Servicios />} />
      <Route path="/galeria" element={<Galeria />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

    </Routes>
  );
}
