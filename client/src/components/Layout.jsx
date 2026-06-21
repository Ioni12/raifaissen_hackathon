import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Star, Settings, Users } from "lucide-react";

const GableCross = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path
      d="M18 18 L82 82 M82 18 L18 82"
      stroke={color}
      strokeWidth="14"
      strokeLinecap="round"
    />
    <path
      d="M18 18 H38 V38"
      stroke={color}
      strokeWidth="14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M82 18 H62 V38"
      stroke={color}
      strokeWidth="14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 82 H38 V62"
      stroke={color}
      strokeWidth="14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M82 82 H62 V62"
      stroke={color}
      strokeWidth="14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TABS = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/vault", icon: Star, label: "Vault" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function Layout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-logo">
          <GableCross size={22} color="var(--accent-darker)" />
          <span style={{ letterSpacing: "0.01em", fontSize: "1rem" }}>
            Raiffeisen{" "}
            <span className="logo-accent" style={{ fontWeight: 900 }}>
              YOUTH
            </span>
          </span>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--accent-dim)",
              borderRadius: "var(--radius-full)",
              padding: "6px 12px",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.8rem",
              color: "var(--accent-darker)",
            }}
          >
            <Star size={14} />
            {user?.credits ?? 0}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="page-content" style={{ paddingBottom: 90 }}>
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              className={`bottom-nav-item${isActive ? " active" : ""}`}
              onClick={() => navigate(tab.path)}
            >
              <Icon size={20} className="bottom-nav-icon" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
