const mongoose = require('mongoose');

// Reward definitions per tier
const REWARDS = {
  common: [
    { id: 'skin_navy', label: 'Navy Card Skin', description: 'Deep navy card color' },
    { id: 'skin_midnight', label: 'Midnight Card Skin', description: 'Pitch black card' },
    { id: 'skin_forest', label: 'Forest Card Skin', description: 'Dark forest green card' },
    { id: 'skin_crimson', label: 'Crimson Card Skin', description: 'Deep crimson card' },
  ],
  rare: [
    { id: 'border_neon', label: 'Neon Border', description: 'Animated neon glow border' },
    { id: 'border_gold_wave', label: 'Gold Wave', description: 'Animated gold wave border' },
    { id: 'border_aurora', label: 'Aurora Border', description: 'Northern lights animation' },
    { id: 'skin_holographic', label: 'Holographic Skin', description: 'Shimmering holo card' },
  ],
  ultra_rare: [
    { id: 'theme_neon_city', label: 'Neon City Theme', description: 'Cyan neon app-wide theme' },
    { id: 'theme_volcanic', label: 'Volcanic Theme', description: 'Deep red volcanic app-wide theme' },
    { id: 'theme_arctic', label: 'Arctic Theme', description: 'Ice blue app-wide theme' },
    { id: 'theme_sakura', label: 'Sakura Theme', description: 'Cherry blossom pink app-wide theme' },
  ],
  legendary: [
    {
      id: 'legendary_tirana_founding',
      label: 'Tirana Founding Badge',
      description: 'Tirana · June 2026 — First cohort badge. Permanently exclusive.',
    },
    {
      id: 'legendary_pyramid',
      label: 'Pyramid of Tirana Theme',
      description: 'App-wide Pyramid of Tirana collab theme. Limited to founding cohort.',
    },
  ],
};

const pullSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tier: {
      type: String,
      enum: ['common', 'rare', 'ultra_rare', 'legendary'],
      required: true,
    },
    rewardId: { type: String, required: true },
    rewardLabel: { type: String, required: true },
    rewardDescription: { type: String, default: '' },
    pityCounterAtPull: { type: Number, default: 0 }, // counter value when this pull happened
    source: {
      type: String,
      enum: ['onboarding_first', 'onboarding_mid', 'onboarding_complete', 'legendary_signup', 'vault', 'referral'],
      default: 'vault',
    },
    isNew: { type: Boolean, default: true }, // for "new" badge in feed
  },
  { timestamps: true }
);

pullSchema.statics.REWARDS = REWARDS;

module.exports = mongoose.model('Pull', pullSchema);
