/* eslint-disable react-refresh/only-export-components */
// src/contexts/AuthContext.jsx
import React, {
    createContext,    // ← artık export edilecek
    useContext,
    useEffect,
    useState
} from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// ☆ AuthContext’i export et
export const AuthContext = createContext({
    user: null,   // firebaseUser
    role: null,   // firestore’daki users/{uid}.role
    loading: true,   // halen kontrol ediliyor mu?
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (fbUser) => {
            setUser(fbUser);
            if (fbUser) {
                const snap = await getDoc(doc(db, "users", fbUser.uid));
                setRole(snap.exists() ? snap.data().role : null);
            } else {
                setRole(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// ☆ useAuth hook’unu da export et
export function useAuth() {
    return useContext(AuthContext);
}
