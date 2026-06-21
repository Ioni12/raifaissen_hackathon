import { useState, useEffect, useRef, useCallback } from "react";
import { Trophy, Gem, Hexagon, Square, X } from "lucide-react";

const TIER = {
  common: { hex: "#9ca3af", label: "Common", Icon: Square, order: 3, pts: 15 },
  rare: { hex: "#3b82f6", label: "Rare", Icon: Hexagon, order: 2, pts: 35 },
  ultra_rare: {
    hex: "#8b5cf6",
    label: "Ultra Rare",
    Icon: Gem,
    order: 1,
    pts: 65,
  },
  legendary: {
    hex: "#d4af37",
    label: "Legendary",
    Icon: Trophy,
    order: 0,
    pts: 110,
  },
};
const tcfg = (t) => TIER[t] || TIER.common;

// ── Shared AudioContext — created once, synchronously ─────────────────────────
let SHARED_AC = null;
function getAC() {
  if (!SHARED_AC || SHARED_AC.state === "closed") {
    SHARED_AC = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (SHARED_AC.state === "suspended") SHARED_AC.resume();
  return SHARED_AC;
}

function beep(freq, dur, vol = 0.2, type = "sine", delay = 0) {
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
    g.gain.linearRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch (_) {}
}

function noise(bandFreq, dur, vol = 0.6, delay = 0) {
  try {
    const ac = getAC(),
      now = ac.currentTime + delay;
    const sr = ac.sampleRate;
    const buf = ac.createBuffer(1, sr * dur, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = bandFreq;
    f.Q.value = 0.7;
    const g = ac.createGain();
    src.connect(f);
    f.connect(g);
    g.connect(ac.destination);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.8);
    src.start(now);
    src.stop(now + dur + 0.05);
  } catch (_) {}
}

function playIntroSweep() {
  try {
    const ac = getAC(),
      t = ac.currentTime;
    const o = ac.createOscillator(),
      g = ac.createGain();
    o.connect(g);
    g.connect(ac.destination);
    o.type = "sawtooth";
    o.frequency.setValueAtTime(40, t);
    o.frequency.exponentialRampToValueAtTime(1200, t + 0.7);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.15, t + 0.08);
    g.gain.linearRampToValueAtTime(0.18, t + 0.5);
    g.gain.linearRampToValueAtTime(0, t + 0.75);
    o.start(t);
    o.stop(t + 0.8);
    // layered sine
    const o2 = ac.createOscillator(),
      g2 = ac.createGain();
    o2.connect(g2);
    g2.connect(ac.destination);
    o2.type = "sine";
    o2.frequency.setValueAtTime(80, t);
    o2.frequency.exponentialRampToValueAtTime(600, t + 0.7);
    g2.gain.setValueAtTime(0.1, t);
    g2.gain.linearRampToValueAtTime(0, t + 0.75);
    o2.start(t);
    o2.stop(t + 0.8);
  } catch (_) {}
}

function playCardSound(index, tier) {
  try {
    const isHigh = tier === "legendary" || tier === "ultra_rare";
    const baseFreq = 280 + index * 55;
    // tick
    beep(baseFreq, isHigh ? 0.6 : 0.2, isHigh ? 0.25 : 0.14, "sine");
    noise(isHigh ? 2500 : 1200, 0.12, isHigh ? 0.5 : 0.25);

    if (tier === "legendary") {
      [523, 659, 784, 1047, 1319].forEach((f, i) => {
        beep(f, 1.2, 0.28, "triangle", i * 0.07);
      });
      beep(55, 0.35, 0.5, "sine");
    } else if (tier === "ultra_rare") {
      [440, 554, 659, 880].forEach((f, i) => {
        beep(f, 0.8, 0.22, "triangle", i * 0.065);
      });
      beep(65, 0.25, 0.4, "sine");
    } else if (tier === "rare") {
      [330, 415, 523].forEach((f, i) => beep(f, 0.5, 0.18, "sine", i * 0.06));
    }
  } catch (_) {}
}

function playCrescendo() {
  try {
    noise(2800, 0.5, 1.4);
    noise(800, 0.4, 0.6, 0.05);
    beep(55, 0.5, 0.6, "sine");
    [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => {
      beep(f, 1.4, 0.3, "triangle", 0.08 + i * 0.07);
    });
    // reverb shimmer
    [1047, 1319, 1568].forEach((f, i) => {
      beep(f, 2.0, 0.12, "sine", 0.6 + i * 0.12);
    });
  } catch (_) {}
}

