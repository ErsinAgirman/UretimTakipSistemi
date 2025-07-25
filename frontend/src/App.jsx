// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AddRecord from "./pages/AddRecord";
import RecordList from "./pages/RecordList";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import EditRecord from "./pages/EditRecord";
import RoleRoute from "./components/RoleRoute";
import UserManagement from "./pages/UserManagement";

function App() {
  return (
    <Router>
      <Routes>
        {/* Açık rotalar */}
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/records/:id/edit"
          element={
            <ProtectedRoute>
              <Layout><EditRecord /></Layout>
            </ProtectedRoute>
          }
        />



        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Korunan rotalar: önce ProtectedRoute, sonra Layout */}
        <Route
          path="/add-record"
          element={
            <ProtectedRoute>
              <Layout>
                <AddRecord />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <Layout>
                <RecordList />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Düzenleme sayfası Yetki isteyecek*/}
        <Route
          path="/edit/:id"
          element={
            <RoleRoute allowedRoles={["supervisor", "admin"]}>
              <Layout>
                <EditRecord />
              </Layout>
            </RoleRoute>
          }
        />

        {/* Protected + RoleRoute ile örnek kullanıcı yönetimi */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              {/* Yalnızca admin veya supervisor görebilsin */}
              <RoleRoute allowedRoles={["admin", "supervisor"]}>
                <UserManagement />
              </RoleRoute>
            </ProtectedRoute>
          }
        />


      </Routes>
    </Router>
  );
}

export default App;
