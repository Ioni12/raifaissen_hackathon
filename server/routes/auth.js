const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Activity = require("../models/Activity");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine cohort (month + city)
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "long" });
    const year = now.getFullYear();
    const cohort = `Tirana · ${month} ${year}`;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      cohort,
      credits: 5, // start with 5 pulls
    });

    // Handle referral
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
        referrer.friends.push(user._id);
        referrer.credits += 5; // referral reward
        await referrer.save();
        user.friends.push(referrer._id);
      }
    }

    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        pityCounterApp: user.pityCounterApp,
        pityCounterCoupons: user.pityCounterCoupons,
        totalPullsApp: user.totalPullsApp,
        totalPullsCoupons: user.totalPullsCoupons,
        questProgress: user.questProgress,
        onboardingComplete: user.onboardingComplete,
        cohort: user.cohort,
        referralCode: user.referralCode,
        activeTheme: user.activeTheme,
        activeCardSkin: user.activeCardSkin,
        unlockedCosmetics: user.unlockedCosmetics,
        unlockedCoupons: user.unlockedCoupons,
        badges: user.badges,
        currentStreak: user.currentStreak,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        pityCounterApp: user.pityCounterApp,
        pityCounterCoupons: user.pityCounterCoupons,
        totalPullsApp: user.totalPullsApp,
        totalPullsCoupons: user.totalPullsCoupons,
        questProgress: user.questProgress,
        onboardingComplete: user.onboardingComplete,
        cohort: user.cohort,
        referralCode: user.referralCode,
        activeTheme: user.activeTheme,
        activeCardSkin: user.activeCardSkin,
        unlockedCosmetics: user.unlockedCosmetics,
        unlockedCoupons: user.unlockedCoupons,
        badges: user.badges,
        currentStreak: user.currentStreak,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", require("../middleware/auth"), async (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/cosmetic — activate unlocked skin or theme
router.post("/cosmetic", require("../middleware/auth"), async (req, res) => {
  try {
    const { type, id } = req.body;
    const user = await User.findById(req.user._id);

    if (id !== "default" && !user.unlockedCosmetics.includes(id)) {
      return res.status(403).json({ message: "Cosmetic not unlocked yet" });
    }

    if (type === "skin") {
      user.activeCardSkin = id;
    } else if (type === "theme") {
      user.activeTheme = id;
    } else {
      return res.status(400).json({ message: "Invalid cosmetic type" });
    }

    await user.save();
    res.json({
      message: "Nice! Your card now matches your style.",
      activeTheme: user.activeTheme,
      activeCardSkin: user.activeCardSkin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
