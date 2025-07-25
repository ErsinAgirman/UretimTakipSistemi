import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    getDocs,
} from "firebase/firestore";

export default function AddRecord() {
    const [form, setForm] = useState({
        parca_ad: "",
        adet: "",
        makine: "",
        operator: "",
        supervisor: "",
        vardiya: "",
    });
    const [lists, setLists] = useState({
        parts: [],
        machines: [],
        operators: [],
        supervisors: [],
        shifts: [],
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchLists = async () => {
            const fetchCol = async (col) =>
                (await getDocs(query(collection(db, col), orderBy("name")))).docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }));
            const [parts, machines, operators, supervisors, shifts] = await Promise.all([
                fetchCol("parts"),
                fetchCol("machines"),
                fetchCol("operators"),
                fetchCol("supervisors"),
                fetchCol("shifts"),
            ]);
            setLists({ parts, machines, operators, supervisors, shifts });
        };
        fetchLists();
    }, []);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            await addDoc(collection(db, "records"), {
                ...form,
                adet: Number(form.adet),
                user: auth.currentUser.email,
                timestamp: serverTimestamp(),
            });
            setMessage("Kayıt başarılı");
            setForm({
                parca_ad: "",
                adet: "",
                makine: "",
                operator: "",
                supervisor: "",
                vardiya: "",
            });
        } catch (err) {
            console.error("Kayıt hatası:", err);
            setMessage("Kayıt eklenirken hata oluştu");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4">
            <div className="max-w-md w-full mx-auto mt-10 p-6 bg-white dark:bg-gray-900 shadow rounded-lg">
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
                    Yeni Üretim Kaydı
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Parça */}
                    <select
                        name="parca_ad"
                        value={form.parca_ad}
                        onChange={handleChange}
                        className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                    >
                        <option value="">Parça Seçiniz</option>
                        {lists.parts.map((p) => (
                            <option key={p.id} value={p.name}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    {/* Adet */}
                    <input
                        name="adet"
                        type="number"
                        placeholder="Adet"
                        value={form.adet}
                        onChange={handleChange}
                        className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                    />

                    {/* Makine */}
                    <select
                        name="makine"
                        value={form.makine}
                        onChange={handleChange}
                        className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                    >
                        <option value="">Makine Seçiniz</option>
                        {lists.machines.map((m) => (
                            <option key={m.id} value={m.name}>
                                {m.name}
                            </option>
                        ))}
                    </select>

                    {/* Operatör */}
                    <select
                        name="operator"
                        value={form.operator}
                        onChange={handleChange}
                        className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                    >
                        <option value="">Operatör Seçiniz</option>
                        {lists.operators.map((o) => (
                            <option key={o.id} value={o.name}>
                                {o.name}
                            </option>
                        ))}
                    </select>

                    {/* Sorumlu */}
                    <select
                        name="supervisor"
                        value={form.supervisor}
                        onChange={handleChange}
                        className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                    >
                        <option value="">Sorumlu Seçiniz</option>
                        {lists.supervisors.map((s) => (
                            <option key={s.id} value={s.name}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    {/* Vardiya */}
                    <select
                        name="vardiya"
                        value={form.vardiya}
                        onChange={handleChange}
                        className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                    >
                        <option value="">Vardiya Seçiniz</option>
                        {(lists.shifts || []).map((s) => (
                            <option key={s.id} value={s.name}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                    >
                        Kaydı Ekle
                    </button>
                </form>

                {message && (
                    <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
