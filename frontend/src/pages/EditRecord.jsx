// src/pages/EditRecord.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs
} from "firebase/firestore";
import { db } from "../firebase";

export default function EditRecord() {
    const { id } = useParams();
    const nav = useNavigate();

    const [form, setForm] = useState({
        parca_ad: "",
        adet: 0,
        vardiya: "",
        makine: "",
        operator: "",
        supervisor: ""
    });

    const [partsList, setPartsList] = useState([]);
    const [operatorsList, setOperatorsList] = useState([]);
    const [supervisorsList, setSupervisorsList] = useState([]);
    const [machinesList, setMachinesList] = useState([]);
    const [shiftsList, setShiftsList] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            const [partsSnap, opsSnap, supSnap, machSnap, shiftSnap] =
                await Promise.all([
                    getDocs(collection(db, "parts")),
                    getDocs(collection(db, "operators")),
                    getDocs(collection(db, "supervisors")),
                    getDocs(collection(db, "machines")),
                    getDocs(collection(db, "shifts"))
                ]);

            setPartsList(partsSnap.docs.map(d => d.data().name));
            setOperatorsList(opsSnap.docs.map(d => d.data().name));
            setSupervisorsList(supSnap.docs.map(d => d.data().name));
            setMachinesList(machSnap.docs.map(d => d.data().name));
            setShiftsList(shiftSnap.docs.map(d => d.data().name));
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        const load = async () => {
            const snap = await getDoc(doc(db, "records", id));
            if (snap.exists()) {
                const data = snap.data();
                setForm({
                    parca_ad: data.parca_ad || "",
                    adet: data.adet || 0,
                    vardiya: data.vardiya || "",
                    makine: data.makine || "",
                    operator: data.operator || "",
                    supervisor: data.supervisor || ""
                });
            } else {
                nav("/records", { replace: true });
            }
        };
        if (id) load();
    }, [id, nav]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateDoc(doc(db, "records", id), {
            parca_ad: form.parca_ad,
            adet: Number(form.adet),
            vardiya: form.vardiya,
            makine: form.makine,
            operator: form.operator,
            supervisor: form.supervisor
        });
        nav("/records");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mt-8 bg-white dark:bg-gray-900 p-6 rounded shadow text-gray-900 dark:text-white"
        >
            <h2 className="text-2xl mb-6">Kaydı Düzenle</h2>

            {/* Parça Adı */}
            <label className="block mb-4">
                Parça Adı
                <select
                    name="parca_ad"
                    value={form.parca_ad}
                    onChange={handleChange}
                    className="w-full border p-2 rounded mt-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                >
                    <option value="">Seçiniz</option>
                    {partsList.map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </label>

            {/* Adet */}
            <label className="block mb-4">
                Adet
                <input
                    type="number"
                    name="adet"
                    value={form.adet}
                    onChange={handleChange}
                    className="w-full border p-2 rounded mt-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                />
            </label>

            {/* Vardiya */}
            <label className="block mb-4">
                Vardiya
                <select
                    name="vardiya"
                    value={form.vardiya}
                    onChange={handleChange}
                    className="w-full border p-2 rounded mt-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                >
                    <option value="">Seçiniz</option>
                    {shiftsList.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </label>

            {/* Makine */}
            <label className="block mb-4">
                Makine
                <select
                    name="makine"
                    value={form.makine}
                    onChange={handleChange}
                    className="w-full border p-2 rounded mt-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                >
                    <option value="">Seçiniz</option>
                    {machinesList.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </label>

            {/* Operatör */}
            <label className="block mb-4">
                Operatör
                <select
                    name="operator"
                    value={form.operator}
                    onChange={handleChange}
                    className="w-full border p-2 rounded mt-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                >
                    <option value="">Seçiniz</option>
                    {operatorsList.map(o => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
            </label>

            {/* Sorumlu */}
            <label className="block mb-6">
                Sorumlu
                <select
                    name="supervisor"
                    value={form.supervisor}
                    onChange={handleChange}
                    className="w-full border p-2 rounded mt-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                >
                    <option value="">Seçiniz</option>
                    {supervisorsList.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </label>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
                Kaydet
            </button>
        </form>
    );
}
