const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Type of auto-generated event
    type: {
      type: String,
      enum: ['pull', 'badge', 'quest_complete', 'onboarding_complete', 'streak', 'referral'],
      required: true,
    },

    // Payload — varies by type
    payload: {
      // For pull events
      pullId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pull' },
      tier: { type: String },
      rewardLabel: { type: String },
      rewardId: { type: String },

      // For badge events
      badgeId: { type: String },
      badgeLabel: { type: String },

      // For quest events
      questId: { type: String },
      questLabel: { type: String },

      // For streak events
      streakDays: { type: Number },

      // For referral events
      referredName: { type: String },
    },

    // Light reactions — no comments, no DMs
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String, enum: ['🔥', '😤', '👑', '✨'], default: '🔥' },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Visibility: only shown to friends (enforced at query level)
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