// ── Full-screen canvas: ambient particles + per-card bursts ───────────────────
function FullscreenCanvas({ burstQueue, clearBurst }) {
  const ref = useRef(null);
  const particles = useRef([]);
  const rafRef = useRef(null);

  const hexToRgb = (hex) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  };

  const addBurst = useCallback((x, y, hex, count) => {
    const [R, G, B] = hexToRgb(hex);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 7;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 2,
        life: 1,
        decay: 0.008 + Math.random() * 0.015,
        size: 1.5 + Math.random() * 4,
        R,
        G,
        B,
        shape: Math.random() > 0.5 ? "circle" : "rect",
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
      });
    }
  }, []);

  // Process burst queue
  useEffect(() => {
    if (!burstQueue || burstQueue.length === 0) return;
    const cv = ref.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    burstQueue.forEach(({ x, y, hex, count }) => {
      addBurst(x - rect.left, y - rect.top, hex, count);
    });
    clearBurst();
  }, [burstQueue]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");

    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      particles.current = particles.current.filter((p) => p.life > 0);
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.98;
        p.life -= p.decay;
        p.rot += p.spin;
        if (p.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = `rgb(${p.R},${p.G},${p.B})`;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.shape === "rect")
          ctx.fillRect(-p.size / 2, -p.size * 0.4, p.size, p.size * 0.8);
        else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1001,
      }}
    />
  );
}

