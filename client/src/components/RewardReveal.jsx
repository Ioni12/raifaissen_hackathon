import { useState, useEffect, useRef } from "react";
import { Trophy, Gem, Hexagon, Square } from "lucide-react";

// ─── Tier config ──────────────────────────────────────────────────────────────
const TIER = {
  common: {
    hex: "#9ca3af",
    label: "Common",
    Icon: Square,
    particles: 28,
    chargeMs: 1000,
    shakeMs: 80,
  },
  rare: {
    hex: "#3b82f6",
    label: "Rare",
    Icon: Hexagon,
    particles: 50,
    chargeMs: 1300,
    shakeMs: 120,
  },
  ultra_rare: {
    hex: "#8b5cf6",
    label: "Ultra Rare",
    Icon: Gem,
    particles: 75,
    chargeMs: 1700,
    shakeMs: 160,
  },
  legendary: {
    hex: "#d4af37",
    label: "Legendary",
    Icon: Trophy,
    particles: 120,
    chargeMs: 2200,
    shakeMs: 200,
  },
};
const cfg = (tier) => TIER[tier] || TIER.common;

// ─── Web Audio ────────────────────────────────────────────────────────────────
let _actx = null;
function getACtx() {
  if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
  if (_actx.state === "suspended") _actx.resume();
  return _actx;
}

function playCharge(tier) {
  try {
    const ac = getACtx(),
      t = ac.currentTime;
    const dur = cfg(tier).chargeMs / 1000;
    // Low rumble that builds
    const osc = ac.createOscillator(),
      g = ac.createGain();
    osc.connect(g);
    g.connect(ac.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(40, t);
    osc.frequency.exponentialRampToValueAtTime(
      tier === "legendary" ? 660 : 330,
      t + dur,
    );
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.2);
    g.gain.linearRampToValueAtTime(0.09, t + dur - 0.15);
    g.gain.linearRampToValueAtTime(0, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.05);

    if (tier === "ultra_rare" || tier === "legendary") {
      const o2 = ac.createOscillator(),
        g2 = ac.createGain();
      o2.connect(g2);
      g2.connect(ac.destination);
      o2.type = "sine";
      o2.frequency.setValueAtTime(110, t);
      o2.frequency.exponentialRampToValueAtTime(1320, t + dur);
      g2.gain.setValueAtTime(0, t);
      g2.gain.linearRampToValueAtTime(0.03, t + dur * 0.6);
      g2.gain.linearRampToValueAtTime(0, t + dur);
      o2.start(t);
      o2.stop(t + dur + 0.05);
    }
  } catch (_) {}
}

