import { useState, useEffect, useRef } from "react";
import { Trophy, Gem, Hexagon, Square } from "lucide-react";

// ─── Tier config ──────────────────────────────────────────────────────────────
const TIER = {
  common: {
    hex: "#9ca3af",
    label: "Common",
    Icon: Square,
    particles: 22,
    chargeMs: 900,
    shakeMs: 80,
  },
  rare: {
    hex: "#3b82f6",
    label: "Rare",
    Icon: Hexagon,
    particles: 40,
    chargeMs: 1100,
    shakeMs: 110,
  },
  ultra_rare: {
    hex: "#8b5cf6",
    label: "Ultra Rare",
    Icon: Gem,
    particles: 65,
    chargeMs: 1400,
    shakeMs: 140,
  },
  legendary: {
    hex: "#d4af37",
    label: "Legendary",
    Icon: Trophy,
    particles: 110,
    chargeMs: 1800,
    shakeMs: 180,
  },
};

function cfg(tier) {
  return TIER[tier] || TIER.common;
}

// ─── Web Audio ────────────────────────────────────────────────────────────────
let _actx = null;
function getACtx() {
  if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
  if (_actx.state === "suspended") _actx.resume();
  return _actx;
}

function playCharge(tier) {
  try {
    const ac = getACtx();
    const t = ac.currentTime;
    const dur = cfg(tier).chargeMs / 1000;

    // Rising drone
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.connect(g);
    g.connect(ac.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(55, t);
    osc.frequency.exponentialRampToValueAtTime(
      tier === "legendary" ? 880 : 440,
      t + dur,
    );
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.08, t + 0.15);
    g.gain.linearRampToValueAtTime(0.05, t + dur - 0.1);
    g.gain.linearRampToValueAtTime(0, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.05);

    // High shimmer overtone for ultra/legendary
    if (tier === "ultra_rare" || tier === "legendary") {
      const osc2 = ac.createOscillator();
      const g2 = ac.createGain();
      osc2.connect(g2);
      g2.connect(ac.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(220, t);
      osc2.frequency.exponentialRampToValueAtTime(1760, t + dur);
      g2.gain.setValueAtTime(0, t);
      g2.gain.linearRampToValueAtTime(0.04, t + dur * 0.5);
      g2.gain.linearRampToValueAtTime(0, t + dur);
      osc2.start(t);
      osc2.stop(t + dur + 0.05);
    }
  } catch (_) {}
}

function playBurst(tier) {
  try {
    const ac = getACtx();
    const now = ac.currentTime;

    // Impact noise
    const sr = ac.sampleRate;
    const buf = ac.createBuffer(1, sr * 0.25, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const flt = ac.createBiquadFilter();
    flt.type = "bandpass";
    flt.frequency.value =
      { legendary: 2400, ultra_rare: 1600, rare: 1000, common: 700 }[tier] ||
      1000;
    flt.Q.value = 0.6;
    const ng = ac.createGain();
    src.connect(flt);
    flt.connect(ng);
    ng.connect(ac.destination);
    ng.gain.setValueAtTime(0.9, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    src.start(now);
    src.stop(now + 0.25);

    // Chime arpeggio — longer and richer for higher tiers
    const chimes = {
      common: [[262, 0]],
      rare: [
        [330, 0],
        [415, 0.08],
      ],
      ultra_rare: [
        [440, 0],
        [554, 0.07],
        [659, 0.14],
      ],
      legendary: [
        [523, 0],
        [659, 0.07],
        [784, 0.14],
        [1047, 0.22],
        [1319, 0.32],
      ],
    }[tier] || [[262, 0]];

    chimes.forEach(([freq, delay]) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g);
      g.connect(ac.destination);
      o.type = tier === "legendary" ? "triangle" : "sine";
      o.frequency.value = freq;
      const st = now + delay;
      g.gain.setValueAtTime(0, st);
      g.gain.linearRampToValueAtTime(0.28, st + 0.03);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        st + (tier === "legendary" ? 1.4 : 0.8),
      );
      o.start(st);
      o.stop(st + 1.5);
    });
  } catch (_) {}
}

