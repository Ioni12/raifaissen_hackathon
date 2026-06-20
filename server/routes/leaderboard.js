const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Pull = require('../models/Pull');

// GET /api/leaderboard — friend leaderboard (NOT global)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friendIds = [...user.friends, user._id]; // include self

    const users = await User.find({ _id: { $in: friendIds } }).select(
      'name totalPulls currentStreak badges cohort activeTheme unlockedCosmetics'
    );

    // Count legendary pulls per user
    const legendaryPulls = await Pull.aggregate([
      { $match: { userId: { $in: friendIds }, tier: 'legendary' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    const legendaryMap = {};
    legendaryPulls.forEach((l) => {
      legendaryMap[l._id.toString()] = l.count;
    });

    // Count ultra-rare pulls per user
    const ultraRarePulls = await Pull.aggregate([
      { $match: { userId: { $in: friendIds }, tier: 'ultra_rare' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    const ultraRareMap = {};
    ultraRarePulls.forEach((u) => {
      ultraRareMap[u._id.toString()] = u.count;
    });

    // Build ranked list — score: legendary*100 + ultra_rare*10 + totalPulls
    const ranked = users
      .map((u) => {
        const uid = u._id.toString();
        const legendaryCount = legendaryMap[uid] || 0;
        const ultraRareCount = ultraRareMap[uid] || 0;
        const score = legendaryCount * 100 + ultraRareCount * 10 + u.totalPulls;
        return {
          id: uid,
          name: u.name,
          totalPulls: u.totalPulls,
          legendaryCount,
          ultraRareCount,
          streak: u.currentStreak,
          badges: u.badges,
          cohort: u.cohort,
          activeTheme: u.activeTheme,
          score,
          isSelf: uid === user._id.toString(),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    res.json({ leaderboard: ranked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
