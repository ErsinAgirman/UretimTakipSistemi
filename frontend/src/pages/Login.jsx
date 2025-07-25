// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
// logo’yu import edin:
import logo from "../assets/logo1.png";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            localStorage.setItem("token", token);
            navigate("/add-record");
        } catch (err) {
            setError("E‑posta veya şifre hatalı");
            console.error("Login error:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-blue-300 px-4">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
                <h2 className="text-center text-2xl text-blue-700 font-bold mb-4">
                    Şahince Otomotiv Üretim Takip Sistemi
                </h2>

                <div className="flex justify-center mb-6">
                    <img
                        src={logo}
                        alt="Şahince Logo"
                        className="h-16 w-auto"
                    />
                </div>

                <h3 className="text-center text-xl text-gray-700 font-semibold mb-6">
                    Giriş Yap
                </h3>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* E‑posta */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                            E‑posta
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="ornek@sahince.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>

                    {/* Şifre + Görünürlük */}
                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium mb-1">
                            Şifre
                        </label>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Şifreniz"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-2 flex items-center px-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            {showPassword ? "Gizle" : "Göster"}
                        </button>
                    </div>

                    {/* Hata Mesajı */}
                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    {/* Giriş Butonu */}
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
                    >
                        Giriş Yap
                    </button>

                    {/* Kayıt Linki */}
                    <p className="text-center text-sm">
                        Hesabın yok mu?{" "}
                        <a href="/register" className="text-blue-600 hover:underline">
                            Kayıt Ol
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
