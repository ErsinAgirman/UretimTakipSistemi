// src/pages/UserManagement.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function UserManagement() {
    const { role: myRole } = useAuth();
    const { theme } = useTheme();
    // eslint-disable-next-line no-unused-vars
    const isDark = theme === "dark";
    const [users, setUsers] = useState([]);
    const roles = ["operator", "supervisor", "admin"];

    // Arama / filtre
    const [searchTerm, setSearchTerm] = useState("");
    // Sıralama
    const [sortField, setSortField] = useState("email");
    const [sortDir, setSortDir] = useState("asc");
    // Çoklu seçim
    const [selectedIds, setSelectedIds] = useState(new Set());
    // Tekil rol düzenleme için geçici state
    const [editedRoles, setEditedRoles] = useState({});
    // Aktif/pasif durumu tutar
    const [statuses, setStatuses] = useState({});

    // Firestore’dan kullanıcıları çek ve init değerlerini ayarla
    useEffect(() => {
        const fetchUsers = async () => {
            const snap = await getDocs(collection(db, "users"));
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setUsers(list);

            // EditedRoles ve statuses’i doldur
            const initRoles = {};
            const initStats = {};
            list.forEach((u) => {
                initRoles[u.id] = u.role;
                initStats[u.id] = u.active ?? true;
            });
            setEditedRoles(initRoles);
            setStatuses(initStats);
        };
        fetchUsers();
    }, []);

    // Tekil silme
    const handleDelete = async (uid) => {
        if (!window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?"))
            return;
        await deleteDoc(doc(db, "users", uid));
        setUsers((us) => us.filter((u) => u.id !== uid));
        setSelectedIds((s) => {
            const copy = new Set(s);
            copy.delete(uid);
            return copy;
        });
    };

    // Tekil rol kaydet
    const handleSaveRole = async (uid) => {
        const newRole = editedRoles[uid];
        if (!window.confirm(`Rolü "${newRole}" olarak onaylıyor musunuz?`)) return;
        await updateDoc(doc(db, "users", uid), { role: newRole });
        setUsers((us) =>
            us.map((u) => (u.id === uid ? { ...u, role: newRole } : u))
        );
        alert("Rol güncellendi.");
    };

    // Bulk rol güncelleme
    const handleBulkRoleUpdate = async () => {
        if (selectedIds.size === 0) return alert("Önce seçim yapın.");
        const newRole = prompt("Seçili kullanıcılara atanacak rol?");
        if (!roles.includes(newRole)) return;
        if (
            !window.confirm(
                `Seçili (${selectedIds.size}) kullanıcıyı "${newRole}" rolüne atamak istiyor musunuz?`
            )
        )
            return;
        for (let uid of selectedIds) {
            await updateDoc(doc(db, "users", uid), { role: newRole });
        }
        setUsers((us) =>
            us.map((u) =>
                selectedIds.has(u.id) ? { ...u, role: newRole } : u
            )
        );
        setSelectedIds(new Set());
        alert("Toplu rol güncellendi.");
    };

    // Bulk silme
    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return alert("Önce seçim yapın.");
        if (
            !window.confirm(
                `Seçili (${selectedIds.size}) kullanıcıyı silmek istediğinize emin misiniz?`
            )
        )
            return;
        for (let uid of selectedIds) {
            await deleteDoc(doc(db, "users", uid));
        }
        setUsers((us) => us.filter((u) => !selectedIds.has(u.id)));
        setSelectedIds(new Set());
        alert("Toplu silme tamamlandı.");
    };

    // Aktif/pasif toggle
    const handleToggleActive = async (uid) => {
        const newStat = !statuses[uid];
        await updateDoc(doc(db, "users", uid), { active: newStat });
        setStatuses((s) => ({ ...s, [uid]: newStat }));
    };

    // Filtre + sıralama
    const filteredSorted = useMemo(() => {
        return users
            .filter(
                (u) =>
                    u.email.includes(searchTerm) || u.role.includes(searchTerm)
            )
            .sort((a, b) => {
                const aVal = (a[sortField] || "").toString();
                const bVal = (b[sortField] || "").toString();
                return sortDir === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            });
    }, [users, searchTerm, sortField, sortDir]);

    return (
        <Layout>
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Kullanıcı Yönetimi</h2>

                {/* Arama */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="E‑posta veya rol ara"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                </div>

                {/* Bulk butonlar */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={handleBulkRoleUpdate}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                        Toplu Rol Güncelle
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                        Toplu Sil
                    </button>
                </div>

                <div className="overflow-x-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow rounded">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2">
                                    <input
                                        type="checkbox"
                                        checked={
                                            filteredSorted.length > 0 &&
                                            selectedIds.size === filteredSorted.length
                                        }
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedIds(
                                                    new Set(filteredSorted.map((u) => u.id))
                                                );
                                            } else {
                                                setSelectedIds(new Set());
                                            }
                                        }}
                                    />
                                </th>
                                <th
                                    className="px-4 py-2 cursor-pointer"
                                    onClick={() => {
                                        setSortField("email");
                                        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                                    }}
                                >
                                    E‑posta{" "}
                                    {sortField === "email"
                                        ? sortDir === "asc"
                                            ? "▲"
                                            : "▼"
                                        : ""}
                                </th>
                                <th className="px-4 py-2">Rol</th>
                                <th className="px-4 py-2">Durum</th>
                                <th className="px-4 py-2">Aksiyon</th>
                                <th className="px-4 py-2">Onayla</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSorted.map((u) => (
                                <tr key={u.id} className="border-b border-gray-200 dark:border-gray-700">
                                    {/* Checkbox */}
                                    <td className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(u.id)}
                                            onChange={(e) => {
                                                const s = new Set(selectedIds);
                                                e.target.checked ? s.add(u.id) : s.delete(u.id);
                                                setSelectedIds(s);
                                            }}
                                        />
                                    </td>

                                    {/* E‑posta */}
                                    <td className="px-4 py-2">{u.email}</td>

                                    {/* Rol düzenleme + badge */}
                                    <td className="px-4 py-2 flex items-center gap-2">
                                        <select
                                            value={editedRoles[u.id] || u.role}
                                            onChange={(e) =>
                                                setEditedRoles((p) => ({
                                                    ...p,
                                                    [u.id]: e.target.value,
                                                }))
                                            }
                                            className="border p-1 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            disabled={u.id === myRole}
                                        >
                                            {roles.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${u.role === "admin"
                                                ? "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                : u.role === "supervisor"
                                                    ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                                    : "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100"
                                                }`}
                                        >
                                            {u.role}
                                        </span>
                                    </td>

                                    {/* Durum toggle */}
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => handleToggleActive(u.id)}
                                            className={`px-2 py-1 rounded ${statuses[u.id]
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                                : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                                }`}
                                        >
                                            {statuses[u.id] ? "Aktif" : "Pasif"}
                                        </button>
                                    </td>

                                    {/* Sil */}
                                    <td className="px-4 py-2">
                                        {u.role !== "admin" && (
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="text-red-600 dark:text-red-400 hover:underline"
                                            >
                                                Sil
                                            </button>
                                        )}
                                    </td>

                                    {/* Onayla */}
                                    <td className="px-4 py-2">
                                        {u.id !== myRole && (
                                            <button
                                                onClick={() => handleSaveRole(u.id)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                                            >
                                                Onayla
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
