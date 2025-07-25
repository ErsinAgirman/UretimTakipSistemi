import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
    collection,
    getDocs,
    query,
    orderBy,
    onSnapshot
} from "firebase/firestore";
import { startOfDay } from "date-fns";

import VardiyaBarChart from "../components/VardiyaBarChart";
import OperatorPieChart from "../components/OperatorPieChart";
import DailyProductionLineChart from "../components/DailyProductionLineChart";
import { useTheme } from "../contexts/ThemeContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [records, setRecords] = useState([]);
    const [parts, setParts] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [todayCount, setTodayCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selPart, setSelPart] = useState("");
    const [chartDays, setChartDays] = useState(7);

    useEffect(() => {
        getDocs(collection(db, "parts")).then(snap =>
            setParts(snap.docs.map(d => ({ id: d.id, name: d.data().name })))
        );

        const unsub = onSnapshot(
            query(collection(db, "records"), orderBy("timestamp", "desc")),
            snap => {
                const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setRecords(docs);
                setTotalCount(docs.length);

                const start = startOfDay(new Date());
                setTodayCount(docs.filter(r => r.timestamp.toDate() >= start).length);
                setLoading(false);
            }
        );
        return () => unsub();
    }, []);

    const todayRecords = useMemo(() => {
        const start = startOfDay(new Date());
        return records.filter(r => r.timestamp.toDate() >= start);
    }, [records]);

    const dailyTotalAdet = useMemo(() => {
        return todayRecords.reduce((sum, r) => sum + Number(r.adet), 0);
    }, [todayRecords]);

    const dailyTopPart = useMemo(() => {
        if (!todayRecords.length) return null;
        const sums = {};
        todayRecords.forEach(r => (sums[r.parca_ad] = (sums[r.parca_ad] || 0) + r.adet));
        const [part, total] = Object.entries(sums).sort((a, b) => b[1] - a[1])[0] || [];
        return part ? { part, total } : null;
    }, [todayRecords]);

    const dailyTopOperator = useMemo(() => {
        if (!todayRecords.length) return null;
        const sums = {};
        todayRecords.forEach(r => (sums[r.operator] = (sums[r.operator] || 0) + r.adet));
        const [name, total] = Object.entries(sums).sort((a, b) => b[1] - a[1])[0] || [];
        return name ? { name, total } : null;
    }, [todayRecords]);

    const dailyTopSorumlu = useMemo(() => {
        if (!todayRecords.length) return null;
        const sums = {};
        todayRecords.forEach(r => (sums[r.supervisor] = (sums[r.supervisor] || 0) + r.adet));
        const [name, total] = Object.entries(sums).sort((a, b) => b[1] - a[1])[0] || [];
        return name ? { name, total } : null;
    }, [todayRecords]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-700 dark:text-gray-200">
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6 p-4">
                {[
                    { label: "Toplam Kayıt", value: totalCount },
                    { label: "Bugünkü Kayıt", value: todayCount },
                    { label: "Günlük Toplam Adet", value: dailyTotalAdet },
                    { label: "Günlük En Çok Parça", value: dailyTopPart ? `${dailyTopPart.part} (${dailyTopPart.total})` : "Yok" },
                    { label: "Operatör", value: dailyTopOperator ? `${dailyTopOperator.name} (${dailyTopOperator.total})` : "Yok" },
                    { label: "Sorumlu", value: dailyTopSorumlu ? `${dailyTopSorumlu.name} (${dailyTopSorumlu.total})` : "Yok" }
                ].map((card, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-gray-800 dark:text-gray-100">
                        <h3 className="text-lg text-blue-700 dark:text-blue-300 font-semibold">{card.label}</h3>
                        <p className="text-lg mt-2">{card.value}</p>
                    </div>
                ))}

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col justify-end">
                    <h3 className="text-lg text-red-600 dark:text-red-400 font-semibold">Hızlı Ekranlar</h3>
                    <button
                        onClick={() => navigate("/add-record")}
                        className="mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                        Yeni Kayıt Ekle
                    </button>
                    <button
                        onClick={() => navigate("/records")}
                        className="mt-2 bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700"
                    >
                        Tüm Kayıtlar
                    </button>
                </div>
            </div>

            <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-800 dark:text-gray-100">
                <h3 className="text-xl font-semibold mb-4">Son 5 Üretim Kaydı</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                {["Parça", "Adet", "Vardiya", "Makine", "Operatör", "Sorumlu", "Tarih"].map(h => (
                                    <th key={h} className="px-4 py-2 uppercase font-medium">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {records.slice(0, 5).map((r, i) => (
                                <tr
                                    key={r.id}
                                    className={`${i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"} hover:bg-blue-50 dark:hover:bg-blue-900`}
                                >
                                    <td className="px-4 py-2">{r.parca_ad}</td>
                                    <td className="px-4 py-2">{r.adet}</td>
                                    <td className="px-4 py-2">{r.vardiya}</td>
                                    <td className="px-4 py-2">{r.makine}</td>
                                    <td className="px-4 py-2">{r.operator}</td>
                                    <td className="px-4 py-2">{r.supervisor}</td>
                                    <td className="px-4 py-2">{r.timestamp.toDate().toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        onClick={() => navigate("/records")}
                        className="mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Tüm Kayıtları Görüntüle
                    </button>
                </div>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <label className="font-medium">Parça:</label>
                    <select
                        value={selPart}
                        onChange={e => setSelPart(e.target.value)}
                        className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">Tüm Parçalar</option>
                        {parts.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <VardiyaBarChart selectedPart={selPart} />
                    <OperatorPieChart />
                </div>

                <div className="flex items-center gap-4">
                    <label className="font-medium">Periyot:</label>
                    <select
                        value={chartDays}
                        onChange={e => setChartDays(Number(e.target.value))}
                        className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
                    >
                        <option value={7}>Son 7 Gün</option>
                        <option value={30}>Son 1 Ay</option>
                        <option value={365}>Son 1 Yıl</option>
                        <option value={3650}>Son 5 Yıl</option>
                    </select>
                </div>

                <DailyProductionLineChart selectedPart={selPart} days={chartDays} />
            </div>
        </>
    );
}
