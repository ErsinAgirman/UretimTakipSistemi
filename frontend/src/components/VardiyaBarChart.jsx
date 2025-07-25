// src/components/VardiyaBarChart.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { useTheme } from "../contexts/ThemeContext";

export default function VardiyaBarChart({ selectedPart = null }) {
    const [data, setData] = useState([]);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        const q = query(collection(db, "records"));
        const unsub = onSnapshot(q, (snapshot) => {
            const totals = {};

            snapshot.docs.forEach((doc) => {
                const rec = doc.data();
                if (selectedPart && rec.parca_ad !== selectedPart) return;

                const shift = rec.vardiya;
                const qty = Number(rec.adet) || 0;
                totals[shift] = (totals[shift] || 0) + qty;
            });

            const order = ["Sabah", "Öğle", "Akşam"];
            const chartData = order.map((name) => ({
                name,
                total: totals[name] || 0,
            }));

            setData(chartData);
        });

        return () => unsub();
    }, [selectedPart]);

    if (data.length === 0) {
        return <p className="text-center text-gray-600 dark:text-gray-300">Grafik yükleniyor...</p>;
    }

    return (
        <div className={`w-full h-64 p-4 rounded-lg shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
            <h4 className="text-lg font-medium mb-2">Vardiyalara Göre Üretim Adedi</h4>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    style={{ backgroundColor: isDark ? "#1f2937" : "#fff" }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ccc"} />
                    <XAxis dataKey="name" stroke={isDark ? "#fff" : "#000"} />
                    <YAxis allowDecimals={false} stroke={isDark ? "#fff" : "#000"} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? "#1f2937" : "#fff",
                            border: isDark ? "1px solid #555" : "1px solid #ccc",
                            color: isDark ? "#fff" : "#000"
                        }}
                        labelStyle={{
                            color: isDark ? "#fff" : "#000"
                        }}
                        itemStyle={{
                            color: isDark ? "#fff" : "#000"
                        }}
                    />
                    <Bar dataKey="total" fill={isDark ? "#3b82f6" : "#2563eb"} name="Toplam Adet" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
