import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import OnboardingFlow from "./pages/OnboardingFlow";
import Dashboard from "./pages/Dashboard";
import RewardsVault from "./pages/RewardsVault";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Layout from "./components/Layout";

// Sets data-theme on <html> and fires a brief accent flash when theme changes
function ThemeApplier() {
  const { user } = useAuth();
  const prevTheme = useRef(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const theme = user?.activeTheme;
    const next = theme && theme !== "default" ? theme : null;

    if (prevTheme.current !== null && prevTheme.current !== next) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    }
    prevTheme.current = next;

    if (next) {
      document.documentElement.setAttribute("data-theme", next);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [user?.activeTheme]);

  if (!flash) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        background: "var(--accent)",
        animation: "theme-flash 500ms ease forwards",
      }}
    />
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div className="spinner" />
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <ThemeApplier />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingFlow />
            </ProtectedRoute>
          }
        />
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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vault"
          element={
            <ProtectedRoute>
              <Layout>
                <RewardsVault />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
