// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import logo from "../assets/logo1.png";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        // Şifre kuralları: en az 6 karakter, bir büyük harf, bir küçük harf ve bir sayı
        const isLengthOK = password.length >= 6;
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasDigit = /\d/.test(password);

        if (!isLengthOK || !hasLower || !hasUpper || !hasDigit) {
            setErrorMsg(
                "Şifre en az 6 karakter, bir büyük harf, bir küçük harf ve bir sayı içermelidir."
            );
            return;
        }
        if (password !== confirmPwd) {
            setErrorMsg("Şifre ve Şifre Tekrar aynı olmalıdır.");
            return;
        }

        try {
            // 1) Firebase Auth ile kullanıcı oluştur
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            // 2) Firestore 'users' koleksiyonuna belge ekle
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: "operator", // varsayılan rol
            });

            // 3) Başarılı kayıt → üretim ekleme sayfasına yönlendir
            navigate("/add-record");
        } catch (error) {
            setErrorMsg(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-300 px-4">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
                <h2 className="text-center text-2xl text-blue-700 font-bold mb-4">
                    Şahince Otomotiv Üretim Takip Sistemi

                </h2>

                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Şahince Logo" className="h-16 w-auto" />
                </div>

                <h3 className="text-center text-xl text-gray-700 font-semibold mb-6">
                    Kayıt Ol
                </h3>

                {errorMsg && (
                    <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Email */}
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

                    {/* Şifre */}
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

                    {/* Şifre Tekrar */}
                    <div className="relative">
                        <label
                            htmlFor="confirmPwd"
                            className="block text-sm font-medium mb-1"
                        >
                            Şifre Tekrar
                        </label>
                        <input
                            id="confirmPwd"
                            type={showConfirm ? "text" : "password"}
                            placeholder="Şifrenizi tekrar girin"
                            value={confirmPwd}
                            onChange={(e) => setConfirmPwd(e.target.value)}
                            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute inset-y-0 right-2 flex items-center px-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            {showConfirm ? "Gizle" : "Göster"}
                        </button>
                    </div>

                    {/* Kayıt Ol Butonu */}
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
                    >
                        Kayıt Ol
                    </button>

                    <p className="text-center text-sm">
                        Zaten üye misin?{" "}
                        <a href="/login" className="text-purple-500 hover:underline">
                            Giriş Yap
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
