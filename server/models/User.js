const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: "" },
    password: { type: String, required: true },

    // Gamification
    credits: { type: Number, default: 5 },
    pityCounterApp: { type: Number, default: 0 }, // Pity for app cosmetics
    pityCounterCoupons: { type: Number, default: 0 }, // Pity for coupons
    totalPullsApp: { type: Number, default: 0 },
    totalPullsCoupons: { type: Number, default: 0 },
    badges: [{ type: String }],
    pulls: [{ type: mongoose.Schema.Types.Mixed }], // history of pulls
    unlockedCosmetics: {
      type: [String],
      default: () => ["default", "theme_chromatic"],
    }, // Unlocked app cosmetics
    unlockedCoupons: [{ type: String }], // Unlocked coupon IDs

    // Onboarding quest progress
    questProgress: {
      emailVerified: { type: Boolean, default: false },
      phoneVerified: { type: Boolean, default: false },
      idUploaded: { type: Boolean, default: false },
      addressConfirmed: { type: Boolean, default: false },
      pinSet: { type: Boolean, default: false },
    },
    onboardingComplete: { type: Boolean, default: false },
    onboardingCompletedAt: { type: Date },

    // Cohort identity (for legendary timestamping)
    cohort: { type: String, default: "" }, // e.g. "Tirana · June 2026"

    // Social / KUIK graph
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    referralCode: { type: String, unique: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Cosmetics unlocked
    activeTheme: { type: String, default: "default" },
    activeCardSkin: { type: String, default: "default" },

    // Streaks
    currentStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date },
  },
  { timestamps: true },
);

// Generate referral code before save
userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = `RY-${this.name
      .toUpperCase()
      .replace(/\s/g, "")
      .slice(0, 4)}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
