// src/components/OperatorPieChart.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../contexts/ThemeContext";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function OperatorPieChart() {
  const [data, setData] = useState([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "records"), (snapshot) => {
      const totals = {};

      snapshot.docs.forEach((doc) => {
        const { operator, adet } = doc.data();
        const qty = Number(adet) || 0;
        totals[operator || "Bilinmeyen"] = (totals[operator] || 0) + qty;
      });

      const chartData = Object.entries(totals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setData(chartData);
    });

    return () => unsub();
  }, []);

  if (!data.length) {
    return <p className="text-center text-gray-600 dark:text-gray-300">Veri yükleniyor...</p>;
  }

  return (
    <div className={`w-full h-64 p-4 rounded-lg shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
      <h4 className="text-lg font-medium mb-2">Operatör Dağılımı</h4>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart style={{ backgroundColor: isDark ? "#1f2937" : "#fff" }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
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
          <Legend
            wrapperStyle={{ color: isDark ? "#fff" : "#000" }}
            layout="horizontal"
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
