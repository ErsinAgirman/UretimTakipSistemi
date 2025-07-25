import Navbar from "./Navbar";
import React from "react";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
            <Navbar />
            <main className="flex-grow p-4">
                {children}
            </main>
        </div>
    );
}