// ─── Particle canvas ──────────────────────────────────────────────────────────
function Particles({ hex, count, run, tier }) {
  const ref = useRef(null);
  const rafR = useRef(null);

  useEffect(() => {
    if (!run) return;
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width,
      H = cv.height,
      cx = W / 2,
      cy = H / 2;

    // parse hex
    const h = hex.replace("#", "");
    const R = parseInt(h.slice(0, 2), 16),
      G = parseInt(h.slice(2, 4), 16),
      B = parseInt(h.slice(4, 6), 16);

    const mk = () => {
      const a = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * (tier === "legendary" ? 7 : 5);
      return {
        x: cx,
        y: cy,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 2,
        life: 1,
        decay: 0.008 + Math.random() * 0.016,
        size: 1.5 + Math.random() * (tier === "legendary" ? 5 : 3.5),
        shape: ["circle", "square", "diamond"][Math.floor(Math.random() * 3)],
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
        hue: (Math.random() - 0.5) * 30, // slight hue jitter
      };
    };

    const pts = Array.from({ length: count }, mk);
    const rings =
      tier === "legendary" || tier === "ultra_rare"
        ? [0, 0.15, 0.3].map((d) => ({ r: 0, delay: d, life: 1 }))
        : [];

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      rings.forEach((ring) => {
        if (frame < ring.delay * 60) return;
        ring.r += 6;
        ring.life -= 0.018;
        if (ring.life > 0) {
          ctx.beginPath();
          ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${R},${G},${B},${ring.life * 0.6})`;
          ctx.lineWidth = tier === "legendary" ? 3 : 1.5;
          ctx.stroke();
        }
      });

      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= p.decay;
        p.rot += p.spin;
        if (p.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = `rgb(${Math.min(255, (R + p.hue) | 0)},${Math.min(255, (G + p.hue) | 0)},${Math.min(255, (B + p.hue) | 0)})`;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.shape === "diamond") {
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.4);
          ctx.lineTo(p.size * 0.7, 0);
          ctx.lineTo(0, p.size * 1.4);
          ctx.lineTo(-p.size * 0.7, 0);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === "square") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (pts.some((p) => p.life > 0) || rings.some((r) => r.life > 0))
        rafR.current = requestAnimationFrame(draw);
    };

    rafR.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafR.current);
  }, [run]);

  return (
    <canvas
      ref={ref}
      width={400}
      height={600}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 3,
      }}
    />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RewardReveal({
  tier,
  reward,
  onComplete,
  autoPlay = true,
}) {
  const t = cfg(tier);
  const isLegendary = tier === "legendary";
  const isHighTier = tier === "legendary" || tier === "ultra_rare";

  // phases: idle → charging → burst → done
  const [phase, setPhase] = useState("idle");
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const [blurAmt, setBlurAmt] = useState(20); // shadow blur amount during charge

  const chargeIntervalRef = useRef(null);
  const started = useRef(false);

  const run = () => {
    if (started.current) return;
    started.current = true;

    playCharge(tier);
    setPhase("charging");

    // Slowly reduce blur during charge — creates "materialising" effect
    let blur = 20;
    chargeIntervalRef.current = setInterval(() => {
      blur = Math.max(0, blur - 20 / (t.chargeMs / 60));
      setBlurAmt(blur);
    }, 60);

    setTimeout(() => {
      clearInterval(chargeIntervalRef.current);
      setPhase("burst");
      setFlash(true);
      setShake(true);
      playBurst(tier);

      setTimeout(() => setFlash(false), 80);
      setTimeout(() => setShake(false), t.shakeMs);
      setTimeout(() => {
        setPhase("done");
        onComplete?.();
      }, 600);
    }, t.chargeMs);
  };

  useEffect(() => {
    if (!autoPlay) return;
    const id = setTimeout(run, 80);
    return () => {
      clearTimeout(id);
      clearInterval(chargeIntervalRef.current);
    };
  }, []);

  return (
    <div
      style={{
        ...S.root,
        animation: shake ? "gacha-shake 80ms linear 3" : "none",
      }}
      onClick={phase === "idle" ? run : undefined}
    >
      {/* Full-screen colour flash */}
      {flash && <div style={{ ...S.flash, background: t.hex + "50" }} />}

      {/* Ambient glow that grows during charge */}
      <div
        style={{
          ...S.ambientGlow,
          background: `radial-gradient(ellipse 60% 40% at 50% 60%, ${t.hex}${
            phase === "idle" ? "00" : phase === "charging" ? "18" : "30"
          } 0%, transparent 70%)`,
          transition: "background 0.4s ease",
        }}
      />

      {/* Particle layer */}
      <Particles
        hex={t.hex}
        count={t.particles}
        run={phase === "burst"}
        tier={tier}
      />

      {/* ── IDLE ── */}
      {phase === "idle" && (
        <div style={S.idleWrap}>
          <div
            style={{
              ...S.orb,
              borderColor: t.hex + "55",
              boxShadow: `0 0 30px ${t.hex}20`,
            }}
          >
            <t.Icon size={40} color={t.hex} />
          </div>
          <p style={{ ...S.hint, color: t.hex }}>Tap to open</p>
          <div
            style={{
              ...S.tierBadge,
              background: t.hex + "20",
              color: t.hex,
              border: `1px solid ${t.hex}44`,
            }}
          >
            {t.label}
          </div>
        </div>
      )}

      {/* ── CHARGING ── */}
      {phase === "charging" && (
        <div style={S.chargeWrap}>
          {/* Outer spinning ring */}
          <div
            style={{
              ...S.spinRingOuter,
              borderTopColor: t.hex,
              borderRightColor: t.hex + "33",
              animation: "spin-slow 0.6s linear infinite",
            }}
          />
          {/* Inner pulsing ring */}
          <div
            style={{
              ...S.spinRingInner,
              borderTopColor: t.hex + "88",
              animation: "spin-slow 0.4s linear infinite reverse",
            }}
          />

          {/* Blurred reward shadow — the psychological tease */}
          <div
            style={{
              ...S.shadowOrb,
              filter: `blur(${blurAmt}px)`,
              background: t.hex + "88",
              transform: `scale(${1 + (20 - blurAmt) * 0.015})`,
            }}
          />

          {/* Icon inside */}
          <div
            style={{
              ...S.orb,
              position: "absolute",
              borderColor: t.hex + "66",
              animation: "gacha-pulse 0.45s ease-in-out infinite",
              background: t.hex + "15",
            }}
          >
            <t.Icon size={40} color={t.hex} />
          </div>

          <p style={{ ...S.chargeLabel, color: t.hex, marginTop: 90 }}>
            {isLegendary
              ? "✨ Something legendary…"
              : isHighTier
                ? "⚡ Unlocking…"
                : "Opening…"}
          </p>
        </div>
      )}

      {/* ── BURST / DONE ── */}
      {(phase === "burst" || phase === "done") && (
        <div style={S.revealWrap}>
          {/* Tier-coloured backdrop glow */}
          <div
            style={{
              ...S.revealGlow,
              background: `radial-gradient(ellipse 70% 50% at 50% 55%, ${t.hex}35 0%, transparent 70%)`,
            }}
          />

          {/* The card */}
          <div
            style={{
              ...S.card,
              borderColor: t.hex + "99",
              boxShadow: isLegendary
                ? `0 0 60px ${t.hex}50, 0 0 120px ${t.hex}20, inset 0 0 20px ${t.hex}10`
                : isHighTier
                  ? `0 0 30px ${t.hex}40`
                  : `0 0 14px ${t.hex}25`,
              animation:
                "gacha-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
            }}
          >
            {/* Shimmer sweep — always on for legendary, once for others */}
            <div
              style={{
                ...S.shimmer,
                animation: isLegendary
                  ? "gacha-shimmer 1.8s ease-in-out infinite"
                  : "gacha-shimmer 0.8s ease-in-out 1",
              }}
            />

            {/* Icon */}
            <div
              style={{
                ...S.cardIcon,
                background: t.hex + "20",
                border: `2px solid ${t.hex}55`,
                boxShadow: `0 0 18px ${t.hex}30`,
              }}
            >
              <t.Icon size={isLegendary ? 44 : 36} color={t.hex} />
            </div>

            {/* Tier pill */}
            <span
              style={{
                ...S.pill,
                color: t.hex,
                background: t.hex + "1a",
                border: `1px solid ${t.hex}44`,
              }}
            >
              {t.label}
            </span>

            {/* Reward name */}
            <div style={S.name}>{reward?.label || "Reward"}</div>

            {/* Description */}
            {reward?.description && (
              <div style={S.desc}>{reward.description}</div>
            )}

            {/* Legendary extra: cohort social proof */}
            {isLegendary && (
              <div
                style={{
                  ...S.socialProofBadge,
                  borderColor: t.hex + "44",
                  color: t.hex + "cc",
                }}
              >
                🏆 You are among the few who hold this
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  root: {
    position: "relative",
    width: "100%",
    minHeight: "280px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: "var(--radius-lg)",
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(2px)",
  },
  flash: {
    position: "absolute",
    inset: "-20px",
    zIndex: 10,
    pointerEvents: "none",
    borderRadius: "8px",
  },
  ambientGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 1,
  },
  // idle
  idleWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    cursor: "pointer",
    zIndex: 2,
    padding: "24px 0",
    userSelect: "none",
  },
  orb: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.4)",
  },
  hint: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.9rem",
    margin: 0,
    letterSpacing: "0.04em",
  },
  tierBadge: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "0.65rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    padding: "4px 12px",
    borderRadius: "var(--radius-full)",
  },
  // charging
  chargeWrap: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 2,
    width: 200,
    height: 200,
    justifyContent: "center",
  },
  spinRingOuter: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: "50%",
    border: "3px solid transparent",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
  },
  spinRingInner: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: "50%",
    border: "2px solid transparent",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
  },
  shadowOrb: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: "50%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    transition: "filter 0.06s linear",
  },
  chargeLabel: {
    position: "absolute",
    bottom: 0,
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.82rem",
    letterSpacing: "0.04em",
    margin: 0,
    textAlign: "center",
    width: "100%",
  },
  // reveal
  revealWrap: {
    position: "relative",
    width: "100%",
    minHeight: 280,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  revealGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 1,
  },
  card: {
    position: "relative",
    zIndex: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    background: "rgba(10,10,15,0.92)",
    border: "1.5px solid",
    borderRadius: "var(--radius-xl)",
    padding: "28px 32px 24px",
    textAlign: "center",
    minWidth: 220,
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)",
    pointerEvents: "none",
    zIndex: 5,
  },
  cardIcon: {
    width: 76,
    height: 76,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    position: "relative",
    zIndex: 2,
  },
  pill: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "0.62rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    padding: "3px 10px",
    borderRadius: "var(--radius-full)",
    zIndex: 2,
  },
  name: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1.1rem",
    color: "#ffffff",
    zIndex: 2,
    lineHeight: 1.2,
  },
  desc: {
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.45,
    maxWidth: 190,
    zIndex: 2,
  },
  socialProofBadge: {
    marginTop: 6,
    fontSize: "0.7rem",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    border: "1px solid",
    borderRadius: "var(--radius-full)",
    padding: "4px 12px",
    zIndex: 2,
  },
};
