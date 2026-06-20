import { useRef, useEffect, useState } from "react";
import { Gem, Hexagon, Square, Trophy } from "lucide-react";

const REVEAL_THRESHOLD = 0.55;

const TIER_COLORS = {
  common: "var(--tier-common)",
  rare: "var(--tier-rare)",
  ultra_rare: "var(--tier-ultra)",
  legendary: "var(--tier-legendary)",
  bonus: "var(--accent)",
};

const TIER_ICONS = {
  common: Square,
  rare: Hexagon,
  ultra_rare: Gem,
  legendary: Trophy,
  bonus: null,
};

export default function ScratchCard({
  reward,
  width = 96,
  height = 128,
  onRevealed,
}) {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);
  const scratchingRef = useRef(false);
  // Keep latest callbacks in refs so the passive touch listeners never go stale
  const onRevealedRef = useRef(onRevealed);
  useEffect(() => {
    onRevealedRef.current = onRevealed;
  }, [onRevealed]);

  const isBonus = reward?.type === "bonus";
  const tier = isBonus ? "bonus" : (reward?.tier ?? "common");
  const tierColor = TIER_COLORS[tier] || "var(--text-muted)";
  const TierIcon = TIER_ICONS[tier];

  // Draw scratch-off overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#c8a800";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    for (let i = -height; i < width; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.font = `bold ${Math.floor(width * 0.13)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH", width / 2, height / 2);
  }, [width, height]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  };

  const doScratch = (e) => {
    if (revealedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // Check how much has been cleared
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }
    if (transparent / (canvas.width * canvas.height) >= REVEAL_THRESHOLD) {
      revealedRef.current = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setRevealed(true);
      onRevealedRef.current?.();
    }
  };

  // Register touch listeners as non-passive (must be done via addEventListener)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e) => {
      e.preventDefault();
      scratchingRef.current = true;
      doScratch(e);
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (!scratchingRef.current) return;
      doScratch(e);
    };
    const onTouchEnd = () => {
      scratchingRef.current = false;
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mouse handlers (React synthetic events are fine here)
  const onMouseDown = (e) => {
    scratchingRef.current = true;
    doScratch(e);
  };
  const onMouseMove = (e) => {
    if (!scratchingRef.current) return;
    doScratch(e);
  };
  const onMouseUp = () => {
    scratchingRef.current = false;
  };

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: `2px solid ${revealed ? tierColor : "var(--border)"}`,
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        boxShadow: revealed ? `0 0 12px ${tierColor}40` : "none",
        flexShrink: 0,
      }}
    >
      {/* Reward layer (behind the canvas) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--bg-elevated)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: 10,
          textAlign: "center",
        }}
      >
        {isBonus ? (
          <>
            <span style={{ fontSize: "1.6rem" }}>🪙</span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1rem",
                color: tierColor,
              }}
            >
              +{reward.credits}
            </span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
              Bonus Credits
            </span>
          </>
        ) : (
          <>
            {TierIcon && <TierIcon size={22} color={tierColor} />}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "0.7rem",
                color: tierColor,
                textTransform: "capitalize",
              }}
            >
              {tier.replace("_", " ")}
            </span>
            <span
              style={{
                fontSize: "0.65rem",
                color: "var(--text-secondary)",
                lineHeight: 1.3,
              }}
            >
              {reward?.label || "Reward"}
            </span>
          </>
        )}
      </div>

      {/* Scratch canvas overlay */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: "absolute",
          inset: 0,
          cursor: revealed ? "default" : "crosshair",
          touchAction: "none",
          display: revealed ? "none" : "block",
          borderRadius: "var(--radius-lg)",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />
    </div>
  );
}
