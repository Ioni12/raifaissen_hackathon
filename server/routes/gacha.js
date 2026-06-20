const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const cosmeticsCatalog = require("../config/cosmeticsCatalog");

// Helper function to perform a pull
const performPull = (pool, pityCounter) => {
  const rand = Math.random();
  let tier;

  // Pity system: guarantee legendary at 100 pulls, ultra at 50
  if (pityCounter >= 99) {
    tier = "legendary";
  } else if (pityCounter >= 49 && rand < 0.5) {
    tier = "ultra_rare";
  } else {
    // Normal rates
    if (rand < 0.02) tier = "legendary";
    else if (rand < 0.1) tier = "ultra_rare";
    else if (rand < 0.3) tier = "rare";
    else tier = "common";
  }

  // Get cosmetics of the selected tier from the correct pool
  const poolCosmetics = cosmeticsCatalog[pool];
  const tierCosmetics = poolCosmetics.filter((c) => c.tier === tier);
  const selectedCosmetic =
    tierCosmetics[Math.floor(Math.random() * tierCosmetics.length)];

  return { cosmetic: selectedCosmetic, tier };
};

// POST /api/gacha/pull-multi — perform 10 pulls at once
router.post("/pull-multi", authMiddleware, async (req, res) => {
  try {
    const { pool = "app" } = req.body;
    const user = await User.findById(req.user._id);

    if (user.credits < 10) {
      return res.status(400).json({ message: "Not enough credits! Need 10." });
    }

    const pityKey =
      pool === "coupons" ? "pityCounterCoupons" : "pityCounterApp";
    const totalPullsKey =
      pool === "coupons" ? "totalPullsCoupons" : "totalPullsApp";
    const unlockedKey =
      pool === "coupons" ? "unlockedCoupons" : "unlockedCosmetics";

    user.credits -= 10;
    const results = [];

    for (let i = 0; i < 10; i++) {
      user[pityKey] += 1;
      user[totalPullsKey] += 1;
      const { cosmetic, tier } = performPull(pool, user[pityKey]);
      if (tier === "legendary" || tier === "ultra_rare") user[pityKey] = 0;
      user.pulls.unshift({
        cosmeticId: cosmetic.id,
        tier,
        pool,
        timestamp: new Date(),
      });
      if (!user[unlockedKey].includes(cosmetic.id))
        user[unlockedKey].push(cosmetic.id);
      results.push({ cosmetic, tier });
    }

    await user.save();

    res.json({
      results,
      pool,
      pityApp: user.pityCounterApp,
      pityCoupons: user.pityCounterCoupons,
      credits: user.credits,
      totalPullsApp: user.totalPullsApp,
      totalPullsCoupons: user.totalPullsCoupons,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/gacha/pull — perform a pull
router.post("/pull", authMiddleware, async (req, res) => {
  try {
    const { pool = "app" } = req.body; // default to 'app' if not specified
    const user = await User.findById(req.user._id);

    if (user.credits < 1) {
      return res.status(400).json({ message: "Not enough credits!" });
    }

    // Determine which pity counter to use
    const pityKey =
      pool === "coupons" ? "pityCounterCoupons" : "pityCounterApp";
    const totalPullsKey =
      pool === "coupons" ? "totalPullsCoupons" : "totalPullsApp";
    const unlockedKey =
      pool === "coupons" ? "unlockedCoupons" : "unlockedCosmetics";

    // Spend credit, increment pity and total pulls
    user.credits -= 1;
    user[pityKey] += 1;
    user[totalPullsKey] += 1;

    // Perform pull
    const { cosmetic, tier } = performPull(pool, user[pityKey]);

    // Reset pity if legendary or ultra rare
    if (tier === "legendary" || tier === "ultra_rare") {
      user[pityKey] = 0;
    }

    // Add to pulls history
    user.pulls.unshift({
      cosmeticId: cosmetic.id,
      tier: tier,
      pool: pool,
      timestamp: new Date(),
    });

    // Unlock if not already unlocked
    if (!user[unlockedKey].includes(cosmetic.id)) {
      user[unlockedKey].push(cosmetic.id);
    }

    await user.save();

    res.json({
      cosmetic,
      tier,
      pool,
      pityApp: user.pityCounterApp,
      pityCoupons: user.pityCounterCoupons,
      credits: user.credits,
      totalPullsApp: user.totalPullsApp,
      totalPullsCoupons: user.totalPullsCoupons,
      isNew: !user[unlockedKey].includes(cosmetic.id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/gacha/vault — get user's cosmetics, credits, pity
router.get("/vault", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      credits: user.credits,
      pityCounterApp: user.pityCounterApp,
      pityCounterCoupons: user.pityCounterCoupons,
      totalPullsApp: user.totalPullsApp,
      totalPullsCoupons: user.totalPullsCoupons,
      unlockedCosmetics: user.unlockedCosmetics,
      unlockedCoupons: user.unlockedCoupons,
      cosmeticsCatalog,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