function playBurst(tier) {
  try {
    const ac = getACtx(),
      now = ac.currentTime;
    // Impact thud
    const sr = ac.sampleRate;
    const buf = ac.createBuffer(1, sr * 0.3, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const flt = ac.createBiquadFilter();
    flt.type = "bandpass";
    flt.frequency.value =
      { legendary: 3000, ultra_rare: 2000, rare: 1200, common: 800 }[tier] ||
      1200;
    flt.Q.value = 0.5;
    const ng = ac.createGain();
    src.connect(flt);
    flt.connect(ng);
    ng.connect(ac.destination);
    ng.gain.setValueAtTime(1.0, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    src.start(now);
    src.stop(now + 0.3);

    // Sub-bass punch
    const sub = ac.createOscillator(),
      sg = ac.createGain();
    sub.connect(sg);
    sg.connect(ac.destination);
    sub.type = "sine";
    sub.frequency.value = 60;
    sg.gain.setValueAtTime(0.4, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    sub.start(now);
    sub.stop(now + 0.2);

    // Arpeggio chime
    const chimes = {
      common: [[262, 0]],
      rare: [
        [330, 0],
        [415, 0.09],
      ],
      ultra_rare: [
        [440, 0],
        [554, 0.08],
        [659, 0.16],
      ],
      legendary: [
        [523, 0],
        [659, 0.08],
        [784, 0.16],
        [1047, 0.25],
        [1319, 0.36],
      ],
    }[tier] || [[262, 0]];
    chimes.forEach(([freq, delay]) => {
      const o = ac.createOscillator(),
        g = ac.createGain();
      o.connect(g);
      g.connect(ac.destination);
      o.type = tier === "legendary" ? "triangle" : "sine";
      o.frequency.value = freq;
      const st = now + delay;
      g.gain.setValueAtTime(0, st);
      g.gain.linearRampToValueAtTime(0.3, st + 0.02);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        st + (tier === "legendary" ? 1.6 : 0.9),
      );
      o.start(st);
      o.stop(st + 1.8);
    });
  } catch (_) {}
}

// ─── Canvas scene (handles both charge portal + burst particles) ──────────────
function GachaCanvas({ tier, hex, phase, chargeProgress }) {
  const ref = useRef(null);
  const rafR = useRef(null);
  const stateRef = useRef({
    phase,
    chargeProgress,
    particles: [],
    shockwaves: [],
    initiated: false,
  });

  // Parse hex once
  const rgb = useRef(null);
  if (!rgb.current) {
    const h = hex.replace("#", "");
    rgb.current = [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  const [R, G, B] = rgb.current;

  useEffect(() => {
    stateRef.current.phase = phase;
    stateRef.current.chargeProgress = chargeProgress;

    if (phase === "burst" && !stateRef.current.initiated) {
      stateRef.current.initiated = true;
      const count = cfg(tier).particles;
      const cv = ref.current;
      if (!cv) return;
      const cx = cv.width / 2,
        cy = cv.height / 2;

      // Burst particles — mix of types
      stateRef.current.particles = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const burst = 3 + Math.random() * (tier === "legendary" ? 9 : 6);
        return {
          x: cx,
          y: cy,
          vx: Math.cos(angle) * burst,
          vy: Math.sin(angle) * burst - 1.5,
          life: 1,
          decay: 0.007 + Math.random() * 0.013,
          size: 2 + Math.random() * (tier === "legendary" ? 6 : 4),
          type: ["circle", "diamond", "streak"][Math.floor(Math.random() * 3)],
          rot: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.25,
          bright: 0.6 + Math.random() * 0.4,
        };
      });
      // Shockwave rings
      stateRef.current.shockwaves = [
        { r: 0, life: 1, width: 4 },
        { r: 0, life: 0.85, width: 2, delay: 8 },
        { r: 0, life: 0.7, width: 1.5, delay: 18 },
      ];
    }
  }, [phase, chargeProgress]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width,
      H = cv.height,
      cx = W / 2,
      cy = H / 2;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const {
        phase: p,
        chargeProgress: cp,
        particles,
        shockwaves,
      } = stateRef.current;
      frame++;

      // ── CHARGE: portal vortex ────────────────────────────────────────────
      if (p === "charging") {
        const progress = Math.max(0, Math.min(1, cp));
        const orbR = 28 + progress * 18;

        // Outer energy ring — pulses
        const pulse = 0.7 + 0.3 * Math.sin(frame * 0.12);
        ctx.beginPath();
        ctx.arc(cx, cy, orbR * 1.8 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${R},${G},${B},${0.12 * progress})`;
        ctx.lineWidth = 8;
        ctx.stroke();

        // Mid ring
        ctx.beginPath();
        ctx.arc(cx, cy, orbR * 1.35, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${R},${G},${B},${0.25 * progress})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Energy tendrils radiating outward
        const tendrils = 6 + Math.floor(progress * 4);
        for (let i = 0; i < tendrils; i++) {
          const baseAngle = (i / tendrils) * Math.PI * 2 + frame * 0.04;
          const len = (20 + Math.random() * 30) * progress;
          const wobble = Math.sin(frame * 0.2 + i) * 0.3;
          ctx.beginPath();
          ctx.moveTo(
            cx + Math.cos(baseAngle) * orbR,
            cy + Math.sin(baseAngle) * orbR,
          );
          ctx.lineTo(
            cx + Math.cos(baseAngle + wobble) * (orbR + len),
            cy + Math.sin(baseAngle + wobble) * (orbR + len),
          );
          ctx.strokeStyle = `rgba(${R},${G},${B},${0.35 * progress * (0.5 + Math.random() * 0.5)})`;
          ctx.lineWidth = 1 + Math.random();
          ctx.stroke();
        }

        // Core glow
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR);
        grd.addColorStop(0, `rgba(${R},${G},${B},${0.5 * progress})`);
        grd.addColorStop(0.5, `rgba(${R},${G},${B},${0.2 * progress})`);
        grd.addColorStop(1, `rgba(${R},${G},${B},0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // ── BURST: shockwaves + particles ────────────────────────────────────
      if (p === "burst" || p === "done") {
        // Shockwave rings
        shockwaves.forEach((sw) => {
          if (sw.delay && frame < sw.delay) return;
          sw.r += 7;
          sw.life -= 0.028;
          if (sw.life > 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, sw.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${R},${G},${B},${sw.life * 0.7})`;
            ctx.lineWidth = sw.width;
            ctx.stroke();
          }
        });

        // Particles
        particles.forEach((pt) => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.14; // gravity
          pt.vx *= 0.985; // air resistance
          pt.life -= pt.decay;
          pt.rot += pt.spin;
          if (pt.life <= 0) return;

          const alpha = Math.max(0, pt.life) * pt.bright;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = `rgb(${Math.min(255, (R + 30) | 0)},${Math.min(255, (G + 20) | 0)},${B})`;
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.rot);

          if (pt.type === "diamond") {
            ctx.beginPath();
            ctx.moveTo(0, -pt.size * 1.5);
            ctx.lineTo(pt.size * 0.7, 0);
            ctx.lineTo(0, pt.size * 1.5);
            ctx.lineTo(-pt.size * 0.7, 0);
            ctx.closePath();
            ctx.fill();
          } else if (pt.type === "streak") {
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillRect(
              -pt.size * 0.3,
              -pt.size * 2,
              pt.size * 0.6,
              pt.size * 4,
            );
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
            ctx.fill();
            // Inner bright core
            ctx.globalAlpha = alpha;
            ctx.fillStyle = `rgba(255,255,255,0.6)`;
            ctx.beginPath();
            ctx.arc(0, 0, pt.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }

      const alive =
        p === "charging" ||
        particles.some((pt) => pt.life > 0) ||
        shockwaves.some(
          (sw) => sw.life > 0 && (!sw.delay || frame >= sw.delay),
        );

      if (alive || p === "charging") {
        rafR.current = requestAnimationFrame(draw);
      }
    };

    rafR.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafR.current);
  }, []);

  return (
    <canvas
      ref={ref}
      width={380}
      height={320}
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

  const [phase, setPhase] = useState("idle");
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const [progress, setProgress] = useState(0); // 0→1 during charge

  const intervalRef = useRef(null);
  const started = useRef(false);

  const run = () => {
    if (started.current) return;
    started.current = true;
    playCharge(tier);
    setPhase("charging");

    const start = Date.now();
    const dur = t.chargeMs;
    intervalRef.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setProgress(p);
      if (p >= 1) clearInterval(intervalRef.current);
    }, 32);

    setTimeout(() => {
      clearInterval(intervalRef.current);
      setProgress(1);
      setPhase("burst");
      setFlash(true);
      setShake(true);
      playBurst(tier);
      setTimeout(() => setFlash(false), 100);
      setTimeout(() => setShake(false), t.shakeMs);
      setTimeout(() => {
        setPhase("done");
        onComplete?.();
      }, 700);
    }, dur);
  };

  useEffect(() => {
    if (!autoPlay) return;
    const id = setTimeout(run, 100);
    return () => {
      clearTimeout(id);
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      style={{
        ...S.root,
        animation: shake ? `gacha-shake ${t.shakeMs}ms linear` : "none",
      }}
      onClick={phase === "idle" ? run : undefined}
    >
      {/* Screen flash */}
      {flash && <div style={{ ...S.flash, background: t.hex + "60" }} />}

      {/* Ambient radial glow — grows as charge progresses */}
      <div
        style={{
          ...S.ambientGlow,
          opacity: phase === "idle" ? 0 : phase === "charging" ? progress : 1,
          background: `radial-gradient(ellipse 65% 45% at 50% 58%, ${t.hex}40 0%, transparent 70%)`,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Canvas — charge portal + burst particles */}
      {phase !== "idle" && (
        <GachaCanvas
          tier={tier}
          hex={t.hex}
          phase={phase}
          chargeProgress={progress}
        />
      )}

      {/* ── IDLE ── */}
      {phase === "idle" && (
        <div style={S.idleWrap} onClick={run}>
          <div
            style={{
              ...S.chestOrb,
              borderColor: t.hex + "60",
              boxShadow: `0 0 40px ${t.hex}25, inset 0 0 20px ${t.hex}15`,
            }}
          >
            <t.Icon size={42} color={t.hex} />
          </div>
          <span style={{ ...S.tapLabel, color: t.hex }}>Tap to reveal</span>
          <span
            style={{
              ...S.tierBadge,
              color: t.hex,
              background: t.hex + "18",
              border: `1px solid ${t.hex}40`,
            }}
          >
            {t.label}
          </span>
        </div>
      )}

      {/* ── CHARGING ── */}
      {phase === "charging" && (
        <div style={S.chargeWrap}>
          {/* Progress arc */}
          <svg
            width={160}
            height={160}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 4,
            }}
          >
            <circle
              cx={80}
              cy={80}
              r={70}
              fill="none"
              stroke={t.hex + "20"}
              strokeWidth={3}
            />
            <circle
              cx={80}
              cy={80}
              r={70}
              fill="none"
              stroke={t.hex}
              strokeWidth={3}
              strokeDasharray={`${440 * progress} 440`}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
              style={{
                transition: "stroke-dasharray 0.1s linear",
                filter: `drop-shadow(0 0 6px ${t.hex})`,
              }}
            />
          </svg>
          {/* Icon */}
          <div
            style={{
              ...S.chargeIcon,
              background: t.hex + "18",
              borderColor: t.hex + "50",
              transform: `scale(${0.92 + progress * 0.1})`,
              boxShadow: `0 0 ${20 + progress * 30}px ${t.hex}${Math.floor(
                progress * 0x50,
              )
                .toString(16)
                .padStart(2, "0")}`,
            }}
          >
            <t.Icon size={38} color={t.hex} />
          </div>
          <p style={{ ...S.chargeText, color: t.hex }}>
            {isLegendary
              ? "Something legendary…"
              : isHighTier
                ? "Unlocking…"
                : "Opening…"}
          </p>
        </div>
      )}

      {/* ── BURST / DONE ── */}
      {(phase === "burst" || phase === "done") && (
        <div style={S.revealWrap}>
          {/* Backdrop glow */}
          <div
            style={{
              ...S.revealGlow,
              background: `radial-gradient(ellipse 80% 60% at 50% 55%, ${t.hex}45 0%, transparent 65%)`,
            }}
          />

          {/* Card rises from below */}
          <div
            style={{
              ...S.card,
              borderColor: isHighTier ? t.hex + "aa" : t.hex + "66",
              boxShadow: isLegendary
                ? `0 0 0 1px ${t.hex}55, 0 8px 40px ${t.hex}50, 0 0 80px ${t.hex}25`
                : isHighTier
                  ? `0 0 0 1px ${t.hex}44, 0 6px 28px ${t.hex}40`
                  : `0 0 0 1px ${t.hex}33, 0 4px 18px ${t.hex}30`,
              animation: "gacha-rise 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
            }}
          >
            {/* Shimmer */}
            <div
              style={{
                ...S.shimmer,
                animation: isLegendary
                  ? "gacha-shimmer 2s ease-in-out infinite 0.6s"
                  : "gacha-shimmer 0.9s ease-out 1 0.6s",
              }}
            />

            {/* Glow border pulse for legendary */}
            {isLegendary && (
              <div
                style={{
                  position: "absolute",
                  inset: -1,
                  borderRadius: "var(--radius-xl)",
                  border: `1px solid ${t.hex}88`,
                  animation: "gacha-border-pulse 2s ease-in-out infinite",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            )}

            {/* Icon orb */}
            <div
              style={{
                ...S.iconOrb,
                background: `radial-gradient(circle, ${t.hex}35 0%, ${t.hex}10 60%, transparent 100%)`,
                border: `1.5px solid ${t.hex}55`,
                boxShadow: `0 0 24px ${t.hex}40`,
              }}
            >
              <t.Icon size={isLegendary ? 46 : 38} color={t.hex} />
            </div>

            {/* Tier pill */}
            <span
              style={{
                ...S.pill,
                color: t.hex,
                background: t.hex + "18",
                border: `1px solid ${t.hex}44`,
              }}
            >
              {t.label}
            </span>

            {/* Name */}
            <div style={S.rewardName}>{reward?.label || "Reward"}</div>

            {/* Description */}
            {reward?.description && (
              <div style={S.rewardDesc}>{reward.description}</div>
            )}

            {/* Legendary social proof */}
            {isLegendary && (
              <div
                style={{
                  ...S.proof,
                  borderColor: t.hex + "44",
                  color: t.hex + "cc",
                }}
              >
                🏆 Held by very few
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
    minHeight: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: "var(--radius-lg)",
    background: "rgba(4,4,10,0.96)",
  },
  flash: {
    position: "absolute",
    inset: 0,
    zIndex: 20,
    pointerEvents: "none",
    borderRadius: "var(--radius-lg)",
    animation: "theme-flash 120ms ease forwards",
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
    zIndex: 5,
    padding: "32px 0",
    userSelect: "none",
  },
  chestOrb: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.5)",
    transition: "box-shadow 0.3s ease",
  },
  tapLabel: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.88rem",
    letterSpacing: "0.05em",
    margin: 0,
  },
  tierBadge: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "0.6rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    padding: "4px 14px",
    borderRadius: "var(--radius-full)",
  },
  // charge
  chargeWrap: {
    position: "relative",
    width: 220,
    height: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  chargeIcon: {
    width: 86,
    height: 86,
    borderRadius: "50%",
    border: "2px solid",
    position: "relative",
    zIndex: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.1s ease, box-shadow 0.1s ease",
  },
  chargeText: {
    position: "absolute",
    bottom: 6,
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.8rem",
    letterSpacing: "0.06em",
    margin: 0,
    zIndex: 5,
  },
  // reveal
  revealWrap: {
    position: "relative",
    width: "100%",
    minHeight: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  revealGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 1,
  },
  card: {
    position: "relative",
    zIndex: 6,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    background:
      "linear-gradient(160deg, rgba(18,18,28,0.98) 0%, rgba(8,8,16,0.98) 100%)",
    border: "1px solid",
    borderRadius: "var(--radius-xl)",
    padding: "28px 36px 24px",
    textAlign: "center",
    minWidth: 230,
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 7,
    background:
      "linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)",
  },
  iconOrb: {
    width: 82,
    height: 82,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 2,
    marginBottom: 4,
  },
  pill: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "0.6rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    padding: "3px 12px",
    borderRadius: "var(--radius-full)",
    zIndex: 2,
  },
  rewardName: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1.15rem",
    color: "#ffffff",
    zIndex: 2,
    lineHeight: 1.2,
  },
  rewardDesc: {
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.5,
    maxWidth: 200,
    zIndex: 2,
  },
  proof: {
    marginTop: 6,
    fontSize: "0.68rem",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    border: "1px solid",
    borderRadius: "var(--radius-full)",
    padding: "4px 14px",
    zIndex: 2,
  },
};
