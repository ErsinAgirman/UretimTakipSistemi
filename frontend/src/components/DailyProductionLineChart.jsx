// src/components/DailyProductionLineChart.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { subDays, format, startOfDay } from "date-fns";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { useTheme } from "../contexts/ThemeContext";

export default function DailyProductionLineChart({ selectedPart = null, days = 7 }) {
    const [data, setData] = useState([]);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        const startDate = startOfDay(subDays(new Date(), days - 1));
        const q = query(
            collection(db, "records"),
            where("timestamp", ">=", startDate)
        );
        const unsub = onSnapshot(q, (snapshot) => {
            const totals = {};
            snapshot.docs.forEach((doc) => {
                const rec = doc.data();
                if (selectedPart && rec.parca_ad !== selectedPart) return;
                const dateKey = format(rec.timestamp.toDate(), "yyyy-MM-dd");
                totals[dateKey] = (totals[dateKey] || 0) + Number(rec.adet);
            });

            const chartData = [];
            for (let i = 0; i < days; i++) {
                const date = subDays(new Date(), days - 1 - i);
                const key = format(date, "yyyy-MM-dd");
                chartData.push({
                    date: format(date, "dd/MM"),
                    total: totals[key] || 0,
                });
            }

            setData(chartData);
        });

        return () => unsub();
    }, [selectedPart, days]);

    if (!data.length) {
        return <p className="text-center text-gray-600 dark:text-gray-300">Veri yükleniyor...</p>;
    }

    return (
        <div className={`w-full h-64 p-4 rounded-lg shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
            <h4 className="text-lg font-medium mb-2">
                Günlük Üretim (Son {days} Gün)
            </h4>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    style={{ backgroundColor: isDark ? "#1f2937" : "#fff" }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ccc"} />
                    <XAxis dataKey="date" stroke={isDark ? "#fff" : "#000"} />
                    <YAxis allowDecimals={false} stroke={isDark ? "#fff" : "#000"} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? "#1f2937" : "#fff",
                            color: isDark ? "#fff" : "#000",
                            border: isDark ? "1px solid #555" : "1px solid #ccc"
                        }}
                        labelStyle={{ color: isDark ? "#fff" : "#000" }}
                        itemStyle={{ color: isDark ? "#fff" : "#000" }}
                        formatter={(val) => `${val}`}
                    />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke={isDark ? "#3b82f6" : "#2563EB"}
                        strokeWidth={2}
                        dot
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
