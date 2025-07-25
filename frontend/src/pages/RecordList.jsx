// src/pages/RecordList.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    getDocs,
    doc,
    deleteDoc
} from "firebase/firestore";
import {
    startOfDay,
    startOfWeek,
    startOfMonth,
    startOfYear,
    format
} from "date-fns";
import { tr } from "date-fns/locale";
import ReportButtons from "../components/ReportButtons";

export default function RecordList() {
    const navigate = useNavigate();
    const tableRef = useRef(null);
    const pdfRef = useRef(null);
    const { role } = useAuth();

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        period: "all",
        operator: "all",
    });
    const [operators, setOperators] = useState([]);

    const handleDelete = async (id) => {
        if (!window.confirm("Bu kaydı silmek istediğine emin misin?")) return;
        await deleteDoc(doc(db, "records", id));
    };

    const handleEdit = (record) => {
        navigate(`/records/${record.id}/edit`);
    };

    useEffect(() => {
        const fetchOps = async () => {
            const snap = await getDocs(collection(db, "operators"));
            setOperators(snap.docs.map(d => d.data().name));
        };
        fetchOps();
    }, []);

    useEffect(() => {
        setLoading(true);
        const clauses = [];

        if (filter.period !== "all") {
            const now = new Date();
            let start;
            switch (filter.period) {
                case "day": start = startOfDay(now); break;
                case "week": start = startOfWeek(now, { weekStartsOn: 1 }); break;
                case "month": start = startOfMonth(now); break;
                case "year": start = startOfYear(now); break;
            }
            clauses.push(where("timestamp", ">=", start));
        }
        if (filter.operator !== "all") {
            clauses.push(where("operator", "==", filter.operator));
        }

        const q = query(
            collection(db, "records"),
            ...clauses,
            orderBy("timestamp", "desc")
        );

        const unsub = onSnapshot(
            q,
            snap => {
                setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            err => {
                console.error("Kayıtları çekerken hata:", err);
                setLoading(false);
            }
        );
        return unsub;
    }, [filter]);

    const groupedByWeek = useMemo(() => {
        return records.reduce((acc, rec) => {
            const weekStart = startOfWeek(rec.timestamp.toDate(), { weekStartsOn: 1 });
            const key = weekStart.getTime();
            if (!acc[key]) acc[key] = [];
            acc[key].push(rec);
            return acc;
        }, {});
    }, [records]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen dark:bg-black">
                <p className="text-lg text-gray-800 dark:text-white">Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 dark:bg-black min-h-screen text-gray-800 dark:text-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Üretim Kayıtları</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/add-record")}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        Kayıt Ekleme Ekranına Git
                    </button>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition"
                    >
                        Dashboard'a Git
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <select
                    value={filter.period}
                    onChange={e => setFilter(f => ({ ...f, period: e.target.value }))}
                    className="border p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
                >
                    <option value="all">Tüm Zaman</option>
                    <option value="day">Bugün</option>
                    <option value="week">Bu Hafta</option>
                    <option value="month">Bu Ay</option>
                    <option value="year">Bu Yıl</option>
                </select>
                <select
                    value={filter.operator}
                    onChange={e => setFilter(f => ({ ...f, operator: e.target.value }))}
                    className="border p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
                >
                    <option value="all">Tüm Operatörler</option>
                    {operators.map(op => (
                        <option key={op} value={op}>{op}</option>
                    ))}
                </select>
            </div>

            <div className="flex justify-between items-center mb-4">
                <p>
                    Toplam Kayıt: <span className="font-semibold">{records.length}</span>
                </p>
                <ReportButtons records={records} tableRef={pdfRef} />
            </div>

            <div ref={pdfRef} className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow space-y-4">
                <div className="flex items-center justify-between">
                    <img src="src/assets/logo.png" alt="Şahince Logo" className="h-12" />
                    <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                        Şahince Otomotiv Üretim Raporları
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date().toLocaleDateString("tr-TR")}
                    </p>
                </div>

                <div
                    ref={tableRef}
                    className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 dark:border-gray-700"
                >
                    <table className="min-w-full text-sm text-left text-gray-700 dark:text-white">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                {["Parça", "Adet", "Vardiya", "Makine", "Operatör", "Sorumlu", "Kullanıcı", "Tarih", "İşlem"].map(h => (
                                    <th key={h} className="px-6 py-3 uppercase font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupedByWeek)
                                .sort((a, b) => Number(b[0]) - Number(a[0]))
                                .map(([weekKey, items]) => {
                                    const weekStartDate = new Date(Number(weekKey));
                                    return (
                                        <React.Fragment key={weekKey}>
                                            <tr className="bg-indigo-100 dark:bg-indigo-800">
                                                <td colSpan={9} className="px-6 py-2 font-semibold text-indigo-800 dark:text-white">
                                                    {format(weekStartDate, "dd MMMM yyyy", { locale: tr })} haftası
                                                </td>
                                            </tr>
                                            {items.map((r, i) => (
                                                <tr
                                                    key={r.id}
                                                    className={`border-b transition-colors duration-150 ease-in-out
                    ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
                    hover:bg-blue-50 dark:hover:bg-blue-900`}
                                                >
                                                    <td className="px-6 py-4">{r.parca_ad}</td>
                                                    <td className="px-6 py-4">{r.adet}</td>
                                                    <td className="px-6 py-4">{r.vardiya}</td>
                                                    <td className="px-6 py-4">{r.makine}</td>
                                                    <td className="px-6 py-4">{r.operator}</td>
                                                    <td className="px-6 py-4">{r.supervisor}</td>
                                                    <td className="px-6 py-4">{r.user}</td>
                                                    <td className="px-6 py-4">
                                                        {r.timestamp.toDate().toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {["supervisor", "admin"].includes(role) && (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleEdit(r)}
                                                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                                                >
                                                                    Düzenle
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(r.id)}
                                                                    className="text-red-600 dark:text-red-400 hover:underline"
                                                                >
                                                                    Sil
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                {records.length === 0 && (
                    <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                        Kayıt bulunamadı.
                    </p>
                )}
            </div>
        </div>
    );
}
