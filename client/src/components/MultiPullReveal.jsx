import { useState, useEffect, useRef } from "react";
import { Trophy, Gem, Hexagon, Square, X } from "lucide-react";

const TIER = {
  common: { hex: "#9ca3af", label: "Common", Icon: Square, order: 3 },
  rare: { hex: "#3b82f6", label: "Rare", Icon: Hexagon, order: 2 },
  ultra_rare: { hex: "#8b5cf6", label: "Ultra Rare", Icon: Gem, order: 1 },
  legendary: { hex: "#d4af37", label: "Legendary", Icon: Trophy, order: 0 },
};
const tcfg = (t) => TIER[t] || TIER.common;

// ── Audio ─────────────────────────────────────────────────────────────────────
let _actx = null;
function ac() {
  if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
  if (_actx.state === "suspended") _actx.resume();
  return _actx;
}

function playIntro() {
  try {
    const ctx = ac(),
      now = ctx.currentTime;
    // Rising whoosh
    const osc = ctx.createOscillator(),
      g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.6);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.1);
    g.gain.linearRampToValueAtTime(0, now + 0.65);
    osc.start(now);
    osc.stop(now + 0.7);
  } catch (_) {}
}

function playCardFlip(index, tier) {
  try {
    const ctx = ac(),
      now = ctx.currentTime;
    const isHigh = tier === "legendary" || tier === "ultra_rare";
    // Base tick
    const baseFreq = 300 + index * 60;
    const osc = ctx.createOscillator(),
      g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = baseFreq;
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + (isHigh ? 0.5 : 0.18));
    osc.start(now);
    osc.stop(now + 0.6);

    if (isHigh) {
      // Extra chime burst for rare+
      const freqs =
        tier === "legendary" ? [523, 659, 784, 1047] : [440, 554, 659];
      freqs.forEach((freq, i) => {
        const o = ctx.createOscillator(),
          gn = ctx.createGain();
        o.connect(gn);
        gn.connect(ctx.destination);
        o.type = "triangle";
        o.frequency.value = freq;
        const t = now + i * 0.06;
        gn.gain.setValueAtTime(0, t);
        gn.gain.linearRampToValueAtTime(0.2, t + 0.02);
        gn.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        o.start(t);
        o.stop(t + 0.7);
      });
      // Sub punch
      const sub = ctx.createOscillator(),
        sg = ctx.createGain();
      sub.connect(sg);
      sg.connect(ctx.destination);
      sub.type = "sine";
      sub.frequency.value = 80;
      sg.gain.setValueAtTime(0.35, now);
      sg.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      sub.start(now);
      sub.stop(now + 0.25);
    }
  } catch (_) {}
}

