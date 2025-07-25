// src/components/Navbar.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { UserCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "../components/ThemeToggle";

export default function Navbar() {
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await auth.signOut();
        localStorage.clear();
        navigate("/login", { replace: true });
    };

    return (
        <nav className="w-full bg-gradient-to-b from-blue-200 to-white dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="-xl mx-auto px-8 md:px-6 py-3 flex items-center justify-between">
                {/* Logo + Başlık */}
                <Link to="/dashboard" className="flex items-center space-x-2">
                    <img
                        src="src/assets/logo1.png"
                        alt="Şahince Logo"
                        className="h-8 w-auto"
                    />
                    <span className="text-2xl font-semibold text-gray-700 dark:text-white">
                        Şahince Üretim Takip
                    </span>
                </Link>

                {/* Masaüstü Menü */}
                <ul className="hidden md:flex items-center space-x-6">
                    <li>
                        <Link
                            to="/dashboard"
                            className="text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                        >
                            Anasayfa
                        </Link>
                    </li>

                    {["supervisor", "admin"].includes(role) && (
                        <li>
                            <Link
                                to="/settings"
                                className="text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                            >
                                Kullanıcı Yönetimi
                            </Link>
                        </li>
                    )}

                    {["supervisor", "admin"].includes(role) && (
                        <li>
                            <Link
                                to="/records"
                                className="text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                            >
                                Raporlar
                            </Link>
                        </li>
                    )}

                    {/* 🌙 Masaüstü Tema Toggle */}
                    <li>
                        <ThemeToggle />
                    </li>

                    {/* Profil Dropdown */}
                    <li className="relative">
                        <button
                            onClick={() => setIsMenuOpen((o) => !o)}
                            className="flex items-center space-x-1 text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                        >
                            <UserCircleIcon className="h-6 w-6" />
                            <span>{user?.email?.split("@")[0]}</span>
                            <ChevronDownIcon className="h-4 w-4" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-20">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Çıkış Yap
                                </button>
                            </div>
                        )}
                    </li>
                </ul>

                {/* Mobil Menü Butonu */}
                <button
                    onClick={() => setIsMenuOpen((o) => !o)}
                    className="md:hidden p-2 rounded text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    {isMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobil Açılır Menü */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <ul className="flex flex-col p-4 space-y-2">
                        <li>
                            <Link
                                to="/dashboard"
                                className="block text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Anasayfa
                            </Link>
                        </li>

                        {["supervisor", "admin"].includes(role) && (
                            <li>
                                <Link
                                    to="/settings"
                                    className="block text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Kullanıcı Yönetimi
                                </Link>
                            </li>
                        )}

                        <li>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    handleLogout();
                                }}
                                className="w-full text-left text-gray-600 dark:text-gray-200 hover:text-red-600"
                            >
                                Çıkış Yap
                            </button>
                        </li>

                        {/* 🌙 Mobil Tema Toggle */}
                        <li>
                            <ThemeToggle />
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    );
}
