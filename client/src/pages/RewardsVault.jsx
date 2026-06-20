import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import RewardReveal from "../components/RewardReveal";
import MultiPullReveal from "../components/MultiPullReveal";
import { getSkin } from "../config/skinConfig";
import {
  Trophy,
  CreditCard,
  Palette,
  Lock,
  Check,
  Film,
  Phone,
  ShoppingBag,
  Star,
} from "lucide-react";

// ── Skin definitions (full visual data) ──────────────────────────────────────
const SKIN_DEF = {
  default: {
    bg: "linear-gradient(135deg, #FFD600 0%, #E6B800 100%)",
    text: "#0d111c",
    accent: "#0d111c",
  },
  skin_navy: {
    bg: "linear-gradient(135deg, #1E3A5F 0%, #0a1628 100%)",
    text: "#ffffff",
    accent: "#4da6ff",
  },
  skin_midnight: {
    bg: "linear-gradient(135deg, #2d2d44 0%, #1c1c2e 100%)",
    text: "#ffffff",
    accent: "#a78bfa",
  },
  skin_forest: {
    bg: "linear-gradient(135deg, #1a4a2e 0%, #0d2818 100%)",
    text: "#ffffff",
    accent: "#4ade80",
  },
  skin_crimson: {
    bg: "linear-gradient(135deg, #7a1515 0%, #2d0a0a 100%)",
    text: "#ffffff",
    accent: "#f87171",
  },
  border_neon: {
    bg: "linear-gradient(135deg, #0a2a2a 0%, #0d1f1f 100%)",
    text: "#00e5ff",
    accent: "#00e5ff",
    border: "#00e5ff",
  },
  border_gold_wave: {
    bg: "linear-gradient(135deg, #1c1600 0%, #1a1400 100%)",
    text: "#d4af37",
    accent: "#d4af37",
    border: "#d4af37",
  },
  border_aurora: {
    bg: "linear-gradient(135deg, #0d0a2e 0%, #1a0a3e 100%)",
    text: "#ffffff",
    accent: "#7b68ee",
    border: "linear-gradient(90deg,#7b68ee,#40e0d0)",
  },
  skin_holographic: {
    bg: "linear-gradient(135deg, #ff0080 0%, #00e5ff 50%, #ff8c00 100%)",
    text: "#ffffff",
    accent: "#ffffff",
  },
};

// ── Theme definitions ─────────────────────────────────────────────────────────
const THEME_DEF = {
  theme_chromatic: {
    bg: "#0a0a12",
    surface: "#12121e",
    accent: "#7b68ee",
    accentGrad: "linear-gradient(45deg,#ff0080,#ff8c00,#40e0d0,#7b68ee)",
    text: "#ffffff",
    sub: "#9ca3af",
  },
  theme_neon_city: {
    bg: "#050816",
    surface: "#0b1020",
    accent: "#00e5ff",
    text: "#f9fafb",
    sub: "#6b7280",
  },
  theme_volcanic: {
    bg: "#140806",
    surface: "#1c0c09",
    accent: "#ff4d2e",
    text: "#fef2f2",
    sub: "#b91c1c",
  },
  theme_arctic: {
    bg: "#f0f9ff",
    surface: "#ffffff",
    accent: "#7dd3fc",
    text: "#0c4a6e",
    sub: "#0369a1",
  },
  theme_sakura: {
    bg: "#fdf2f8",
    surface: "#ffffff",
    accent: "#f472b6",
    text: "#831843",
    sub: "#9d174d",
  },
  legendary_pyramid: {
    bg: "#111111",
    surface: "#1e1e1e",
    accent: "#d4af37",
    text: "#f5f5f0",
    sub: "#9e9e96",
  },
};