function playCrescendo() {
  try {
    const ctx = ac(),
      now = ctx.currentTime;
    // Big impact noise
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, sr * 0.4, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = "bandpass";
    flt.frequency.value = 2000;
    flt.Q.value = 0.5;
    const ng = ctx.createGain();
    src.connect(flt);
    flt.connect(ng);
    ng.connect(ctx.destination);
    ng.gain.setValueAtTime(1.2, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    src.start(now);
    src.stop(now + 0.4);

    // Sub bass
    const sub = ctx.createOscillator(),
      sg = ctx.createGain();
    sub.connect(sg);
    sg.connect(ctx.destination);
    sub.type = "sine";
    sub.frequency.value = 55;
    sg.gain.setValueAtTime(0.5, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    sub.start(now);
    sub.stop(now + 0.35);

    // Victory arpeggio
    [523, 659, 784, 1047, 1319, 1568].forEach((freq, i) => {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "triangle";
      o.frequency.value = freq;
      const t = now + 0.1 + i * 0.07;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
      o.start(t);
      o.stop(t + 1.1);
    });
  } catch (_) {}
}

// ── Canvas confetti (fires at crescendo) ─────────────────────────────────────
function Confetti({ active }) {
  const ref = useRef(null);
  const raf = useRef(null);

  useEffect(() => {
    if (!active) return;
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width,
      H = cv.height;
    const colors = [
      "#d4af37",
      "#3b82f6",
      "#8b5cf6",
      "#f472b6",
      "#22c55e",
      "#00e5ff",
      "#ff4d2e",
    ];
    const pts = Array.from({ length: 120 }, () => ({
      x: W * 0.5,
      y: H * 0.4,
      vx: (Math.random() - 0.5) * 14,
      vy: -6 - Math.random() * 10,
      life: 1,
      decay: 0.006 + Math.random() * 0.008,
      size: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.25,
      shape: Math.random() > 0.4 ? "rect" : "circle",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;
        p.vx *= 0.99;
        p.life -= p.decay;
        p.rot += p.spin;
        if (p.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.shape === "rect")
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      if (pts.some((p) => p.life > 0))
        raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  return (
    <canvas
      ref={ref}
      width={500}
      height={700}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1001,
      }}
    />
  );
}

// ── PullCard ─────────────────────────────────────────────────────────────────
function PullCard({ result, index, revealed, isHighlight }) {
  const t = tcfg(result.tier);
  const isHigh = result.tier === "legendary" || result.tier === "ultra_rare";

  return (
    <div
      style={{
        perspective: 900,
        aspectRatio: "0.68",
        animation: isHighlight
          ? "gacha-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards"
          : "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: `transform 0.55s cubic-bezier(0.45,0.05,0.55,0.95) ${index * 100}ms`,
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
            background: "linear-gradient(135deg,#1a1a2e,#0a0a16)",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Mystery symbol */}
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "0.6rem", opacity: 0.4 }}>✦</span>
          </div>
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
              "linear-gradient(160deg,rgba(16,16,26,0.99),rgba(6,6,14,0.99))",
            border: `1.5px solid ${t.hex}${isHigh ? "99" : "44"}`,
            boxShadow: isHigh
              ? `0 0 ${isHighlight ? 28 : 16}px ${t.hex}50`
              : "none",
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
                  "linear-gradient(108deg,transparent 30%,rgba(255,255,255,0.07) 50%,transparent 70%)",
                animation:
                  result.tier === "legendary"
                    ? "gacha-shimmer 1.8s ease-in-out infinite"
                    : "gacha-shimmer 1s ease-out 1 0.3s",
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
              boxShadow: isHigh ? `0 0 10px ${t.hex}40` : "none",
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
  const counts = results.reduce((acc, r) => {
    acc[r.tier] = (acc[r.tier] || 0) + 1;
    return acc;
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
        marginBottom: 16,
        animation: "slide-up 0.4s ease forwards",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "0.58rem",
            color: "rgba(255,255,255,0.35)",
            marginBottom: 3,
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Best pull
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <bt.Icon size={14} color={bt.hex} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "0.8rem",
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
                  padding: "3px 8px",
                }}
              >
                <tc.Icon size={10} color={tc.hex} />
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "0.62rem",
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
  const [flipCount, setFlipCount] = useState(0); // how many have flipped so far
  const [flash, setFlash] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [highlights, setHighlights] = useState(new Set());

  // Sort by tier for dramatic ordering — commons first, legendary last
  const ordered = [...results].sort(
    (a, b) => tcfg(b.tier).order - tcfg(a.tier).order,
  );

  useEffect(() => {
    // Unlock audio on mount
    try {
      ac();
    } catch (_) {}

    // Phase 1: intro flash + whoosh
    playIntro();
    setFlash(true);
    setTimeout(() => setFlash(false), 180);

    // Phase 2: start flipping after intro
    setTimeout(() => {
      setPhase("flipping");
      ordered.forEach((result, i) => {
        const delay = i * 140;
        setTimeout(() => {
          setFlipCount((c) => c + 1);
          playCardFlip(i, result.tier);

          // Flash screen on high-tier reveals
          const isHigh =
            result.tier === "legendary" || result.tier === "ultra_rare";
          if (isHigh) {
            setTimeout(() => {
              setFlash(true);
              setHighlights((prev) => new Set([...prev, i]));
              setTimeout(() => setFlash(false), 120);
            }, 280); // after the card has started flipping
          }
        }, delay);
      });

      // Phase 3: crescendo after last card
      const totalDelay = ordered.length * 140 + 600;
      setTimeout(() => {
        playCrescendo();
        setFlash(true);
        setConfetti(true);
        setTimeout(() => setFlash(false), 100);
        setPhase("done");
      }, totalDelay);
    }, 500);
  }, []);

  const revealed = phase === "flipping" || phase === "done";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(2,2,8,0.97)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Screen flash */}
      {flash && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1002,
            pointerEvents: "none",
            background: "rgba(255,255,255,0.12)",
            animation: "theme-flash 180ms ease forwards",
          }}
        />
      )}

      {/* Confetti */}
      <Confetti active={confetti} />

      {/* Intro slam text */}
      {phase === "intro" && (
        <div
          style={{
            position: "absolute",
            zIndex: 1003,
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "3rem",
            color: "#fff",
            letterSpacing: "-0.02em",
            animation:
              "gacha-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
            textShadow: "0 0 40px rgba(212,175,55,0.6)",
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
          marginBottom: 12,
          zIndex: 2,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.35)",
              margin: 0,
            }}
          >
            {phase === "done" ? "All Revealed" : `${flipCount} / 10`}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "1.15rem",
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
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={15} color="rgba(255,255,255,0.6)" />
          </button>
        )}
      </div>

      {/* Progress bar during flip */}
      {phase === "flipping" && (
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            height: 2,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
            marginBottom: 14,
            overflow: "hidden",
            zIndex: 2,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 2,
              background: "linear-gradient(90deg,#7b68ee,#d4af37)",
              width: `${flipCount * 10}%`,
              transition: "width 0.12s linear",
              boxShadow: "0 0 8px rgba(212,175,55,0.5)",
            }}
          />
        </div>
      )}

      {/* Summary */}
      <div style={{ width: "100%", maxWidth: 420, zIndex: 2 }}>
        {phase === "done" && <PullSummary results={ordered} />}
      </div>

      {/* 5×2 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 8,
          width: "100%",
          maxWidth: 420,
          zIndex: 2,
        }}
      >
        {ordered.map((result, i) => (
          <PullCard
            key={i}
            result={result}
            index={i}
            revealed={revealed && i < flipCount}
            isHighlight={highlights.has(i)}
          />
        ))}
      </div>

      {/* CTA */}
      {phase === "done" && (
        <button
          className="btn btn-primary"
          style={{
            marginTop: 20,
            minWidth: 220,
            fontSize: "1rem",
            padding: "14px 28px",
            animation: "gacha-rise 0.5s ease forwards",
            zIndex: 2,
          }}
          onClick={onClose}
        >
          Add to Collection ✦
        </button>
      )}
    </div>
  );
}
