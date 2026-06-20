// Single source of truth for card skin visuals.
// Used by Dashboard (full card) and RewardsVault (MiniCard preview).

export const SKIN_CONFIG = {
  default: {
    bg: "linear-gradient(135deg, #FFD600 0%, #E6B800 100%)",
    text: "#0d111c",
    accent: "#0d111c",
    light: true, // determines text/icon colour on card
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
    borderColor: "#00e5ff",
  },
  border_gold_wave: {
    bg: "linear-gradient(135deg, #1c1600 0%, #1a1400 100%)",
    text: "#d4af37",
    accent: "#d4af37",
    borderColor: "#d4af37",
  },
  border_aurora: {
    bg: "linear-gradient(135deg, #0d0a2e 0%, #1a0a3e 100%)",
    text: "#ffffff",
    accent: "#7b68ee",
    borderColor: "#7b68ee",
  },
  skin_holographic: {
    bg: "linear-gradient(135deg, #ff0080 0%, #00e5ff 50%, #ff8c00 100%)",
    text: "#ffffff",
    accent: "#ffffff",
  },
};

export function getSkin(id) {
  return SKIN_CONFIG[id] || SKIN_CONFIG.default;
}
