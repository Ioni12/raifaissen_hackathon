import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import ActivityCard from "../components/ActivityCard";
import Leaderboard from "../components/Leaderboard";
import {
  Zap,
  Inbox,
  RefreshCw,
  Lock,
  CreditCard,
  Palette,
  Trophy,
  Gem,
  Hexagon,
} from "lucide-react";

// All cosmetics that can be unlocked, to demonstrate "Visible Gaps"
const ALL_COSMETICS = [
  { id: "border_neon", label: "Neon Border", tier: "rare", type: "skin" },
  {
    id: "border_gold_wave",
    label: "Gold Wave Border",
    tier: "rare",
    type: "skin",
  },
  { id: "border_aurora", label: "Aurora Border", tier: "rare", type: "skin" },
  {
    id: "skin_holographic",
    label: "Holographic Skin",
    tier: "rare",
    type: "skin",
  },
  {
    id: "theme_neon_city",
    label: "Neon City Theme",
    tier: "ultra_rare",
    type: "theme",
  },
  {
    id: "theme_volcanic",
    label: "Volcanic Theme",
    tier: "ultra_rare",
    type: "theme",
  },
  {
    id: "theme_arctic",
    label: "Arctic Theme",
    tier: "ultra_rare",
    type: "theme",
  },
  {
    id: "theme_sakura",
    label: "Sakura Theme",
    tier: "ultra_rare",
    type: "theme",
  },
  {
    id: "legendary_tirana_founding",
    label: "Tirana Founding Badge",
    tier: "legendary",
    type: "badge",
  },
  {
    id: "legendary_pyramid",
    label: "Pyramid Collab Theme",
    tier: "legendary",
    type: "theme",
  },
];

const getTierIcon = (tier) => {
  switch (tier) {
    case "legendary":
      return <Trophy size={16} color="var(--tier-legendary)" />;
    case "ultra_rare":
      return <Gem size={16} color="var(--tier-ultra)" />;
    case "rare":
      return <Hexagon size={16} color="var(--tier-rare)" />;
    default:
      return <Hexagon size={16} color="var(--tier-common)" />;
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case "skin":
      return <CreditCard size={16} />;
    case "theme":
      return <Palette size={16} />;
    case "badge":
      return <Trophy size={16} />;
    default:
      return <Trophy size={16} />;
  }
};

export default function SocialFeed() {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [feedRes, leaderRes] = await Promise.all([
        api.get("/social/feed"),
        api.get("/leaderboard"),
      ]);
      setFeed(feedRes.data.feed);
      setLeaderboard(leaderRes.data.leaderboard);
    } catch (err) {
      console.error("Error fetching social data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReactUpdate = (activityId, data) => {
    // Update the specific activity reactions in state
    setFeed((prevFeed) =>
      prevFeed.map((act) =>
        act._id === activityId
          ? {
              ...act,
              reactionCounts: data.reactionCounts,
              myReaction: data.myReaction,
            }
          : act,
      ),
    );
  };

  // Determine locked cosmetics for the "Visible Gaps" display
  const unlockedIds = user?.unlockedCosmetics || [];
  const lockedCosmetics = ALL_COSMETICS.filter(
    (c) => !unlockedIds.includes(c.id),
  );

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>
            <Zap size={20} style={{ marginRight: "8px", display: "inline" }} />
            Social Feed
          </h1>
          <p style={styles.subtitle}>
            Automatic activity feed from your KUIK contacts.
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setRefreshing(true);
            fetchData(false);
          }}
          disabled={refreshing}
        >
          {refreshing ? (
            "Refreshing..."
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} />
              Refresh
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "60px" }}
        >
          <div className="spinner" />
        </div>
      ) : (
        <div style={styles.grid}>
          {/* Main Feed */}
          <div style={styles.feedColumn}>
            {feed.length === 0 ? (
              <div style={styles.emptyFeed}>
                <Inbox size={48} color="var(--text-muted)" />
                <h3 style={{ marginTop: "16px", color: "var(--text-primary)" }}>
                  Your Feed is Empty
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.88rem",
                    marginTop: "8px",
                    lineHeight: "1.5",
                  }}
                >
                  No activities yet. Perform actions or invite friends to get
                  started.
                </p>
              </div>
            ) : (
              <div style={styles.feedList}>
                {feed.map((activity) => (
                  <ActivityCard
                    key={activity._id}
                    activity={activity}
                    onReact={handleReactUpdate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={styles.sidebarColumn}>
            {/* Friend Leaderboard */}
            <Leaderboard entries={leaderboard} />

            {/* Visible Gaps (Locked Cosmetics) */}
            <div style={styles.gapsCard}>
              <div style={styles.gapsHeader}>
                <Lock size={20} color="var(--text-muted)" />
                <div>
                  <div style={styles.gapsTitle}>Locked Vault Cosmetics</div>
                  <div style={styles.gapsDesc}>
                    Visible gaps in your inventory. Earn them in the Vault.
                  </div>
                </div>
              </div>

              <div style={styles.gapsGrid}>
                {lockedCosmetics.length === 0 ? (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--accent)",
                      textAlign: "center",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Trophy size={16} /> All cosmetics unlocked!
                  </p>
                ) : (
                  lockedCosmetics.map((cosmetic) => (
                    <div
                      key={cosmetic.id}
                      style={styles.gapItem}
                      title={`${cosmetic.label} (${cosmetic.tier})`}
                    >
                      <div style={styles.gapIcon}>
                        {getTypeIcon(cosmetic.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.gapItemName}>{cosmetic.label}</div>
                        <div
                          style={{
                            ...styles.gapItemTier,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {getTierIcon(cosmetic.tier)}
                          {cosmetic.tier.replace("_", " ")}
                        </div>
                      </div>
                      <Lock size={14} color="var(--text-muted)" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    padding: "20px 16px 40px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  pageTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1.4rem",
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
  },
  subtitle: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    marginTop: "4px",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  feedColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  feedList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  emptyFeed: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "60px 40px",
    textAlign: "center",
  },
  sidebarColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  gapsCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "20px",
  },
  gapsHeader: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "16px",
  },
  gapsTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "var(--text-primary)",
  },
  gapsDesc: {
    fontSize: "0.72rem",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
  gapsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  gapItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    opacity: 0.7,
  },
  gapIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-md)",
    background: "var(--bg-surface)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-secondary)",
  },
  gapItemName: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.82rem",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  gapItemTier: {
    fontSize: "0.65rem",
    textTransform: "capitalize",
    fontWeight: 600,
    letterSpacing: "0.02em",
    marginTop: "2px",
    color: "var(--text-muted)",
  },
};

// Responsive adjustments using CSS injection
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = `
    @media (max-width: 768px) {
      div[style*="gridTemplateColumns: 3fr 2fr"] {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
}
