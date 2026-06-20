const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const Activity = require("../models/Activity");

// Quest definitions — the 5 real KYC steps reframed
const QUESTS = [
  {
    id: "email_verified",
    label: "Verify Your Email",
    xp: 5,
    field: "emailVerified",
    credits: 1,
  },
  {
    id: "phone_verified",
    label: "Add Your Phone",
    xp: 5,
    field: "phoneVerified",
    credits: 1,
  },
  {
    id: "id_uploaded",
    label: "Scan Your ID Card",
    xp: 10,
    field: "idUploaded",
    credits: 2,
  },
  {
    id: "address_confirmed",
    label: "Confirm Your Address",
    xp: 5,
    field: "addressConfirmed",
    credits: 1,
  },
  { id: "pin_set", label: "Set Your PIN", xp: 5, field: "pinSet", credits: 1 },
];

// GET /api/quests — get quest list with user progress
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const progress = user.questProgress;

    const quests = QUESTS.map((q) => ({
      ...q,
      completed: !!progress[q.field],
    }));

    const completedCount = quests.filter((q) => q.completed).length;
    const totalCount = quests.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    res.json({
      quests,
      completedCount,
      totalCount,
      progressPercent,
      onboardingComplete: user.onboardingComplete,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/quests/:id/complete — mark a quest complete
router.post("/:id/complete", authMiddleware, async (req, res) => {
  try {
    const quest = QUESTS.find((q) => q.id === req.params.id);
    if (!quest) return res.status(404).json({ message: "Quest not found" });

    const user = await User.findById(req.user._id);

    if (user.questProgress[quest.field]) {
      return res.status(409).json({ message: "Quest already completed" });
    }

    // Mark complete
    user.questProgress[quest.field] = true;
    user.credits += quest.credits;

    // Auto-generate social activity
    await Activity.create({
      userId: user._id,
      type: "quest_complete",
      payload: { questId: quest.id, questLabel: quest.label },
    });

    // Check if all quests done → onboarding complete
    const allDone = QUESTS.every((q) => user.questProgress[q.field]);
    if (allDone && !user.onboardingComplete) {
      user.onboardingComplete = true;
      user.onboardingCompletedAt = new Date();
      user.credits += 5; // bonus for completing all

      await Activity.create({
        userId: user._id,
        type: "onboarding_complete",
        payload: { questLabel: "All quests completed!" },
      });
    }

    await user.save();

    const completedCount = QUESTS.filter(
      (q) => user.questProgress[q.field],
    ).length;

    res.json({
      quest,
      credits: user.credits,
      completedCount,
      totalCount: QUESTS.length,
      progressPercent: Math.round((completedCount / QUESTS.length) * 100),
      onboardingComplete: user.onboardingComplete,
      justCompleted: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/quests/action — simulate banking actions
router.post("/action", authMiddleware, async (req, res) => {
  try {
    const { actionType } = req.body;
    const user = await User.findById(req.user._id);

    let creditsAdded = 0;
    let description = "";

    if (actionType === "transaction") {
      creditsAdded = 1;
      description = "Card transaction completed";
    } else if (actionType === "kuik") {
      creditsAdded = 1;
      description = "KUIK contact payment sent";
    } else if (actionType === "savings") {
      creditsAdded = 2;
      description = "Savings milestone reached";
    } else if (actionType === "referral") {
      creditsAdded = 5;
      description = "Friend signup referral";
    } else {
      return res.status(400).json({ message: "Invalid action type" });
    }

    user.credits += creditsAdded;

    // Handle streak update
    const today = new Date();
    const lastActivity = user.lastActivityDate
      ? new Date(user.lastActivityDate)
      : null;
    let streakUpdated = false;

    if (!lastActivity) {
      user.currentStreak = 1;
      user.lastActivityDate = today;
      streakUpdated = true;
    } else {
      const diffTime = Math.abs(today - lastActivity);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.currentStreak += 1;
        user.lastActivityDate = today;
        streakUpdated = true;
      } else if (diffDays > 1) {
        user.currentStreak = 1;
        user.lastActivityDate = today;
        streakUpdated = true;
      }
    }

    if (streakUpdated) {
      // Auto-generate streak activity for friends feed
      await Activity.create({
        userId: user._id,
        type: "streak",
        payload: { streakDays: user.currentStreak },
      });
    }

    await user.save();

    res.json({
      message: `${description}! Earned +${creditsAdded} credits.`,
      credits: user.credits,
      currentStreak: user.currentStreak,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
