import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getSkin } from "../config/skinConfig";
import {
  LogOut,
  User,
  CreditCard,
  Palette,
  Trophy,
  ChevronRight,
  Shield,
  Bell,
} from "lucide-react";

const THEME_LABELS = {
  theme_chromatic: "Chromatic",
  theme_neon_city: "Neon City",
  theme_volcanic: "Volcanic",
  theme_arctic: "Arctic",
  theme_sakura: "Sakura",
  legendary_pyramid: "Pyramid",
};

const THEME_ACCENTS = {
  theme_chromatic: "linear-gradient(90deg,#ff0080,#ff8c00,#40e0d0,#7b68ee)",
  theme_neon_city: "#00e5ff",
  theme_volcanic: "#ff4d2e",
  theme_arctic: "#7dd3fc",
  theme_sakura: "#f472b6",
  legendary_pyramid: "#d4af37",
};

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const skin = getSkin(user?.activeCardSkin);
  const themeId = user?.activeTheme;
  const themeLabel = THEME_LABELS[themeId] || "Default";
  const themeAccent = THEME_ACCENTS[themeId] || "var(--accent)";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={S.page}>
      {/* Profile hero */}
      <div style={S.hero}>
        <div
          style={{
            ...S.avatar,
            background:
              typeof themeAccent === "string" &&
              themeAccent.startsWith("linear")
                ? themeAccent
                : `${themeAccent}30`,
            border: `2px solid ${typeof themeAccent === "string" && themeAccent.startsWith("linear") ? "var(--accent)" : themeAccent}`,
          }}
        >
          <span style={S.avatarLetter}>
            {user?.name?.[0]?.toUpperCase() || "?"}
          </span>
        </div>
        <div>
          <div style={S.heroName}>{user?.name}</div>
          <div style={S.heroEmail}>{user?.email}</div>
          <div style={S.heroCohort}>{user?.cohort}</div>
        </div>
      </div>

      {/* Active cosmetics */}
      <div style={S.section}>
        <div style={S.sectionLabel}>Active Style</div>

        {/* Card skin preview */}
        <div style={S.row} onClick={() => navigate("/vault")}>
          <div
            style={{
              ...S.rowIcon,
              background: skin.bg,
              boxShadow: skin.borderColor
                ? `0 0 0 1.5px ${skin.borderColor}`
                : "none",
            }}
          >
            <CreditCard size={16} color={skin.text} />
          </div>
          <div style={S.rowInfo}>
            <div style={S.rowTitle}>Card Skin</div>
            <div style={S.rowSub}>
              {user?.activeCardSkin?.replace(/_/g, " ") || "Default"}
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>

        {/* Theme preview */}
        <div style={S.row} onClick={() => navigate("/vault")}>
          <div
            style={{
              ...S.rowIcon,
              background:
                typeof themeAccent === "string" &&
                themeAccent.startsWith("linear")
                  ? themeAccent
                  : `${themeAccent}25`,
              border: `1px solid ${typeof themeAccent === "string" && themeAccent.startsWith("linear") ? "transparent" : themeAccent + "66"}`,
            }}
          >
            <Palette
              size={16}
              color={
                typeof themeAccent === "string" &&
                themeAccent.startsWith("linear")
                  ? "#fff"
                  : themeAccent
              }
            />
          </div>
          <div style={S.rowInfo}>
            <div style={S.rowTitle}>App Theme</div>
            <div style={S.rowSub}>{themeLabel}</div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>
      </div>

      {/* Stats */}
      <div style={S.section}>
        <div style={S.sectionLabel}>Your Progress</div>
        <div style={S.statsGrid}>
          {[
            { label: "Credits", value: user?.credits ?? 0 },
            { label: "Unlocks", value: user?.unlockedCosmetics?.length ?? 0 },
            { label: "Streak", value: `${user?.currentStreak ?? 0}d` },
            { label: "Referral", value: user?.referralCode || "—" },
          ].map(({ label, value }) => (
            <div key={label} style={S.statBox}>
              <div style={S.statVal}>{value}</div>
              <div style={S.statLabel}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div style={S.section}>
        <div style={S.sectionLabel}>Account</div>
        {[
          { icon: User, label: "Profile", sub: "Name and email" },
          { icon: Bell, label: "Notifications", sub: "Push and in-app" },
          { icon: Shield, label: "Security", sub: "PIN and sessions" },
        ].map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            style={{ ...S.row, cursor: "default", opacity: 0.5 }}
          >
            <div style={S.rowIconPlain}>
              <Icon size={17} color="var(--text-secondary)" />
            </div>
            <div style={S.rowInfo}>
              <div style={S.rowTitle}>{label}</div>
              <div style={S.rowSub}>{sub}</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        ))}
      </div>

      {/* Logout */}
      <div style={S.section}>
        {!confirmLogout ? (
          <button
            className="btn btn-ghost btn-full"
            style={{ color: "#ef4444", borderColor: "#ef444430" }}
            onClick={() => setConfirmLogout(true)}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        ) : (
          <div style={S.confirmBox}>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Sign out of your account?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-ghost btn-full"
                style={{ flex: 1 }}
                onClick={() => setConfirmLogout(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-full"
                style={{ flex: 1, background: "#ef4444", color: "#fff" }}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}

const S = {
  page: { width: "100%", padding: "20px 16px 100px" },
  hero: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-xl)",
    padding: "20px",
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarLetter: {
    fontFamily: "var(--font-display)",
    fontWeight: 900,
    fontSize: "1.4rem",
    color: "var(--accent)",
  },
  heroName: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1.1rem",
    color: "var(--text-primary)",
  },
  heroEmail: {
    fontSize: "0.78rem",
    color: "var(--text-secondary)",
    marginTop: 2,
  },
  heroCohort: {
    fontSize: "0.68rem",
    color: "var(--accent)",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    marginTop: 4,
  },
  section: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "16px",
    marginBottom: 14,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  sectionLabel: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--text-muted)",
    marginBottom: 8,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 0",
    cursor: "pointer",
    borderBottom: "1px solid var(--border)",
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowIconPlain: {
    width: 36,
    height: 36,
    borderRadius: "var(--radius-md)",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowInfo: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.88rem",
    color: "var(--text-primary)",
  },
  rowSub: {
    fontSize: "0.72rem",
    color: "var(--text-muted)",
    marginTop: 1,
    textTransform: "capitalize",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 4,
  },
  statBox: {
    background: "var(--bg-elevated)",
    borderRadius: "var(--radius-md)",
    padding: "12px",
    textAlign: "center",
  },
  statVal: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1.1rem",
    color: "var(--text-primary)",
  },
  statLabel: {
    fontSize: "0.65rem",
    color: "var(--text-muted)",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  confirmBox: {
    background: "var(--bg-elevated)",
    borderRadius: "var(--radius-md)",
    padding: "16px",
    marginTop: 4,
  },
};
