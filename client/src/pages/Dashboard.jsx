import React, { useState } from "react";
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
  Snowflake,
  Wifi,
} from "lucide-react";

const GableCross = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
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
  { id: "kuik", icon: ArrowUpRight, label: "Transfer", action: "kuik" },
  { id: "topup", icon: CreditCard, label: "Top Up", action: "transaction" },
  { id: "savings", icon: PiggyBank, label: "Save", action: "savings" },
  { id: "invite", icon: Users, label: "Invite", action: "referral" },
];

// ── Flip Card ────────────────────────────────────────────────────────────────
function FlipCard({ user, skin }) {
  const [flipped, setFlipped] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const c = skin.text;

  const cardStyle = {
    borderRadius: "var(--radius-xl)",
    padding: "20px",
    position: "absolute",
    inset: 0,
    background: skin.bg,
    color: c,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    boxShadow: skin.borderColor
      ? `0 0 0 2px ${skin.borderColor}, 0 8px 32px rgba(0,0,0,0.18)`
      : "0 8px 32px rgba(0,0,0,0.14)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  return (
    <div
      onClick={() => setFlipped((f) => !f)}
      style={{
        width: "100%",
        aspectRatio: "1.586",
        cursor: "pointer",
        perspective: 1200,
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.45,0.05,0.55,0.95)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT ── */}
        <div style={cardStyle}>
          {/* Shimmer overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "var(--radius-xl)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          {/* Frozen overlay */}
          {frozen && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "var(--radius-xl)",
                background: "rgba(0,100,200,0.35)",
                backdropFilter: "blur(3px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Snowflake size={32} color="#fff" />
                <div
                  style={{
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    marginTop: 6,
                  }}
                >
                  Card Frozen
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GableCross size={20} color={c} />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "0.8rem",
                  letterSpacing: "0.08em",
                  opacity: 0.9,
                }}
              >
                YOUTH
              </span>
            </div>
            {/* Contactless icon */}
            <Wifi
              size={18}
              color={c}
              style={{ opacity: 0.6, transform: "rotate(90deg)" }}
            />
          </div>

          {/* EMV chip */}
          <div
            style={{
              width: 36,
              height: 28,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${c}55, ${c}22)`,
              border: `1px solid ${c}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 22,
                height: 16,
                borderRadius: 2,
                border: `0.5px solid ${c}60`,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
                padding: 2,
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{ background: `${c}40`, borderRadius: 1 }}
                />
              ))}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.62rem",
                opacity: 0.65,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              Available Balance
            </div>
            <div
              style={{
                fontSize: "1.9rem",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              2,000{" "}
              <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>ALL</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.5rem",
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
                  fontSize: "0.78rem",
                  marginTop: 2,
                }}
              >
                {user?.name}
              </div>
            </div>
            {/* Mastercard circles */}
            <div style={{ display: "flex" }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: c,
                  opacity: 0.55,
                }}
              />
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: c,
                  opacity: 0.35,
                  marginLeft: -10,
                }}
              />
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              opacity: 0.35,
              fontSize: "0.5rem",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.08em",
            }}
          >
            TAP TO SEE DETAILS
          </div>
        </div>

        {/* ── BACK ── */}
        <div style={{ ...cardStyle, transform: "rotateY(180deg)" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "var(--radius-xl)",
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.15) 0%, transparent 50%)",
              pointerEvents: "none",
            }}
          />

          {/* Magnetic stripe */}
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 0,
              right: 0,
              height: 40,
              background: `${c}25`,
              borderTop: `1px solid ${c}30`,
              borderBottom: `1px solid ${c}30`,
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                opacity: 0.7,
              }}
            >
              RAIFFEISEN YOUTH
            </span>
          </div>

          {/* Card number */}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <div
              style={{
                fontSize: "0.5rem",
                opacity: 0.6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              Card Number
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "1.05rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
              }}
            >
              4242 4242 4242 2026
            </div>
          </div>

          {/* CVV + Expiry */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: 4,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.48rem",
                  opacity: 0.6,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                Expires
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                12/28
              </div>
            </div>
            <div style={{ width: 1, background: `${c}30` }} />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.48rem",
                  opacity: 0.6,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                CVV
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                •••
              </div>
            </div>
          </div>

          {/* Freeze toggle */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setFrozen((f) => !f);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: frozen ? "rgba(0,100,200,0.35)" : `${c}18`,
              border: `1px solid ${frozen ? "rgba(100,180,255,0.6)" : c + "40"}`,
              borderRadius: "var(--radius-full)",
              padding: "8px 20px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Snowflake size={14} color={frozen ? "#60c0ff" : c} />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.72rem",
                color: frozen ? "#60c0ff" : c,
              }}
            >
              {frozen ? "Unfreeze Card" : "Freeze Card"}
            </span>
          </div>

          <div
            style={{
              textAlign: "center",
              opacity: 0.35,
              fontSize: "0.5rem",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.08em",
            }}
          >
            TAP TO FLIP BACK
          </div>
        </div>
      </div>
    </div>
  );
}

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

      {/* Flip Card */}
      <div style={{ padding: "0 16px" }}>
        <FlipCard user={user} skin={skin} />
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
