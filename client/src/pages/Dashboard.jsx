import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { getSkin } from "../config/skinConfig";
import {
  Bell,
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  Users,
  Flame,
  Trophy,
} from "lucide-react";

const GableCross = ({ size = 24, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 80 L50 20 L85 80"
      stroke={color}
      strokeWidth="14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M35 80 L50 52 L65 80"
      stroke={color}
      strokeWidth="14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const QUICK_ACTIONS = [
  {
    id: "kuik",
    icon: ArrowUpRight,
    label: "Transfer",
    action: "kuik",
  },
  {
    id: "topup",
    icon: CreditCard,
    label: "Top Up",
    action: "transaction",
  },
  {
    id: "savings",
    icon: PiggyBank,
    label: "Save",
    action: "savings",
  },
  {
    id: "invite",
    icon: Users,
    label: "Invite",
    action: "referral",
  },
];

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAction = async (actionType, label) => {
    if (loading) return;
    setLoading(actionType);
    try {
      const res = await api.post("/quests/action", { actionType });
      updateUser({
        credits: res.data.credits,
        currentStreak: res.data.currentStreak,
      });
      showToast(
        `${label} complete. +${actionType === "savings" ? 2 : actionType === "referral" ? 5 : 1} credit`,
      );
    } catch (err) {
      showToast("Action failed. Try again.");
    } finally {
      setLoading("");
    }
  };

  const skin = getSkin(user?.activeCardSkin);
  const cardTextColor = skin.text;

  return (
    <div style={styles.page} className="animate-fade-in">
      {toast && <div className="toast">{toast}</div>}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.greetingHi}>Hello</div>
          <div style={styles.greetingName}>
            {user?.name?.split(" ")[0] || "User"}
          </div>
        </div>
        <button style={styles.notifButton}>
          <Bell size={20} color="var(--text-primary)" />
        </button>
      </div>

      {/* Debit Card */}
      <div style={{ padding: "0 16px" }}>
        <div
          style={{
            ...styles.card,
            background: skin.bg,
            color: cardTextColor,
            boxShadow: skin.borderColor
              ? `0 0 0 2px ${skin.borderColor}, var(--shadow-md)`
              : "var(--shadow-md)",
          }}
        >
          <div style={styles.cardTop}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <GableCross size={22} color={cardTextColor} />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  letterSpacing: "0.06em",
                  opacity: 0.9,
                }}
              >
                YOUTH
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                opacity: 0.6,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: cardTextColor,
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: cardTextColor,
                  opacity: 0.3,
                  marginLeft: -8,
                }}
              />
            </div>
          </div>

          <div style={styles.cardBalance}>
            <div
              style={{
                fontSize: "0.7rem",
                opacity: 0.7,
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Available Balance
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              2,000{" "}
              <span style={{ fontSize: "1rem", fontWeight: 600 }}>ALL</span>
            </div>
          </div>

          <div style={styles.cardBottom}>
            <div>
              <div
                style={{
                  fontSize: "0.58rem",
                  opacity: 0.6,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Cardholder
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  marginTop: 2,
                }}
              >
                {user?.name}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.58rem",
                  opacity: 0.6,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Number
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  letterSpacing: "2px",
                  marginTop: 2,
                }}
              >
                •••• 2026
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <div style={styles.quickActions}>
          {QUICK_ACTIONS.map((qa) => {
            const IconComponent = qa.icon;
            return (
              <button
                key={qa.id}
                style={styles.quickAction}
                onClick={() => handleAction(qa.action, qa.label)}
                disabled={loading === qa.action}
              >
                <div style={styles.qaIcon}>
                  {loading === qa.action ? (
                    <div
                      className="spinner"
                      style={{
                        width: 18,
                        height: 18,
                        border: "2px solid var(--border)",
                        borderTopColor: "var(--accent)",
                      }}
                    />
                  ) : (
                    <IconComponent size={22} color="var(--text-primary)" />
                  )}
                </div>
                <div style={styles.qaLabel}>{qa.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ padding: "0 16px" }}>
        <div style={styles.statsRow}>
          <div style={styles.statChip}>
            <Flame size={18} color="var(--text-secondary)" />
            <div>
              <div style={styles.statChipVal}>
                {user?.currentStreak || 0} days
              </div>
              <div style={styles.statChipLabel}>Streak</div>
            </div>
          </div>
          <div style={styles.statChip}>
            <Trophy size={18} color="var(--text-secondary)" />
            <div>
              <div style={styles.statChipVal}>{user?.credits || 0}</div>
              <div style={styles.statChipLabel}>Credits</div>
            </div>
          </div>
          <div style={styles.statChip}>
            <Trophy size={18} color="var(--text-secondary)" />
            <div>
              <div style={styles.statChipVal}>
                {user?.unlockedCosmetics?.length || 0}
              </div>
              <div style={styles.statChipLabel}>Unlocks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Banner */}
      <div style={{ padding: "0 16px 100px" }}>
        <div style={styles.referralBanner}>
          <div>
            <div style={styles.referralTitle}>Invite Friends</div>
            <div style={styles.referralSub}>
              They join → you both get +5 credits
            </div>
            <div style={styles.referralCode}>{user?.referralCode}</div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{
              whiteSpace: "nowrap",
              flexShrink: 0,
              background: "rgba(0,0,0,0.1)",
              borderColor: "rgba(0,0,0,0.15)",
              color: "var(--text-on-accent)",
            }}
            onClick={() => {
              navigator.clipboard.writeText(user?.referralCode || "");
              showToast("Referral code copied!");
            }}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    background: "var(--bg-base)",
    minHeight: "100vh",
    paddingBottom: 80,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
  },
  greetingHi: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    fontWeight: 500,
  },
  greetingName: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1.4rem",
    color: "var(--text-primary)",
    marginTop: 2,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: "var(--radius-lg)",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  card: {
    borderRadius: "var(--radius-xl)",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  cardBalance: {
    marginBottom: 26,
  },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  section: {
    padding: "20px 16px 10px",
  },
  quickActions: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  quickAction: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 0",
  },
  qaIcon: {
    width: 52,
    height: 52,
    borderRadius: "var(--radius-lg)",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  },
  qaLabel: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.7rem",
    color: "var(--text-primary)",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginTop: 6,
  },
  statChip: {
    background: "var(--bg-surface)",
    borderRadius: "var(--radius-lg)",
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid var(--border)",
  },
  statChipVal: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "0.9rem",
    color: "var(--text-primary)",
  },
  statChipLabel: {
    fontSize: "0.65rem",
    color: "var(--text-muted)",
    fontWeight: 500,
    marginTop: 1,
  },
  referralBanner: {
    background: "var(--accent)",
    borderRadius: "var(--radius-lg)",
    padding: "16px",
    marginTop: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  referralTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "0.9rem",
    color: "var(--text-on-accent)",
  },
  referralSub: {
    fontSize: "0.7rem",
    color: "var(--text-on-accent)",
    opacity: 0.8,
    marginTop: 3,
    fontWeight: 500,
  },
  referralCode: {
    fontFamily: "monospace",
    fontWeight: 700,
    fontSize: "0.8rem",
    marginTop: 8,
    color: "var(--text-on-accent)",
    background: "rgba(0,0,0,0.1)",
    borderRadius: "var(--radius-sm)",
    padding: "4px 10px",
    display: "inline-block",
  },
};
