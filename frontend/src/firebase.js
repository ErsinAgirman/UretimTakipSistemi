// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrm2A82N-cJVevqmz8gQiMHKnbn5OKLFM",
  authDomain: "sahinceproje.firebaseapp.com",
  projectId: "sahinceproje",
  storageBucket: "sahinceproje.firebasestorage.app",
  messagingSenderId: "344515758377",
  appId: "1:344515758377:web:b2fca8fa9298dc658fcf38",
  measurementId: "G-HD9Q4YBNP9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);