import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import RewardReveal from "../components/RewardReveal";
import ScratchCard from "../components/ScratchCard";
import {
  Users,
  Mail,
  Smartphone,
  CreditCard,
  MapPin,
  Lock,
  Check,
  ChevronRight,
} from "lucide-react";

// ─── Audio helpers ────────────────────────────────────────────────────────────
let _ac = null;
function getAC() {
  if (!_ac || _ac.state === "closed")
    _ac = new (window.AudioContext || window.webkitAudioContext)();
  if (_ac.state === "suspended") _ac.resume();
  return _ac;
}
function tone(freq, dur, vol = 0.18, type = "sine", delay = 0) {
  try {
    const ac = getAC(),
      t = ac.currentTime + delay;
    const o = ac.createOscillator(),
      g = ac.createGain();
    o.connect(g);
    g.connect(ac.destination);
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch (_) {}
}
function playSwipe() {
  tone(440, 0.12, 0.1, "sine");
}
function playMissionComplete(index) {
  const base = 440 + index * 40;
  tone(base, 0.3, 0.18, "triangle");
  tone(base * 1.25, 0.5, 0.14, "sine", 0.06);
  tone(base * 1.5, 0.7, 0.1, "sine", 0.13);
  // impact noise
  try {
    const ac = getAC(),
      now = ac.currentTime;
    const buf = ac.createBuffer(1, ac.sampleRate * 0.12, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1200;
    f.Q.value = 0.8;
    const g = ac.createGain();
    src.connect(f);
    f.connect(g);
    g.connect(ac.destination);
    g.gain.setValueAtTime(0.4, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    src.start(now);
    src.stop(now + 0.15);
  } catch (_) {}
}
function playArchetypeReveal(color) {
  [523, 659, 784, 1047].forEach((f, i) =>
    tone(f, 1.0, 0.2, "triangle", i * 0.08),
  );
}

// ─── Archetype data ───────────────────────────────────────────────────────────
const ARCHETYPES = {
  "000": {
    id: "builder",
    label: "The Builder",
    emoji: "🏗️",
    desc: "You play the long game. Your card is already tuned for growth.",
    skin: "Forest Green",
    badge: "🏗️ Builder Badge",
    color: "#22c55e",
  },
  "001": {
    id: "builder",
    label: "The Builder",
    emoji: "🏗️",
    desc: "You play the long game. Your card is already tuned for growth.",
    skin: "Forest Green",
    badge: "🏗️ Builder Badge",
    color: "#22c55e",
  },
  "010": {
    id: "explorer",
    label: "The Explorer",
    emoji: "🧭",
    desc: "You move fast and bring people with you. Aurora skin unlocked.",
    skin: "Aurora Border",
    badge: "🧭 Explorer Badge",
    color: "#38bdf8",
  },
  "011": {
    id: "explorer",
    label: "The Explorer",
    emoji: "🧭",
    desc: "You move fast and bring people with you. Aurora skin unlocked.",
    skin: "Aurora Border",
    badge: "🧭 Explorer Badge",
    color: "#38bdf8",
  },
  100: {
    id: "hustler",
    label: "The Hustler",
    emoji: "⚡",
    desc: "Solo, sharp, and always ahead. Midnight skin is yours.",
    skin: "Midnight",
    badge: "⚡ Hustler Badge",
    color: "#a78bfa",
  },
  101: {
    id: "hustler",
    label: "The Hustler",
    emoji: "⚡",
    desc: "Solo, sharp, and always ahead. Midnight skin is yours.",
    skin: "Midnight",
    badge: "⚡ Hustler Badge",
    color: "#a78bfa",
  },
  110: {
    id: "social",
    label: "The Social",
    emoji: "🌐",
    desc: "You spend with flair and love the crowd. Neon skin activated.",
    skin: "Neon Border",
    badge: "🌐 Social Badge",
    color: "#f472b6",
  },
  111: {
    id: "social",
    label: "The Social",
    emoji: "🌐",
    desc: "You spend with flair and love the crowd. Neon skin activated.",
    skin: "Neon Border",
    badge: "🌐 Social Badge",
    color: "#f472b6",
  },
};

// ─── Personality questions ────────────────────────────────────────────────────
const QUESTIONS = [
  {
    left: { emoji: "🎯", label: "Save for something big" },
    right: { emoji: "💸", label: "Enjoy it now" },
  },
  {
    left: { emoji: "🤝", label: "Split bills with friends" },
    right: { emoji: "🚀", label: "Go solo" },
  },
  {
    left: { emoji: "📈", label: "Grow my money" },
    right: { emoji: "🛍️", label: "Reward myself" },
  },
];

// ─── KYC Missions ─────────────────────────────────────────────────────────────
const MISSIONS = [
  {
    id: "emailVerified",
    emoji: "📧",
    name: "Confirm Your Signal",
    reward: "+20 credits",
    Icon: Mail,
  },
  {
    id: "phoneVerified",
    emoji: "📱",
    name: "Lock In Your Number",
    reward: "+20 credits + free pull",
    Icon: Smartphone,
  },
  {
    id: "idUploaded",
    emoji: "🪪",
    name: "Prove You're Real",
    reward: "+30 credits + rare pull",
    Icon: CreditCard,
  },
  {
    id: "addressConfirmed",
    emoji: "🏠",
    name: "Claim Your Territory",
    reward: "+20 credits",
    Icon: MapPin,
  },
  {
    id: "pinSet",
    emoji: "🔐",
    name: "Set Your Code",
    reward: "+30 credits + chest 🎁",
    Icon: Lock,
  },
];

// ─── Ambient background canvas ────────────────────────────────────────────────
function AmbientBg({ color = "#7b68ee" }) {
  const ref = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    cv.width = 375;
    cv.height = 680;
    const h = color.replace("#", "");
    const R = parseInt(h.slice(0, 2), 16),
      G = parseInt(h.slice(2, 4), 16),
      B = parseInt(h.slice(4, 6), 16);
    const pts = Array.from({ length: 18 }, () => ({
      x: Math.random() * 375,
      y: Math.random() * 680,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 1 + Math.random() * 2,
      life: Math.random(),
    }));
    const draw = () => {
      ctx.clearRect(0, 0, 375, 680);
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.003;
        if (p.x < 0) p.x = 375;
        if (p.x > 375) p.x = 0;
        if (p.y < 0) p.y = 680;
        if (p.y > 680) p.y = 0;
        const a = (Math.sin(p.life) * 0.5 + 0.5) * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R},${G},${B},${a})`;
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [color]);
  return (
    <canvas
      ref={ref}
      width={375}
      height={680}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.7,
      }}
    />
  );
}

// ─── Tiny confetti burst ──────────────────────────────────────────────────────
function ConfettiBurst({ active, color = "#ffd600" }) {
  if (!active) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * 360;
        const dist = 40 + Math.random() * 60;
        const size = 4 + Math.random() * 6;
        const colors = [
          "#ffd600",
          "#ff4d2e",
          "#38bdf8",
          "#22c55e",
          "#f472b6",
          "#a78bfa",
        ];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: size,
              height: size,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              background: colors[i % colors.length],
              transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(-${dist}px)`,
              animation: `confetti-fly 0.7s ease-out forwards`,
              animationDelay: `${i * 20}ms`,
              opacity: 0,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Progress ring ────────────────────────────────────────────────────────────
function ProgressRing({ done, total, color = "#ffd600" }) {
  const r = 28,
    circ = 2 * Math.PI * r;
  const pct = done / total;
  return (
    <svg width={70} height={70} style={{ display: "block" }}>
      <circle
        cx={35}
        cy={35}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={4}
      />
      <circle
        cx={35}
        cy={35}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={`${circ * pct} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 35 35)"
        style={{
          transition: "stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)",
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />
      <text
        x={35}
        y={40}
        textAnchor="middle"
        fill={color}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "13px",
        }}
      >
        {done}/{total}
      </text>
    </svg>
  );
}

// ─── Input config per mission ─────────────────────────────────────────────────
const MISSION_INPUT = {
  emailVerified: {
    type: "email",
    placeholder: "your@email.com",
    label: "Email address",
  },
  phoneVerified: {
    type: "tel",
    placeholder: "+355 6X XXX XXXX",
    label: "Phone number",
  },
  idUploaded: {
    type: "text",
    placeholder: "e.g. AB123456",
    label: "ID / Passport number",
  },
  addressConfirmed: {
    type: "text",
    placeholder: "Street, City",
    label: "Home address",
  },
  pinSet: {
    type: "password",
    placeholder: "6-digit PIN",
    label: "Set your PIN",
    minLen: 6,
    maxLen: 6,
  },
};

// ─── Mission Card (flip on tap) ───────────────────────────────────────────────
function MissionCard({ mission, done, onComplete, loading, color }) {
  const [flipped, setFlipped] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [popping, setPopping] = useState(false);
  const inputCfg = MISSION_INPUT[mission.id] || {};

  const validate = () => {
    const v = value.trim();
    if (!v) return "This field is required";
    if (mission.id === "emailVerified" && !/\S+@\S+\.\S+/.test(v))
      return "Enter a valid email";
    if (mission.id === "phoneVerified" && v.replace(/\D/g, "").length < 9)
      return "Enter a valid phone number";
    if (mission.id === "pinSet" && !/^\d{6}$/.test(v))
      return "PIN must be exactly 6 digits";
    return "";
  };

  const handleSubmit = (e) => {
    e.stopPropagation();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setPopping(true);
    setTimeout(() => setPopping(false), 700);
    onComplete(mission.id);
  };

  // Card needs more height when flipped to show input
  const cardHeight = flipped && !done ? 148 : 72;

  return (
    <div
      style={{
        position: "relative",
        perspective: "800px",
        marginBottom: 10,
        height: cardHeight,
        transition: "height 0.35s ease",
      }}
      onClick={() => !flipped && !done && setFlipped(true)}
    >
      <div
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          borderRadius: "var(--radius-lg)",
          height: cardHeight,
        }}
      >
        {/* Front */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            ...cardFace,
            height: cardHeight,
            background: done
              ? `linear-gradient(135deg,${color}22,${color}08)`
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${done ? color + "60" : "rgba(255,255,255,0.08)"}`,
            boxShadow: done ? `0 0 12px ${color}20` : "none",
          }}
        >
          <span style={{ fontSize: "1.4rem" }}>{mission.emoji}</span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: done ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              {mission.name}
            </div>
            <div style={{ fontSize: "0.72rem", color, marginTop: 2 }}>
              {mission.reward}
            </div>
          </div>
          {done ? (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={14} color="#000" />
            </div>
          ) : (
            <ChevronRight size={16} color="var(--text-muted)" />
          )}
          {popping && <ConfettiBurst active color={color} />}
        </div>

        {/* Back — with real input */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: cardHeight,
            background: `linear-gradient(135deg,${color}18,${color}06)`,
            border: `1px solid ${color}55`,
            borderRadius: "var(--radius-lg)",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {done ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              ✓ Mission Complete!
            </div>
          ) : (
            <>
              {/* Label + reward hint */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label
                  style={{
                    fontSize: "0.7rem",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {inputCfg.label || "Enter value"}
                </label>
                <span
                  style={{
                    fontSize: "0.62rem",
                    color,
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                  }}
                >
                  🎁 {mission.reward}
                </span>
              </div>

              {/* Input */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type={inputCfg.type || "text"}
                  placeholder={inputCfg.placeholder || ""}
                  value={value}
                  maxLength={inputCfg.maxLen}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid ${error ? "#f87171" : color + "50"}`,
                    borderRadius: "var(--radius-md)",
                    color: "#fff",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    padding: "8px 12px",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    background: color,
                    color: "#000",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 14px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    flexShrink: 0,
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {loading ? "…" : "✓"}
                </button>
              </div>

              {/* Validation error */}
              {error && (
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#f87171",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                  }}
                >
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
const cardFace = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "14px 16px",
  borderRadius: "var(--radius-lg)",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OnboardingFlow() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // steps: 0=welcome, 1=personality, 2=archetype-reveal, 3=scratch, 4=kyc, 5=golden-chest
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Personality quiz
  const [answers, setAnswers] = useState([]); // 0=left, 1=right per question
  const [swipeDir, setSwipeDir] = useState(null); // "left"|"right" for animation
  const [archetype, setArchetype] = useState(null);

  // Archetype reveal animation
  const [archetypeRevealPhase, setArchetypeRevealPhase] = useState(0); // 0=hidden,1=show

  // Scratch cards
  const [scratchPanels, setScratchPanels] = useState(null);
  const [scratchRevealed, setScratchRevealed] = useState([false, false, false]);
  const [revealActive, setRevealActive] = useState(false);
  const [revealReward, setRevealReward] = useState(null);

  // KYC
  const [questProgress, setQuestProgress] = useState({
    emailVerified: false,
    phoneVerified: false,
    idUploaded: false,
    addressConfirmed: false,
    pinSet: false,
  });
  const [burstId, setBurstId] = useState(null); // which mission just completed
  const [creditsAnim, setCreditsAnim] = useState(null);

  // Golden chest
  const [chestRevealActive, setChestRevealActive] = useState(false);

  const camelToSnake = (s) => s.replace(/([A-Z])/g, "_$1").toLowerCase();

  useEffect(() => {
    if (user?.questProgress) setQuestProgress(user.questProgress);
  }, [user]);

  // ── Personality answer ──
  const handleAnswer = (dir) => {
    playSwipe();
    setSwipeDir(dir);
    setTimeout(() => {
      const val = dir === "left" ? "0" : "1";
      const next = [...answers, val];
      setAnswers(next);
      setSwipeDir(null);
      if (next.length === 3) {
        const key = next.join("");
        const arch = ARCHETYPES[key] || ARCHETYPES["010"];
        setArchetype(arch);
        setStep(2);
        setTimeout(() => {
          setArchetypeRevealPhase(1);
          playArchetypeReveal(arch.color);
        }, 200);
      }
    }, 320);
  };

  // ── Load scratch panels ──
  const loadScratchPanels = async () => {
    setLoading(true);
    try {
      const res = await api.post("/gacha/pull");
      updateUser({ credits: res.data.credits, pityCounter: res.data.pity });
      const real = { ...res.data.cosmetic, tier: res.data.tier };
      const wi = Math.floor(Math.random() * 3);
      const panels = [
        { type: "bonus", credits: 50 },
        { type: "bonus", credits: 50 },
        { type: "bonus", credits: 50 },
      ];
      panels[wi] = real;
      setScratchPanels(panels);
      setRevealReward(real);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePanelRevealed = (i) => {
    const next = scratchRevealed.map((v, idx) => (idx === i ? true : v));
    setScratchRevealed(next);
    if (next.every(Boolean)) setTimeout(() => setRevealActive(true), 400);
  };

  // ── KYC quest complete ──
  const handleQuestComplete = async (questId) => {
    setLoading(true);
    setBurstId(questId);
    const missionIndex = MISSIONS.findIndex((m) => m.id === questId);
    playMissionComplete(missionIndex >= 0 ? missionIndex : 0);
    try {
      const res = await api.post(`/quests/${camelToSnake(questId)}/complete`);
      const newP = { ...questProgress, [questId]: true };
      setQuestProgress(newP);
      updateUser({ credits: res.data.credits, questProgress: newP });
      setCreditsAnim(
        `+${res.data.credits !== undefined ? "credits" : "20 credits"} earned!`,
      );
      setTimeout(() => setCreditsAnim(null), 1800);
      setTimeout(() => setBurstId(null), 800);
      const allDone = Object.values(newP).every(Boolean);
      if (allDone)
        setTimeout(() => {
          setStep(5);
          setChestRevealActive(true);
        }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    updateUser({ onboardingComplete: true });
    navigate("/dashboard");
  };

  const completedCount = Object.values(questProgress).filter(Boolean).length;
  const accentColor = archetype?.color || "var(--accent)";

  return (
    <div style={S.container}>
      {/* Inject confetti keyframe */}
      <style>{`
        @keyframes confetti-fly { 0%{opacity:1;transform:translate(-50%,-50%) translateY(0)} 100%{opacity:0;transform:translate(-50%,-50%) translateY(-80px) scale(0.3)} }
        @keyframes archetype-pop { 0%{opacity:0;transform:scale(0.6) translateY(30px)} 60%{transform:scale(1.08) translateY(-4px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes credits-fly { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-40px)} }
        @keyframes swipe-left  { 0%{opacity:1;transform:translateX(0) rotate(0)} 100%{opacity:0;transform:translateX(-80px) rotate(-12deg)} }
        @keyframes swipe-right { 0%{opacity:1;transform:translateX(0) rotate(0)} 100%{opacity:0;transform:translateX(80px) rotate(12deg)} }
      `}</style>

      <div style={S.phone} data-theme="theme_neon_city">
        <AmbientBg color={archetype?.color || "#7b68ee"} />
        {/* Credits toast */}
        {creditsAnim && (
          <div
            style={{
              position: "absolute",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--accent)",
              color: "#000",
              borderRadius: "var(--radius-full)",
              padding: "6px 18px",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "0.85rem",
              zIndex: 200,
              animation: "credits-fly 1.8s ease forwards",
              whiteSpace: "nowrap",
            }}
          >
            {creditsAnim}
          </div>
        )}

        {/* Reward reveal overlay (scratch card) */}
        {revealActive && revealReward && (
          <div style={S.overlay}>
            <div style={S.overlayInner} onClick={(e) => e.stopPropagation()}>
              <p style={S.overlayLabel}>You Unlocked a Reward!</p>
              <RewardReveal
                tier={revealReward.tier}
                reward={revealReward}
                autoPlay
                onComplete={() => {}}
              />
              <button
                className="btn btn-primary btn-full"
                style={{ marginTop: 20 }}
                onClick={() => {
                  setRevealActive(false);
                  setRevealReward(null);
                  setStep(4);
                }}
              >
                Continue to Missions →
              </button>
            </div>
          </div>
        )}

        {/* Golden chest overlay */}
        {chestRevealActive && (
          <div style={{ ...S.overlay, background: "rgba(0,0,0,0.97)" }}>
            <div style={S.overlayInner} onClick={(e) => e.stopPropagation()}>
              <p
                style={{
                  ...S.overlayLabel,
                  color: "#d4af37",
                  fontSize: "1rem",
                  marginBottom: 4,
                }}
              >
                🎉 ALL MISSIONS COMPLETE
              </p>
              <RewardReveal
                tier="legendary"
                reward={{
                  label: "2,000 ALL Welcome Bonus",
                  description: "Deposited to your account",
                }}
                autoPlay
                onComplete={() => {}}
              />
              <button
                className="btn btn-primary btn-full"
                style={{ marginTop: 20, background: "#d4af37", color: "#000" }}
                onClick={handleFinish}
              >
                Go to Dashboard 🚀
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 0: Welcome ── */}
        {step === 0 && (
          <div style={S.screen} className="animate-fade-in">
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
              }}
            >
              {/* Hero glow orb */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: 130,
                    height: 130,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle,rgba(212,175,55,0.3) 0%,transparent 70%)",
                    filter: "blur(16px)",
                  }}
                />
                <div
                  style={{
                    width: 86,
                    height: 86,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg,rgba(212,175,55,0.22),rgba(123,104,238,0.12))",
                    border: "1.5px solid rgba(212,175,55,0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 36px rgba(212,175,55,0.28)",
                    position: "relative",
                    zIndex: 1,
                    animation: "gacha-pulse 2.5s ease-in-out infinite",
                  }}
                >
                  <span style={{ fontSize: "2.4rem", lineHeight: 1 }}>✦</span>
                </div>
              </div>
              <h2 style={S.title}>
                Welcome to
                <br />
                Raiffeisen YOUTH
              </h2>
              <p style={S.desc}>
                Complete your setup in under 2 minutes and claim your 2,000 ALL
                welcome bonus.
              </p>
              <div style={S.socialProof}>
                <Users size={16} style={{ color: "var(--text-muted)" }} />
                <span
                  style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
                >
                  <strong>3 friends</strong> already joined in Tirana this week
                </span>
              </div>
              {/* Step preview */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {["🎯 Quiz", "🎰 Pull", "⚡ Missions", "🏆 2,000 ALL"].map(
                  (s, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "var(--radius-full)",
                        padding: "4px 10px",
                        fontSize: "0.6rem",
                        color: "rgba(255,255,255,0.6)",
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                      }}
                    >
                      {s}
                    </div>
                  ),
                )}
              </div>
            </div>
            <div style={{ padding: "0 0 8px" }}>
              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  marginBottom: 10,
                }}
              >
                Takes ~90 seconds · Earn rewards every step
              </div>
              <button
                className="btn btn-primary btn-full"
                onClick={() => setStep(1)}
                style={{
                  fontSize: "1rem",
                  padding: "16px",
                  background: "linear-gradient(135deg,#7b68ee,#d4af37)",
                  boxShadow: "0 4px 20px rgba(123,104,238,0.4)",
                  border: "none",
                }}
              >
                Start & Claim First Pull 🎰
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: Personality Swipe ── */}
        {step === 1 && (
          <div style={S.screen} className="animate-fade-in">
            {/* Header */}
            <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Step 1 of 4 · Personalise
              </div>
              <h2 style={{ ...S.title, fontSize: "1.2rem" }}>Who are you?</h2>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                Swipe to choose · ~10 seconds
              </p>
            </div>

            {/* Progress dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      i < answers.length ? "var(--accent)" : "var(--border)",
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>

            {/* Card */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {answers.length < QUESTIONS.length &&
                (() => {
                  const q = QUESTIONS[answers.length];
                  return (
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 280,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "var(--radius-xl)",
                        padding: "28px 20px",
                        textAlign: "center",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                        animation:
                          swipeDir === "left"
                            ? "swipe-left 0.32s ease forwards"
                            : swipeDir === "right"
                              ? "swipe-right 0.32s ease forwards"
                              : "fade-in 0.25s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-around",
                          marginBottom: 24,
                        }}
                      >
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "2.2rem" }}>
                            {q.left.emoji}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-secondary)",
                              marginTop: 6,
                              maxWidth: 90,
                            }}
                          >
                            {q.left.label}
                          </div>
                        </div>
                        <div
                          style={{
                            color: "var(--text-muted)",
                            alignSelf: "center",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                          }}
                        >
                          vs
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "2.2rem" }}>
                            {q.right.emoji}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-secondary)",
                              marginTop: 6,
                              maxWidth: 90,
                            }}
                          >
                            {q.right.label}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Question {answers.length + 1} of 3
                      </div>
                    </div>
                  );
                })()}
            </div>

            {/* Swipe buttons */}
            {answers.length < QUESTIONS.length && (
              <div style={{ display: "flex", gap: 12, padding: "0 0 8px" }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => handleAnswer("left")}
                >
                  ← {QUESTIONS[answers.length].left.emoji}
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => handleAnswer("right")}
                >
                  {QUESTIONS[answers.length].right.emoji} →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Archetype Reveal ── */}
        {step === 2 && archetype && (
          <div style={S.screen} className="animate-fade-in">
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                padding: "0 8px",
              }}
            >
              <div
                style={{
                  opacity: archetypeRevealPhase ? 1 : 0,
                  animation: archetypeRevealPhase
                    ? "archetype-pop 0.65s cubic-bezier(0.22,1,0.36,1) forwards"
                    : "none",
                }}
              >
                {/* Glow orb */}
                <div
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    margin: "0 auto 16px",
                    background: `radial-gradient(circle,${archetype.color}40,${archetype.color}10)`,
                    border: `2px solid ${archetype.color}60`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 40px ${archetype.color}30`,
                  }}
                >
                  <span style={{ fontSize: "3rem" }}>{archetype.emoji}</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    You are
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "1.8rem",
                      color: archetype.color,
                      marginBottom: 10,
                    }}
                  >
                    {archetype.label}
                  </h2>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      maxWidth: 260,
                      margin: "0 auto",
                    }}
                  >
                    {archetype.desc}
                  </p>
                </div>
                {/* Rewards unlocked */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    marginTop: 20,
                    flexWrap: "wrap",
                  }}
                >
                  {[`🎨 ${archetype.skin} skin`, archetype.badge].map(
                    (item, i) => (
                      <div
                        key={i}
                        style={{
                          background: `${archetype.color}18`,
                          border: `1px solid ${archetype.color}44`,
                          borderRadius: "var(--radius-full)",
                          padding: "6px 14px",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          color: archetype.color,
                        }}
                      >
                        {item}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div style={{ padding: "0 0 8px" }}>
              <button
                className="btn btn-primary btn-full"
                style={{ background: archetype.color, color: "#000" }}
                onClick={() => {
                  setStep(3);
                  loadScratchPanels();
                }}
              >
                Claim Your Free Pull 🎰
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Scratch Cards ── */}
        {step === 3 && (
          <div
            style={{ ...S.screen, overflowY: "auto" }}
            className="animate-fade-in"
          >
            <div style={{ textAlign: "center", padding: "16px 0 12px" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Step 2 of 4 · Free Pull
              </div>
              <h2 style={{ ...S.title, fontSize: "1.2rem" }}>
                🎰 Scratch Your Luck
              </h2>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                One panel hides a real reward. Scratch all three to reveal!
              </p>
            </div>

            {!scratchPanels ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎁</div>
                  <button
                    className="btn btn-primary"
                    onClick={loadScratchPanels}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Reveal Panels"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 14,
                    marginTop: 8,
                  }}
                >
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
                {!scratchRevealed.every(Boolean) && (
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginTop: 16,
                    }}
                  >
                    {scratchRevealed.filter(Boolean).length}/3 scratched
                  </p>
                )}
                {scratchRevealed.every(Boolean) && !revealActive && (
                  <div style={{ padding: "12px 0 0", textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                      }}
                    >
                      🎉 All scratched! Your reward is waiting…
                    </div>
                    <button
                      className="btn btn-primary btn-full"
                      onClick={() => setRevealActive(true)}
                    >
                      Reveal My Reward ✨
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── STEP 4: KYC Mission Deck ── */}
        {step === 4 && (
          <div
            style={{ ...S.screen, overflowY: "auto" }}
            className="animate-fade-in"
          >
            {/* Header with ring */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0 16px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Step 3 of 4 · Missions
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "1.15rem",
                    color: "var(--text-primary)",
                  }}
                >
                  Complete All 5
                </h2>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  Flip a card to start the mission
                </p>
              </div>
              <ProgressRing
                done={completedCount}
                total={5}
                color={accentColor}
              />
            </div>

            {/* Archetype badge if we have it */}
            {archetype && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: `${archetype.color}12`,
                  border: `1px solid ${archetype.color}30`,
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{archetype.emoji}</span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: archetype.color,
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                  }}
                >
                  {archetype.label} — completing your setup
                </span>
              </div>
            )}

            {/* Mission cards (stacked deck feel) */}
            <div style={{ position: "relative" }}>
              {MISSIONS.map((mission, i) => (
                <div key={mission.id}>
                  <MissionCard
                    mission={mission}
                    done={!!questProgress[mission.id]}
                    onComplete={handleQuestComplete}
                    loading={loading}
                    burstId={burstId}
                    color={accentColor}
                  />
                </div>
              ))}
            </div>

            {/* Motivational hint */}
            {completedCount < 5 && completedCount > 0 && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  padding: "8px 0 4px",
                }}
              >
                {5 - completedCount} mission{5 - completedCount > 1 ? "s" : ""}{" "}
                left · Your 2,000 ALL bonus is waiting 🏆
              </div>
            )}
            {completedCount === 0 && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  padding: "8px 0 4px",
                }}
              >
                Tap any card to flip and start · Each one earns you credits
              </div>
            )}
          </div>
        )}
      </div>
      {/* end phone */}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background:
      "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(123,104,238,0.18) 0%, rgba(212,175,55,0.06) 50%, transparent 100%)",
    backgroundColor: "#06060f",
  },
  phone: {
    width: "375px",
    height: "680px",
    background: "linear-gradient(180deg, #0e0e1a 0%, #0a0a14 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "var(--radius-xl)",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(123,104,238,0.12)",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  screen: {
    flex: 1,
    padding: "20px 20px 20px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontWeight: 900,
    fontSize: "1.55rem",
    textAlign: "center",
    color: "#ffffff",
    lineHeight: 1.2,
  },
  desc: {
    fontSize: "0.85rem",
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.6,
    maxWidth: 280,
    margin: "0 auto",
  },
  socialProof: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "var(--radius-lg)",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "20px",
    backdropFilter: "blur(10px)",
  },
  overlayInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  overlayLabel: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    margin: "0 0 12px",
    textAlign: "center",
  },
};