// ── Individual card ───────────────────────────────────────────────────────────
function PullCard({ result, index, revealed, isNew }) {
  const ref = useRef(null);
  const t = tcfg(result.tier);
  const isHigh = result.tier === "legendary" || result.tier === "ultra_rare";

  return (
    <div
      ref={ref}
      style={{
        perspective: 900,
        aspectRatio: "0.68",
        animation:
          isNew && isHigh
            ? "gacha-pop 0.45s cubic-bezier(0.175,0.885,0.32,1.275) forwards"
            : "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: `transform 0.5s cubic-bezier(0.45,0.05,0.55,0.95) ${index * 110}ms`,
          transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Back */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: 10,
            background: "linear-gradient(135deg,#1a1a2e,#080812)",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.15)",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
            }}
          >
            ✦
          </span>
        </div>
        {/* Front */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 10,
            background:
              "linear-gradient(160deg,rgba(15,15,24,1),rgba(5,5,12,1))",
            border: `1.5px solid ${t.hex}${isHigh ? "99" : "44"}`,
            boxShadow: isHigh ? `0 0 20px ${t.hex}45` : "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "8px 4px",
            overflow: "hidden",
          }}
        >
          {isHigh && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(108deg,transparent 30%,rgba(255,255,255,0.08) 50%,transparent 70%)",
                animation:
                  result.tier === "legendary"
                    ? "gacha-shimmer 1.6s ease-in-out infinite"
                    : "gacha-shimmer 1s ease-out 1 0.4s",
                pointerEvents: "none",
              }}
            />
          )}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: `${t.hex}22`,
              border: `1.5px solid ${t.hex}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isHigh ? `0 0 12px ${t.hex}50` : "none",
            }}
          >
            <t.Icon size={16} color={t.hex} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "0.42rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: t.hex,
              background: t.hex + "18",
              padding: "1px 5px",
              borderRadius: 99,
              border: `1px solid ${t.hex}33`,
            }}
          >
            {t.label}
          </span>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.48rem",
              color: "#fff",
              textAlign: "center",
              lineHeight: 1.3,
              padding: "0 3px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {result.cosmetic?.label || "Reward"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────
function PullSummary({ results }) {
  const counts = results.reduce((a, r) => {
    a[r.tier] = (a[r.tier] || 0) + 1;
    return a;
  }, {});
  const best = results.reduce((a, b) =>
    tcfg(a.tier).order < tcfg(b.tier).order ? a : b,
  );
  const bt = tcfg(best.tier);
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
        animation: "slide-up 0.4s ease forwards",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "0.56rem",
            color: "rgba(255,255,255,0.35)",
            marginBottom: 2,
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Best pull
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <bt.Icon size={13} color={bt.hex} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "0.78rem",
              color: bt.hex,
            }}
          >
            {best.cosmetic?.label}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {["legendary", "ultra_rare", "rare", "common"]
          .filter((t) => counts[t])
          .map((t) => {
            const tc = tcfg(t);
            return (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  background: tc.hex + "18",
                  border: `1px solid ${tc.hex}44`,
                  borderRadius: 99,
                  padding: "2px 7px",
                }}
              >
                <tc.Icon size={9} color={tc.hex} />
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "0.58rem",
                    color: tc.hex,
                  }}
                >
                  {counts[t]}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function MultiPullReveal({ results, onClose }) {
  const [phase, setPhase] = useState("intro"); // intro → flipping → done
  const [revealedCount, setRevealedCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const [flashColor, setFlashColor] = useState("rgba(255,255,255,0.15)");
  const [newlyRevealed, setNewlyRevealed] = useState(new Set());
  const [burstQueue, setBurstQueue] = useState([]);
  const gridRef = useRef(null);

  // Sort — best last for maximum impact
  const ordered = [...results].sort(
    (a, b) => tcfg(b.tier).order - tcfg(a.tier).order,
  );

  const doFlash = (color = "rgba(255,255,255,0.14)", dur = 150) => {
    setFlashColor(color);
    setFlash(true);
    setTimeout(() => setFlash(false), dur);
  };

  const triggerBurst = (index, tier) => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll("[data-card]");
    const card = cards[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const t = tcfg(tier);
    const isHigh = tier === "legendary" || tier === "ultra_rare";
    setBurstQueue((prev) => [
      ...prev,
      { x: cx, y: cy, hex: t.hex, count: t.pts },
    ]);
    if (isHigh) doFlash(`${t.hex}30`, tier === "legendary" ? 250 : 180);
  };

  useEffect(() => {
    // Audio: must work because vault pre-unlocked the context on button click
    playIntroSweep();
    doFlash("rgba(255,255,255,0.2)", 200);

    // Wait for intro, then start revealing
    setTimeout(() => {
      setPhase("flipping");
      ordered.forEach((result, i) => {
        setTimeout(() => {
          setRevealedCount((c) => c + 1);
          setNewlyRevealed((prev) => new Set([...prev, i]));
          playCardSound(i, result.tier);
          triggerBurst(i, result.tier);
        }, i * 160);
      });

      // Crescendo after last card
      const finalDelay = ordered.length * 160 + 500;
      setTimeout(() => {
        playCrescendo();
        doFlash("rgba(255,255,255,0.22)", 300);
        // Big burst from center
        setBurstQueue((prev) => [
          ...prev,
          {
            x: window.innerWidth / 2,
            y: window.innerHeight * 0.45,
            hex: "#d4af37",
            count: 120,
          },
        ]);
        setTimeout(() => setPhase("done"), 300);
      }, finalDelay);
    }, 600);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(1,1,8,0.97)",
        backdropFilter: "blur(14px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 14px",
      }}
    >
      {/* Canvas layer */}
      <FullscreenCanvas
        burstQueue={burstQueue}
        clearBurst={() => setBurstQueue([])}
      />

      {/* Screen flash */}
      {flash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1002,
            pointerEvents: "none",
            background: flashColor,
            animation: "theme-flash 200ms ease forwards",
          }}
        />
      )}

      {/* Intro slam */}
      {phase === "intro" && (
        <div
          style={{
            position: "absolute",
            zIndex: 1003,
            pointerEvents: "none",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "2.8rem",
            color: "#fff",
            letterSpacing: "-0.02em",
            textShadow:
              "0 0 50px rgba(212,175,55,0.7), 0 0 100px rgba(123,104,238,0.4)",
            animation:
              "gacha-pop 0.45s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
          }}
        >
          ✦ 10 PULL ✦
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 420,
          marginBottom: 10,
          zIndex: 3,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "0.62rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.3)",
              margin: 0,
            }}
          >
            {phase === "done"
              ? "All Revealed"
              : `${revealedCount} / 10 revealed`}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "1.1rem",
              color: "#fff",
              margin: 0,
            }}
          >
            Your 10-Pull Haul
          </h2>
        </div>
        {phase === "done" && (
          <button
            onClick={onClose}
            style={{
              width: 33,
              height: 33,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 3,
            }}
          >
            <X size={14} color="rgba(255,255,255,0.55)" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      {phase === "flipping" && (
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            height: 3,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 3,
            marginBottom: 12,
            overflow: "hidden",
            zIndex: 3,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 3,
              background: "linear-gradient(90deg,#7b68ee,#d4af37,#ff4d2e)",
              backgroundSize: "200% 100%",
              width: `${revealedCount * 10}%`,
              transition: "width 0.12s linear",
              animation: "chromatic-shift 2s ease infinite",
              boxShadow: "0 0 10px rgba(212,175,55,0.6)",
            }}
          />
        </div>
      )}

      {/* Summary */}
      <div style={{ width: "100%", maxWidth: 420, zIndex: 3 }}>
        {phase === "done" && <PullSummary results={ordered} />}
      </div>

      {/* Card grid */}
      <div
        ref={gridRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 7,
          width: "100%",
          maxWidth: 420,
          zIndex: 3,
        }}
      >
        {ordered.map((result, i) => (
          <div key={i} data-card={i}>
            <PullCard
              result={result}
              index={i}
              revealed={i < revealedCount}
              isNew={newlyRevealed.has(i)}
            />
          </div>
        ))}
      </div>

      {/* CTA */}
      {phase === "done" && (
        <button
          className="btn btn-primary"
          style={{
            marginTop: 18,
            minWidth: 220,
            fontSize: "0.95rem",
            padding: "14px 28px",
            animation: "gacha-rise 0.5s ease forwards",
            zIndex: 3,
            background: "linear-gradient(135deg,#7b68ee,#d4af37)",
            boxShadow: "0 4px 24px rgba(123,104,238,0.4)",
          }}
          onClick={onClose}
        >
          Add to Collection ✦
        </button>
      )}
    </div>
  );
}