// ── Mini card preview (looks like the real dashboard card) ────────────────────
function MiniCard({ skinId, name = "••••", isActive }) {
  const def = SKIN_DEF[skinId] || SKIN_DEF.default;
  const hasBorder = def.border;
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1.586",
        borderRadius: 8,
        background: def.bg,
        padding: "10px 12px 8px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        boxShadow: isActive
          ? `0 0 0 2px ${typeof def.accent === "string" ? def.accent : "#fff"}`
          : "none",
        outline: hasBorder
          ? `1.5px solid ${typeof def.border === "string" && !def.border.startsWith("linear") ? def.border : "transparent"}`
          : "none",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Subtle chip shine */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background:
            "linear-gradient(180deg,rgba(255,255,255,0.07) 0%,transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top row */}
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
            fontSize: "0.55rem",
            letterSpacing: "0.08em",
            color: def.text,
            opacity: 0.9,
          }}
        >
          YOUTH
        </span>
        {/* Mastercard circles */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: def.text,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: def.text,
              opacity: 0.3,
              marginLeft: -4,
            }}
          />
        </div>
      </div>

      {/* Chip */}
      <div
        style={{
          width: 14,
          height: 10,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${def.text}40, ${def.text}20)`,
          border: `0.5px solid ${def.text}40`,
        }}
      />

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.5rem",
            color: def.text,
            opacity: 0.75,
            letterSpacing: "1.5px",
          }}
        >
          •••• 2026
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.45rem",
            color: def.text,
            opacity: 0.7,
          }}
        >
          {name}
        </span>
      </div>
    </div>
  );
}

// ── Mini theme mockup (looks like a phone screen) ─────────────────────────────
function ThemeMockup({ themeId, isActive }) {
  const def = THEME_DEF[themeId] || {
    bg: "#f6f7fb",
    surface: "#ffffff",
    accent: "#ffd600",
    text: "#0d111c",
    sub: "#4b5563",
  };
  const isChromatic = themeId === "theme_chromatic";
  const accentBg = isChromatic && def.accentGrad ? def.accentGrad : def.accent;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: def.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Fake status bar */}
      <div
        style={{
          height: 6,
          background: def.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: 6,
          gap: 2,
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: def.sub,
              opacity: 0.5,
            }}
          />
        ))}
      </div>

      {/* Fake card */}
      <div
        style={{
          margin: "5px 8px 4px",
          borderRadius: 5,
          background:
            def.surface === "#ffffff" ? def.accent + "22" : def.surface,
          border: `0.5px solid ${def.accent}44`,
          padding: "5px 6px",
        }}
      >
        <div
          style={{
            fontSize: "0.35rem",
            color: def.sub,
            fontFamily: "var(--font-display)",
            marginBottom: 2,
          }}
        >
          Balance
        </div>
        <div
          style={{
            fontSize: "0.6rem",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            color: def.text,
          }}
        >
          2,000 ALL
        </div>
        <div
          style={{
            marginTop: 3,
            height: 1.5,
            width: 16,
            borderRadius: 2,
            background: accentBg,
          }}
        />
      </div>

      {/* Fake buttons row */}
      <div style={{ display: "flex", gap: 3, margin: "0 8px" }}>
        {["Send", "Save", "Invite"].map((label) => (
          <div
            key={label}
            style={{
              flex: 1,
              background: accentBg,
              borderRadius: 3,
              padding: "2px 0",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.3rem",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                color: isChromatic ? "#fff" : def.bg,
                letterSpacing: "0.03em",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Fake bottom nav */}
      <div
        style={{
          marginTop: "auto",
          height: 10,
          background: def.surface,
          borderTop: `0.5px solid ${def.accent}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 8px",
        }}
      >
        {[1, 2, 3, 4].map((i, idx) => (
          <div
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: idx === 0 ? def.accent : def.sub,
              opacity: idx === 0 ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      {isActive && (
        <div
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            background: def.accent,
            borderRadius: 3,
            padding: "1px 4px",
            fontSize: "0.3rem",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            color: def.bg,
          }}
        >
          ✓ ON
        </div>
      )}
    </div>
  );
}

