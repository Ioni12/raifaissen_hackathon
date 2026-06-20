import { useState, useEffect } from "react";
import { Trophy, Gem, Hexagon, Square, X } from "lucide-react";

const TIER = {
  common: { hex: "#9ca3af", label: "Common", Icon: Square },
  rare: { hex: "#3b82f6", label: "Rare", Icon: Hexagon },
  ultra_rare: { hex: "#8b5cf6", label: "Ultra Rare", Icon: Gem },
  legendary: { hex: "#d4af37", label: "Legendary", Icon: Trophy },
};
const tcfg = (tier) => TIER[tier] || TIER.common;

// Individual card in the grid — flips in with staggered delay
function PullCard({ result, index, revealed }) {
  const t = tcfg(result.tier);
  const isHigh = result.tier === "legendary" || result.tier === "ultra_rare";

  return (
    <div
      style={{
        perspective: 800,
        aspectRatio: "0.7",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: `transform 0.5s cubic-bezier(0.45,0.05,0.55,0.95) ${index * 80}ms`,
          transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Card back (shown first) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: 10,
            background: "linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        </div>

        {/* Card front (revealed) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 10,
            background: `linear-gradient(160deg, rgba(18,18,28,0.98) 0%, rgba(8,8,16,0.98) 100%)`,
            border: `1.5px solid ${t.hex}${isHigh ? "88" : "44"}`,
            boxShadow: isHigh ? `0 0 16px ${t.hex}40` : "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "8px 4px",
            overflow: "hidden",
          }}
        >
          {/* Shimmer for high tiers */}
          {isHigh && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(108deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)",
                animation:
                  result.tier === "legendary"
                    ? "gacha-shimmer 2s ease-in-out infinite"
                    : "gacha-shimmer 1s ease-out 1 0.5s",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Icon */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `${t.hex}20`,
              border: `1px solid ${t.hex}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <t.Icon size={18} color={t.hex} />
          </div>

          {/* Tier pill */}
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "0.45rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: t.hex,
              background: t.hex + "18",
              padding: "2px 6px",
              borderRadius: 99,
              border: `1px solid ${t.hex}33`,
            }}
          >
            {t.label}
          </span>

          {/* Reward name */}
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.5rem",
              color: "#fff",
              textAlign: "center",
              lineHeight: 1.3,
              padding: "0 4px",
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

// Summary bar — best pull + tier counts
function PullSummary({ results }) {
  const counts = results.reduce((acc, r) => {
    acc[r.tier] = (acc[r.tier] || 0) + 1;
    return acc;
  }, {});

  const best = results.reduce((a, b) => {
    const order = ["legendary", "ultra_rare", "rare", "common"];
    return order.indexOf(a.tier) < order.indexOf(b.tier) ? a : b;
  });
  const bt = tcfg(best.tier);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <div>
        <div
          style={{
            fontSize: "0.62rem",
            color: "rgba(255,255,255,0.4)",
            marginBottom: 3,
            fontFamily: "var(--font-display)",
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
              fontSize: "0.78rem",
              color: bt.hex,
            }}
          >
            {best.cosmetic?.label}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
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
                  padding: "2px 8px",
                }}
              >
                <tc.Icon size={10} color={tc.hex} />
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "0.6rem",
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

export default function MultiPullReveal({ results, onClose }) {
  const [revealed, setRevealed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Small delay before flipping so user sees the backs first
    const t1 = setTimeout(() => setRevealed(true), 300);
    // Show summary after all cards have flipped
    const t2 = setTimeout(() => setShowAll(true), 300 + 10 * 80 + 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(2,2,8,0.96)",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 420,
          marginBottom: 16,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.4)",
              margin: 0,
            }}
          >
            10 Pull Results
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "1.2rem",
              color: "#fff",
              margin: 0,
            }}
          >
            Your Haul
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={16} color="rgba(255,255,255,0.7)" />
        </button>
      </div>

      {/* Summary */}
      <div style={{ width: "100%", maxWidth: 420 }}>
        {showAll && <PullSummary results={results} />}
      </div>

      {/* 5×2 grid of cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 8,
          width: "100%",
          maxWidth: 420,
        }}
      >
        {results.map((result, i) => (
          <PullCard key={i} result={result} index={i} revealed={revealed} />
        ))}
      </div>

      {/* CTA */}
      {showAll && (
        <button
          className="btn btn-primary"
          style={{
            marginTop: 24,
            minWidth: 200,
            animation: "slide-up 0.4s ease forwards",
          }}
          onClick={onClose}
        >
          Add to Collection
        </button>
      )}
    </div>
  );
}
