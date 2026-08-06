import { useState } from "react";
import { Link } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        confirmPassword: "",
        telefono: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }
        // Acá va la llamada a POST /auth/registro cuando armemos el backend
        console.log("Registro con:", form);
    };

    return (
        <div className="glossy-bg text-on-background min-h-screen flex items-center justify-center font-body relative overflow-hidden p-4 md:p-8">
            <AuthHeader />

            <main className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center justify-center py-24">
                <div className="bg-[#0f0f0f] border border-white/10 rounded-[2rem] p-8 md:p-12 w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
                    <div className="mb-10 text-center">
                        <h1 className="font-display text-3xl text-white tracking-wider uppercase">
                            Crear cuenta
                        </h1>
                        <p className="font-body text-gray-400 mt-2">
                            ¿Ya tenés cuenta?{" "}
                            <Link to="/login" className="text-white hover:underline font-medium">
                                Iniciá sesión
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="font-label text-xs text-gray-400 tracking-widest uppercase" htmlFor="nombre">
                                    Nombre
                                </label>
                                <div className="input-pill rounded-full border border-gray-700 flex items-center px-4 py-3">
                                    <input
                                        id="nombre"
                                        name="nombre"
                                        type="text"
                                        required
                                        value={form.nombre}
                                        onChange={handleChange}
                                        placeholder="Juan"
                                        className="bg-transparent border-none outline-none w-full text-white placeholder-gray-600 font-body"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-label text-xs text-gray-400 tracking-widest uppercase" htmlFor="apellido">
                                    Apellido
                                </label>
                                <div className="input-pill rounded-full border border-gray-700 flex items-center px-4 py-3">
                                    <input
                                        id="apellido"
                                        name="apellido"
                                        type="text"
                                        required
                                        value={form.apellido}
                                        onChange={handleChange}
                                        placeholder="Pérez"
                                        className="bg-transparent border-none outline-none w-full text-white placeholder-gray-600 font-body"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-label text-xs text-gray-400 tracking-widest uppercase" htmlFor="email">
                                Email
                            </label>
                            <div className="input-pill rounded-full border border-gray-700 flex items-center px-4 py-3">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="example@gmail.com"
                                    className="bg-transparent border-none outline-none w-full text-white placeholder-gray-600 font-body"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-label text-xs text-gray-400 tracking-widest uppercase" htmlFor="telefono">
                                Teléfono
                            </label>
                            <div className="input-pill rounded-full border border-gray-700 flex items-center px-4 py-3">
                                <input
                                    id="telefono"
                                    name="telefono"
                                    type="tel"
                                    required
                                    value={form.telefono}
                                    onChange={handleChange}
                                    placeholder="341 1234567"
                                    className="bg-transparent border-none outline-none w-full text-white placeholder-gray-600 font-body"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-label text-xs text-gray-400 tracking-widest uppercase" htmlFor="password">
                                Contraseña
                            </label>
                            <div className="input-pill rounded-full border border-gray-700 flex items-center px-4 py-3">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="bg-transparent border-none outline-none w-full text-white placeholder-gray-600 font-body text-xl tracking-[0.2em]"
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-500 ml-3 cursor-pointer hover:text-white transition-colors select-none"
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-label text-xs text-gray-400 tracking-widest uppercase" htmlFor="confirmPassword">
                                Confirmar contraseña
                            </label>
                            <div className="input-pill rounded-full border border-gray-700 flex items-center px-4 py-3">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    required
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="bg-transparent border-none outline-none w-full text-white placeholder-gray-600 font-body text-xl tracking-[0.2em]"
                                />
                                <span
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="text-gray-500 ml-3 cursor-pointer hover:text-white transition-colors select-none"
                                >
                                    {showConfirm ? "🙈" : "👁️"}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <button
                                type="submit"
                                className="w-full bg-white text-black font-display text-lg tracking-widest py-3.5 rounded-full hover:bg-gray-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                Crear cuenta
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}