const RewardsVault = () => {
  const { user, updateUser } = useAuth();
  const [vaultData, setVaultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealActive, setRevealActive] = useState(false);
  const [revealReward, setRevealReward] = useState(null);
  const [multiRevealActive, setMultiRevealActive] = useState(false);
  const [multiResults, setMultiResults] = useState([]);
  const [toast, setToast] = useState("");
  const [currentPool, setCurrentPool] = useState("app"); // 'app' or 'coupons'

  const fetchVault = async () => {
    try {
      const res = await api.get("/gacha/vault");
      setVaultData(res.data);
      updateUser({
        credits: res.data.credits,
        pityCounterApp: res.data.pityCounterApp,
        pityCounterCoupons: res.data.pityCounterCoupons,
        totalPullsApp: res.data.totalPullsApp,
        totalPullsCoupons: res.data.totalPullsCoupons,
        unlockedCosmetics: res.data.unlockedCosmetics,
        unlockedCoupons: res.data.unlockedCoupons,
      });
    } catch (err) {
      console.error(err);
      showToastMessage("Failed to fetch vault details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  const showToastMessage = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const performPull = async (pool) => {
    try {
      const res = await api.post("/gacha/pull", { pool });
      updateUser({
        credits: res.data.credits,
        pityCounterApp: res.data.pityApp,
        pityCounterCoupons: res.data.pityCoupons,
        totalPullsApp: res.data.totalPullsApp,
        totalPullsCoupons: res.data.totalPullsCoupons,
      });
      setRevealReward({
        ...res.data.cosmetic,
        tier: res.data.tier,
      });
      setRevealActive(true);
    } catch (err) {
      console.error(err);
      showToastMessage(
        err.response?.data?.message || "Failed to perform pull.",
      );
    }
  };

  const performMultiPull = async (pool) => {
    try {
      const res = await api.post("/gacha/pull-multi", { pool });
      updateUser({
        credits: res.data.credits,
        pityCounterApp: res.data.pityApp,
        pityCounterCoupons: res.data.pityCoupons,
        totalPullsApp: res.data.totalPullsApp,
        totalPullsCoupons: res.data.totalPullsCoupons,
      });
      setMultiResults(res.data.results);
      setMultiRevealActive(true);
    } catch (err) {
      console.error(err);
      showToastMessage(
        err.response?.data?.message || "Failed to perform multi-pull.",
      );
    }
  };

  const applyCosmetic = async (type, id) => {
    try {
      const res = await api.post("/auth/cosmetic", { type, id });
      updateUser({
        activeTheme: res.data.activeTheme,
        activeCardSkin: res.data.activeCardSkin,
      });
      showToastMessage(res.data.message);
    } catch (err) {
      console.error(err);
      showToastMessage(
        err.response?.data?.message || "Failed to apply cosmetic.",
      );
    }
  };

  const THEME_GRADIENTS = {
    theme_chromatic:
      "linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #7b68ee)",
    theme_neon_city: "linear-gradient(135deg, #050816, #00e5ff)",
    theme_volcanic: "linear-gradient(135deg, #140806, #ff4d2e)",
    theme_arctic: "linear-gradient(135deg, #e0f2fe, #7dd3fc)",
    theme_sakura: "linear-gradient(135deg, #fdf2f8, #f472b6)",
    legendary_pyramid: "linear-gradient(135deg, #111111, #d4af37)",
  };

  const SKIN_GRADIENTS = {
    default: "linear-gradient(135deg, #1a1a1a, #3d3d3d)",
    skin_navy: "linear-gradient(135deg, #0a1628, #1e3a5f)",
    skin_midnight: "linear-gradient(135deg, #1c1c2e, #2d2d44)",
    skin_forest: "linear-gradient(135deg, #0d2818, #1a4a2e)",
    skin_crimson: "linear-gradient(135deg, #2d0a0a, #7a1515)",
    border_neon: "linear-gradient(135deg, #0a2a2a, #00e5ff)",
    border_gold_wave: "linear-gradient(135deg, #1a1400, #d4af37)",
    border_aurora: "linear-gradient(135deg, #0d0a2e, #7b68ee, #40e0d0)",
    skin_holographic: "linear-gradient(135deg, #ff0080, #00e5ff, #ff8c00)",
  };

  const getSwatchStyle = (cosmetic) => {
    const tierColor = getTierColor(cosmetic.tier);
    let background = "var(--bg-surface)";
    if (cosmetic.type === "theme" && THEME_GRADIENTS[cosmetic.id]) {
      background = THEME_GRADIENTS[cosmetic.id];
    } else if (cosmetic.type === "skin" && SKIN_GRADIENTS[cosmetic.id]) {
      background = SKIN_GRADIENTS[cosmetic.id];
    } else if (cosmetic.type === "coupon") {
      background = `linear-gradient(135deg, var(--bg-surface), ${tierColor}22)`;
    } else if (cosmetic.type === "badge") {
      background = `radial-gradient(circle, ${tierColor}33, var(--bg-surface))`;
    }
    return {
      width: "42px",
      height: "42px",
      borderRadius: cosmetic.type === "badge" ? "50%" : "var(--radius-sm)",
      background,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      border: `1px solid ${tierColor}44`,
      color: tierColor,
    };
  };

  const getSwatchIcon = (cosmetic) => {
    const icon = getIconForReward(cosmetic);
    return React.cloneElement(icon, { color: getTierColor(cosmetic.tier) });
  };

  const getIconForReward = (reward) => {
    if (!reward) return <Trophy size={20} />;
    switch (reward.type) {
      case "skin":
        return <CreditCard size={20} />;
      case "theme":
        return <Palette size={20} />;
      case "badge":
        return <Trophy size={20} />;
      case "coupon":
        switch (reward.brand) {
          case "Cineplex":
            return <Film size={20} />;
          case "Vodafone":
            return <Phone size={20} />;
          case "Zara":
            return <ShoppingBag size={20} />;
          default:
            return <Star size={20} />;
        }
      default:
        return <Trophy size={20} />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case "legendary":
        return "var(--tier-legendary)";
      case "ultra_rare":
        return "var(--tier-ultra)";
      case "rare":
        return "var(--tier-rare)";
      default:
        return "var(--tier-common)";
    }
  };

  const currentPity =
    currentPool === "app"
      ? (user?.pityCounterApp ?? 0)
      : (user?.pityCounterCoupons ?? 0);

  const currentTotalPulls =
    currentPool === "app"
      ? (user?.totalPullsApp ?? 0)
      : (user?.totalPullsCoupons ?? 0);

  const currentUnlocked =
    currentPool === "app"
      ? (user?.unlockedCosmetics ?? [])
      : (user?.unlockedCoupons ?? []);

  const allCosmetics = vaultData?.cosmeticsCatalog?.[currentPool] ?? [];

  // Skin/badge row — uses MiniCard preview for skins
  const renderCosmeticRow = (cosmetic) => {
    const isUnlocked =
      currentUnlocked.includes(cosmetic.id) || cosmetic.id === "default";
    const isActive =
      currentPool === "app" &&
      ((cosmetic.type === "skin" && user?.activeCardSkin === cosmetic.id) ||
        (cosmetic.type === "theme" && user?.activeTheme === cosmetic.id));
    const tierColor = getTierColor(cosmetic.tier);
    const isSkin = cosmetic.type === "skin";

    return (
      <div
        key={cosmetic.id}
        style={{
          ...styles.cosmeticCard,
          opacity: isUnlocked ? 1 : 0.4,
          borderColor: isActive
            ? "var(--accent)"
            : isUnlocked
              ? tierColor + "55"
              : "var(--border)",
          background: isActive ? "var(--accent-dim)" : "var(--bg-elevated)",
          cursor: currentPool === "app" && isUnlocked ? "pointer" : "default",
          boxShadow:
            isUnlocked &&
            (cosmetic.tier === "legendary" || cosmetic.tier === "ultra_rare")
              ? `0 0 14px ${tierColor}30`
              : "none",
          alignItems: isSkin ? "stretch" : "center",
        }}
        onClick={() => {
          if (currentPool === "app" && isUnlocked && cosmetic.type)
            applyCosmetic(cosmetic.type, cosmetic.id);
        }}
      >
        {/* Tier accent bar */}
        <div
          style={{
            width: "3px",
            alignSelf: "stretch",
            borderRadius: "4px",
            background: tierColor,
            flexShrink: 0,
          }}
        />

        {/* Preview: mini card for skins, swatch for others */}
        {isSkin ? (
          <div style={{ width: 72, flexShrink: 0, alignSelf: "center" }}>
            {isUnlocked ? (
              <MiniCard skinId={cosmetic.id} isActive={isActive} />
            ) : (
              <div
                style={{
                  width: 72,
                  aspectRatio: "1.586",
                  borderRadius: 6,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lock size={14} color="var(--text-muted)" />
              </div>
            )}
          </div>
        ) : (
          <div style={getSwatchStyle(cosmetic)}>
            {isUnlocked ? (
              getSwatchIcon(cosmetic)
            ) : (
              <Lock size={16} color="var(--text-muted)" />
            )}
          </div>
        )}

        {/* Info */}
        <div style={styles.cosmeticInfo}>
          <div style={styles.cosmeticName}>
            {cosmetic.brand ? `${cosmetic.brand} — ` : ""}
            {cosmetic.label}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "3px",
            }}
          >
            <span
              style={{
                fontSize: "0.62rem",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: tierColor,
                background: tierColor + "18",
                padding: "2px 7px",
                borderRadius: "var(--radius-full)",
              }}
            >
              {cosmetic.tier.replace("_", " ")}
            </span>
          </div>
          {cosmetic.description && (
            <div style={styles.cosmeticDesc}>{cosmetic.description}</div>
          )}
        </div>

        {/* Action */}
        {isUnlocked ? (
          isActive ? (
            <span style={styles.activeCheck}>
              <Check
                size={13}
                style={{ display: "inline", marginRight: "3px" }}
              />
              Active
            </span>
          ) : currentPool === "app" ? (
            <span style={styles.inactiveApply}>Apply</span>
          ) : (
            <span style={styles.activeCheck}>
              <Check
                size={13}
                style={{ display: "inline", marginRight: "3px" }}
              />
              Got it
            </span>
          )
        ) : null}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div
          style={{ display: "flex", justifyContent: "center", padding: "60px" }}
        >
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {toast && <div className="toast">{toast}</div>}

      {/* Multi-pull reveal */}
      {multiRevealActive && multiResults.length > 0 && (
        <MultiPullReveal
          results={multiResults}
          onClose={() => {
            setMultiRevealActive(false);
            setMultiResults([]);
            fetchVault();
          }}
        />
      )}

      {/* Single reveal modal */}
      {revealActive && revealReward && (
        <div style={styles.revealOverlay}>
          <div
            style={styles.revealFullModal}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={styles.revealHeadline}>You Unlocked a Reward!</p>
            <RewardReveal
              tier={revealReward.tier}
              reward={revealReward}
              autoPlay={true}
              onComplete={() => {}}
            />
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: "20px" }}
              onClick={() => {
                setRevealActive(false);
                setRevealReward(null);
                fetchVault();
              }}
            >
              Add to Collection
            </button>
          </div>
        </div>
      )}

      {/* Header with Pool Tabs */}
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Rewards Vault</h1>
        <div style={styles.poolTabs}>
          <button
            className={`pool-tab ${currentPool === "app" ? "active" : ""}`}
            style={styles.poolTab}
            onClick={() => setCurrentPool("app")}
          >
            App Rewards
          </button>
          <button
            className={`pool-tab ${currentPool === "coupons" ? "active" : ""}`}
            style={styles.poolTab}
            onClick={() => setCurrentPool("coupons")}
          >
            Coupons
          </button>
        </div>
      </div>

      {/* Pull Section */}
      <div style={styles.pullSection}>
        <div style={styles.pullStats}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Credits</span>
            <span style={styles.statValue}>{user?.credits ?? 0}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Pity</span>
            <span style={styles.statValue}>{currentPity} / 100</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Total Pulls</span>
            <span style={styles.statValue}>{currentTotalPulls}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {/* Single pull */}
          <button
            className="btn btn-primary btn-full"
            style={{ flex: 1, fontSize: "0.95rem", padding: "14px 8px" }}
            onClick={() => performPull(currentPool)}
            disabled={!user?.credits || user?.credits < 1}
          >
            ✦ 1 Pull
            <span
              style={{
                fontSize: "0.72rem",
                opacity: 0.7,
                display: "block",
                marginTop: 2,
              }}
            >
              1 credit
            </span>
          </button>

          {/* 10-pull — styled as premium */}
          <button
            onClick={() => performMultiPull(currentPool)}
            disabled={!user?.credits || user?.credits < 10}
            style={{
              flex: 1.4,
              padding: "14px 8px",
              border: "none",
              borderRadius: "var(--radius-lg)",
              cursor: user?.credits >= 10 ? "pointer" : "not-allowed",
              opacity: user?.credits >= 10 ? 1 : 0.45,
              background: "linear-gradient(135deg, #7b68ee 0%, #d4af37 100%)",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "0.95rem",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.2s",
              boxShadow:
                user?.credits >= 10
                  ? "0 4px 20px rgba(123,104,238,0.4)"
                  : "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(108deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)",
                animation: "gacha-shimmer 2.5s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>✦ 10 Pulls</span>
            <span
              style={{
                fontSize: "0.72rem",
                opacity: 0.85,
                display: "block",
                marginTop: 2,
                position: "relative",
                zIndex: 1,
              }}
            >
              10 credits · guaranteed rare+
            </span>
          </button>
        </div>
      </div>

      {/* Customization Drawer */}
      <div style={styles.drawerSection}>
        <h2 style={styles.drawerTitle}>
          {currentPool === "app" ? "Your Customization" : "Your Coupons"}
        </h2>
        <p style={styles.drawerSubtitle}>
          {currentPool === "app"
            ? "Select and activate card skins or application themes you have unlocked."
            : "Your collection of unlocked coupons from the gacha pulls."}
        </p>

        <div style={styles.lockerSection}>
          {currentPool === "app" ? (
            <>
              {/* ── Card Skins & Badges ─────────────────────── */}
              {(() => {
                const skins = allCosmetics.filter(
                  (c) => c.type === "skin" || c.type === "badge",
                );
                return (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={styles.sectionHeader}>
                      <CreditCard size={14} color="var(--text-muted)" />
                      <h3 style={styles.lockerHeader}>
                        Card Skins &amp; Badges
                      </h3>
                    </div>
                    <div style={styles.lockerScrollable}>
                      {skins.map((cosmetic) => renderCosmeticRow(cosmetic))}
                    </div>
                  </div>
                );
              })()}

              {/* ── Themes ──────────────────────────────────── */}
              {(() => {
                const themes = allCosmetics.filter((c) => c.type === "theme");
                return (
                  <div>
                    <div style={styles.sectionHeader}>
                      <Palette size={14} color="var(--text-muted)" />
                      <h3 style={styles.lockerHeader}>App Themes</h3>
                    </div>
                    <div style={styles.themesGrid}>
                      {themes.map((cosmetic) => {
                        const isUnlocked =
                          currentUnlocked.includes(cosmetic.id) ||
                          cosmetic.id === "default";
                        const isActive =
                          cosmetic.type === "theme" &&
                          user?.activeTheme === cosmetic.id;
                        const tierColor = getTierColor(cosmetic.tier);

                        return (
                          <div
                            key={cosmetic.id}
                            style={{
                              ...styles.themeCard,
                              opacity: isUnlocked ? 1 : 0.45,
                              border: `1.5px solid ${isActive ? "var(--accent)" : tierColor + "55"}`,
                              boxShadow:
                                isUnlocked &&
                                (cosmetic.tier === "legendary" ||
                                  cosmetic.tier === "ultra_rare")
                                  ? `0 0 20px ${tierColor}40`
                                  : "none",
                              cursor: isUnlocked ? "pointer" : "default",
                            }}
                            onClick={() =>
                              isUnlocked &&
                              applyCosmetic(cosmetic.type, cosmetic.id)
                            }
                          >
                            {/* Phone mockup preview */}
                            <div style={styles.themePreview}>
                              {isUnlocked ? (
                                <ThemeMockup
                                  themeId={cosmetic.id}
                                  isActive={isActive}
                                />
                              ) : (
                                <>
                                  <ThemeMockup
                                    themeId={cosmetic.id}
                                    isActive={false}
                                  />
                                  <div style={styles.themeLockedOverlay}>
                                    <Lock
                                      size={18}
                                      color="rgba(255,255,255,0.8)"
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Info footer */}
                            <div
                              style={{
                                ...styles.themeInfo,
                                borderTop: `1px solid ${tierColor}30`,
                              }}
                            >
                              <span style={styles.themeName}>
                                {cosmetic.label}
                              </span>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.58rem",
                                    fontFamily: "var(--font-display)",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    color: tierColor,
                                    background: tierColor + "18",
                                    padding: "1px 6px",
                                    borderRadius: "var(--radius-full)",
                                  }}
                                >
                                  {cosmetic.tier.replace("_", " ")}
                                </span>
                                {isActive && (
                                  <span
                                    style={{
                                      fontSize: "0.58rem",
                                      fontFamily: "var(--font-display)",
                                      fontWeight: 800,
                                      color: "var(--accent)",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                    }}
                                  >
                                    <Check size={10} />
                                    Active
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            /* Coupons — flat list unchanged */
            <>
              <div style={styles.sectionHeader}>
                <Star size={14} color="var(--text-muted)" />
                <h3 style={styles.lockerHeader}>Unlocked Coupons</h3>
              </div>
              <div style={styles.lockerScrollable}>
                {allCosmetics.map((cosmetic) => renderCosmeticRow(cosmetic))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    padding: "20px 16px 100px",
  },
  header: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  pageTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1.4rem",
    color: "var(--text-primary)",
  },
  poolTabs: {
    display: "flex",
    gap: "8px",
  },
  poolTab: {
    padding: "8px 16px",
    borderRadius: "var(--radius-md)",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.9rem",
    transition: "all 0.15s",
  },
  pullSection: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "18px",
    marginBottom: "20px",
  },
  pullStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    background: "var(--bg-elevated)",
    padding: "12px",
    borderRadius: "var(--radius-md)",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statValue: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1.3rem",
    color: "var(--text-primary)",
  },
  drawerSection: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "18px",
  },
  drawerTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1.15rem",
    color: "var(--text-primary)",
  },
  drawerSubtitle: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    marginTop: "4px",
    lineHeight: 1.4,
  },
  lockerSection: {
    marginTop: "20px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
  },
  lockerHeader: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.85rem",
    color: "var(--text-muted)",
    margin: 0,
  },
  lockerScrollable: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingRight: "4px",
  },
  themesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  themeCard: {
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    transition: "all 0.2s",
  },
  themePreview: {
    height: "110px",
    position: "relative",
    overflow: "hidden",
  },
  themeLockedOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  themeActiveBadge: {
    position: "absolute",
    top: "6px",
    right: "6px",
    background: "var(--accent)",
    color: "var(--text-on-accent)",
    fontSize: "0.6rem",
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    padding: "3px 7px",
    borderRadius: "var(--radius-full)",
    display: "flex",
    alignItems: "center",
    gap: "3px",
  },
  themeInfo: {
    padding: "8px 10px",
    background: "var(--bg-elevated)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  themeName: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.78rem",
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cosmeticCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    border: "1.5px solid",
    borderRadius: "var(--radius-md)",
    transition: "all 0.2s",
  },
  cosmeticIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-surface)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-primary)",
    flexShrink: 0,
  },
  cosmeticInfo: {
    flex: 1,
    minWidth: 0,
  },
  cosmeticName: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.88rem",
    color: "var(--text-primary)",
  },
  cosmeticTierText: {
    fontSize: "0.65rem",
    fontWeight: 600,
    textTransform: "capitalize",
    marginTop: "1px",
  },
  cosmeticDesc: {
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
    marginTop: "2px",
  },
  activeCheck: {
    fontSize: "0.78rem",
    color: "var(--accent)",
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
  },
  inactiveApply: {
    fontSize: "0.78rem",
    color: "var(--text-secondary)",
    cursor: "pointer",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-full)",
    padding: "4px 10px",
    background: "var(--bg-surface)",
    transition: "all 0.15s",
  },
  revealOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.92)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "24px",
    backdropFilter: "blur(8px)",
  },
  revealFullModal: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "380px",
  },
  revealHeadline: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1rem",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    margin: "0 0 16px",
    textAlign: "center",
  },
};

export default RewardsVault;
