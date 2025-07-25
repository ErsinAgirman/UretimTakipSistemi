// src/components/ThemeToggle.jsx
import { useTheme } from "../contexts/ThemeContext";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 transition"
            title={theme === "dark" ? "Aydınlık Moda Geç" : "Karanlık Moda Geç"}
        >
            {theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
            ) : (
                <MoonIcon className="h-5 w-5" />
            )}
        </button>
    );
}
