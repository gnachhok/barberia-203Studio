import { useState } from "react";
import { Link } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Acá va la llamada a POST /auth/login cuando armemos el backend
        console.log("Login con:", form);
    };

    return (
        <div className="glossy-bg text-on-background min-h-screen flex items-center justify-center font-body relative overflow-hidden p-4 md:p-8">
            <AuthHeader />

            <main className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center justify-center">
                <div className="bg-[#0f0f0f] border border-white/10 rounded-[2rem] p-8 md:p-12 w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
                    <div className="mb-10 text-center">
                        <h1 className="font-display text-3xl text-white tracking-wider uppercase">
                            Bienvenido
                        </h1>
                        <p className="font-body text-gray-400 mt-2">
                            ¿No tenés cuenta?{" "}
                            <Link to="/registro" className="text-white hover:underline font-medium">
                                Registrate
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label
                                className="font-label text-xs text-gray-400 tracking-widest uppercase"
                                htmlFor="email"
                            >
                                Email
                            </label>
                            <div className="input-pill rounded-full border border-gray-700 flex items-center px-4 py-3 transition-colors duration-300">
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
                            <label
                                className="font-label text-xs text-gray-400 tracking-widest uppercase"
                                htmlFor="password"
                            >
                                Contraseña
                            </label>
                            <div className="input-pill rounded-full border border-gray-700 flex items-center px-4 py-3 transition-colors duration-300">
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

                        <div className="flex justify-between items-center text-sm px-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-4 h-4 rounded-full border border-gray-600 group-hover:border-white flex items-center justify-center transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-gray-400 group-hover:text-white transition-colors">
                                    Recordarme
                                </span>
                            </label>
                            <a href="#" className="text-white hover:underline transition-colors font-medium">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        <div className="mt-4">
                            <button
                                type="submit"
                                className="w-full bg-white text-black font-display text-lg tracking-widest py-3.5 rounded-full hover:bg-gray-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                Ingresar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}