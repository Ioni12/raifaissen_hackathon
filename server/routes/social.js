const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Activity = require('../models/Activity');

// GET /api/social/feed — friends-only activity feed
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friendIds = user.friends;

    // Include own activities + friends' activities
    const allUserIds = [user._id, ...friendIds];

    const activities = await Activity.find({
      userId: { $in: allUserIds },
      isVisible: true,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name cohort badges activeTheme activeCardSkin')
      .lean();

    // Annotate each activity with whether current user has reacted
    const annotated = activities.map((act) => ({
      ...act,
      myReaction: act.reactions?.find(
        (r) => r.userId?.toString() === req.user._id.toString()
      )?.emoji || null,
      reactionCounts: act.reactions?.reduce((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
        return acc;
      }, {}),
      isSelf: act.userId?._id?.toString() === req.user._id.toString(),
    }));

    res.json({ feed: annotated, friendCount: friendIds.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/social/react — react to an activity
router.post('/react', authMiddleware, async (req, res) => {
  try {
    const { activityId, emoji } = req.body;
    const validEmojis = ['🔥', '😤', '👑', '✨'];

    if (!validEmojis.includes(emoji))
      return res.status(400).json({ message: 'Invalid reaction' });

    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    // Toggle reaction
    const existingIndex = activity.reactions.findIndex(
      (r) => r.userId?.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      if (activity.reactions[existingIndex].emoji === emoji) {
        // Remove reaction (toggle off)
        activity.reactions.splice(existingIndex, 1);
      } else {
        // Change reaction
        activity.reactions[existingIndex].emoji = emoji;
      }
    } else {
      activity.reactions.push({ userId: req.user._id, emoji });
    }

    await activity.save();

    const reactionCounts = activity.reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});

    res.json({
      activityId,
      reactionCounts,
      myReaction:
        activity.reactions.find((r) => r.userId?.toString() === req.user._id.toString())?.emoji || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/social/friends — get friends list
router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'friends',
      'name cohort badges totalPulls currentStreak activeTheme'
    );

    res.json({ friends: user.friends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
