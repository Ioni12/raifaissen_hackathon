import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import RewardReveal from "../components/RewardReveal";
import QuestChecklist from "../components/QuestChecklist";
import ScratchCard from "../components/ScratchCard";
import { Trophy, Users } from "lucide-react";

const GableCross = ({ size = 60, color = "currentColor" }) => (
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

export default function OnboardingFlow() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0: Invite intro, 1: Scratch cards, 2: KYC Quests, 3: Complete
  const [loading, setLoading] = useState(false);
  const [revealActive, setRevealActive] = useState(false);
  const [revealReward, setRevealReward] = useState(null);

  // Scratch card state
  const [scratchPanels, setScratchPanels] = useState(null);
  const [scratchRevealed, setScratchRevealed] = useState([false, false, false]);

  // Quest progress mapping local state
  const [questProgress, setQuestProgress] = useState({
    emailVerified: false,
    phoneVerified: false,
    idUploaded: false,
    addressConfirmed: false,
    pinSet: false,
  });

  useEffect(() => {
    if (user?.questProgress) {
      setQuestProgress(user.questProgress);
    }
  }, [user]);

  // Translate camelCase quest IDs to snake_case for the backend endpoints
  const camelToSnake = (str) => {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
  };

  // Step 1: Load scratch panels — fetch the real pull + generate two bonus panels
  const loadScratchPanels = async () => {
    setLoading(true);
    try {
      const res = await api.post("/gacha/pull");
      updateUser({ credits: res.data.credits, pityCounter: res.data.pity });

      const realReward = { ...res.data.cosmetic, tier: res.data.tier };
      const winIndex = Math.floor(Math.random() * 3);
      const panels = [
        { type: "bonus", credits: 50 },
        { type: "bonus", credits: 50 },
        { type: "bonus", credits: 50 },
      ];
      panels[winIndex] = realReward;

      setScratchPanels(panels);
      setRevealReward(realReward);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Called when a single scratch panel is revealed
  const handlePanelRevealed = (index) => {
    const next = scratchRevealed.map((v, i) => (i === index ? true : v));
    setScratchRevealed(next);
    if (next.every(Boolean)) {
      setTimeout(() => setRevealActive(true), 400);
    }
  };

  // Step 1: Perform first pull
  const performFirstPull = async () => {
    setLoading(true);
    try {
      const res = await api.post("/gacha/pull");
      updateUser({
        credits: res.data.credits,
        pityCounter: res.data.pity,
      });
      setRevealReward({
        ...res.data.cosmetic,
        tier: res.data.tier,
      });
      setRevealActive(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete a specific KYC quest
  const handleQuestComplete = async (questId) => {
    setLoading(true);
    try {
      const snakeId = camelToSnake(questId);
      const res = await api.post(`/quests/${snakeId}/complete`);

      const newProgress = { ...questProgress, [questId]: true };
      setQuestProgress(newProgress);
      updateUser({ credits: res.data.credits, questProgress: newProgress });

      // Check if all quests completed
      const allDone = Object.values(newProgress).every(Boolean);
      if (allDone) {
        setTimeout(() => {
          setStep(3);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      updateUser({ onboardingComplete: true });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.phoneFrame}>
        {/* Reveal Modal Overlay */}
        {revealActive && revealReward && (
          <div style={styles.revealOverlay}>
            <div
              style={styles.revealFullModal}
              onClick={(e) => e.stopPropagation()}
            >
              <p style={styles.revealLabel}>You Unlocked a Reward!</p>
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
                  setStep(2);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 0: Invite intro screen */}
        {step === 0 && (
          <div style={styles.content} className="animate-fade-in">
            <div style={styles.logoArea}>
              <GableCross size={60} color="var(--accent)" />
            </div>
            <h2 style={styles.title}>Welcome to Raiffeisen YOUTH</h2>
            <p style={styles.description}>
              Complete actions to earn credits and unlock exclusive
              customizations. Your journey starts now.
            </p>
            <div style={styles.socialProof}>
              <Users size={18} style={{ color: "var(--text-secondary)" }} />
              <span
                style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}
              >
                <strong>3 friends</strong> already joined in Tirana
              </span>
            </div>
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: "auto" }}
              onClick={() => setStep(1)}
            >
              Claim Your First Pull
            </button>
          </div>
        )}

        {/* Step 1: Scratch Cards */}
        {step === 1 && (
          <div style={styles.contentScroll} className="animate-fade-in">
            <div style={{ padding: "0 4px" }}>
              <div style={styles.questHero}>
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  🎰 Scratch Your Luck
                </h2>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginTop: "8px",
                  }}
                >
                  One panel hides a real reward. The others give bonus credits.
                  Scratch them all to find out!
                </p>
              </div>

              {/* Load panel button */}
              {!scratchPanels && (
                <button
                  className="btn btn-primary btn-full"
                  onClick={loadScratchPanels}
                  disabled={loading}
                  style={{ marginTop: "12px" }}
                >
                  {loading ? "Loading..." : "Reveal Your Panels"}
                </button>
              )}

              {/* Three scratch cards */}
              {scratchPanels && (
                <div style={styles.scratchRow}>
                  {scratchPanels.map((panel, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <ScratchCard
                        reward={panel}
                        width={90}
                        height={120}
                        onRevealed={() => handlePanelRevealed(i)}
                      />
                      <span
                        style={{
                          fontSize: "0.65rem",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {scratchRevealed[i]
                          ? panel.type === "bonus"
                            ? `+${panel.credits} credits`
                            : panel.label
                          : "???"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {scratchPanels && !scratchRevealed.every(Boolean) && (
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "20px",
                  }}
                >
                  {scratchRevealed.filter(Boolean).length} / 3 scratched
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: KYC Quests */}
        {step === 2 && (
          <div style={styles.contentScroll} className="animate-fade-in">
            <div style={{ padding: "0 4px" }}>
              <div style={styles.questHero}>
                <Trophy size={32} color="var(--accent)" />
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontFamily: "var(--font-display)",
                    marginTop: "12px",
                  }}
                >
                  Onboarding Quests
                </h2>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginTop: "8px",
                  }}
                >
                  Complete the quests below to earn credits and unlock more
                  rewards
                </p>
              </div>
              <QuestChecklist
                questProgress={questProgress}
                onComplete={handleQuestComplete}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div style={styles.content} className="animate-fade-in">
            <div style={styles.logoArea}>
              <Trophy size={60} color="var(--accent)" />
            </div>
            <h2 style={styles.title}>You're All Set!</h2>
            <p style={styles.description}>
              Welcome to the Raiffeisen YOUTH community. Start using your card
              to earn more credits and unlock additional rewards.
            </p>
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: "auto" }}
              onClick={handleFinishOnboarding}
              disabled={loading}
            >
              {loading ? "Loading..." : "Go to Dashboard"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    backgroundImage:
      "radial-gradient(circle at center, rgba(180, 110, 255, 0.05) 0%, transparent 65%)",
  },
  phoneFrame: {
    width: "375px",
    height: "680px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-xl)",
    boxShadow: "var(--shadow-md)",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    padding: "30px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
  contentScroll: {
    flex: 1,
    padding: "24px 18px",
    overflowY: "auto",
    height: "100%",
  },
  logoArea: {
    marginTop: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1.5rem",
    textAlign: "center",
    marginTop: "20px",
    color: "var(--text-primary)",
  },
  description: {
    fontSize: "0.85rem",
    textAlign: "center",
    color: "var(--text-secondary)",
    marginTop: "12px",
    lineHeight: 1.5,
  },
  socialProof: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "24px",
  },
  questHero: {
    textAlign: "center",
    marginBottom: "24px",
    padding: "10px 0",
  },
  revealOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.92)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "20px",
    backdropFilter: "blur(8px)",
  },
  revealFullModal: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  revealLabel: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    margin: "0 0 12px",
    textAlign: "center",
  },
  scratchRow: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    marginTop: "16px",
  },
};
